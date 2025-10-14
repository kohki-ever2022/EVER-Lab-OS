// src/adapters/FirebaseAdapter.ts

// Firebase Firestoreの関数をインポート
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  QuerySnapshot,
  DocumentData,
  Firestore, // 型としてインポート
  Unsubscribe,
  Timestamp, // Timestampの型をインポート
  orderBy,
  runTransaction,
  serverTimestamp,
  increment,
  DocumentReference,
} from 'firebase/firestore';

// 実際のFirebase設定ファイルからdbインスタンスをインポート
import { db } from '../firebase';

// 必要な型定義とインターフェースをインポート
import {
  User,
  Company,
  Announcement,
  Equipment,
  Reservation,
  Usage,
  MaintenanceLog,
  ReservationStatus,
  Consumable,
  Order,
  Project,
  Task,
  LabNotebookEntry,
  Certificate,
  SDS,
  Ticket,
  RegulatoryRequirement,
  InsuranceCertificate,
  MonthlyReport,
  ChatRoom,
  ChatMessage,
  Invoice,
  Result,
} from '../types';
import { IDataAdapter } from './IDataAdapter';


// Collection Names
const USERS_COLLECTION = 'users';
const COMPANIES_COLLECTION = 'companies';
const EQUIPMENT_COLLECTION = 'equipment';
const RESERVATIONS_COLLECTION = 'reservations';
const USAGE_COLLECTION = 'usage';
const CONSUMABLES_COLLECTION = 'consumables';
const ORDERS_COLLECTION = 'orders';
const PROJECTS_COLLECTION = 'projects';
const TASKS_COLLECTION = 'tasks';
const LAB_NOTEBOOK_COLLECTION = 'labNotebookEntries';
const MAINTENANCE_LOGS_COLLECTION = 'maintenanceLogs';
const ANNOUNCEMENTS_COLLECTION = 'announcements';
const CERTIFICATES_COLLECTION = 'certificates';
const SDS_COLLECTION = 'sds';
const MONTHLY_REPORTS_COLLECTION = 'monthlyReports';
const TICKETS_COLLECTION = 'tickets';
const REGULATORY_REQUIREMENTS_COLLECTION = 'regulatoryRequirements';
const INSURANCE_CERTIFICATES_COLLECTION = 'insuranceCertificates';
const CHAT_ROOMS_COLLECTION = 'chatRooms';
const CHAT_MESSAGES_COLLECTION = 'messages';
const INVOICES_COLLECTION = 'invoices';


/**
 * Firebase Firestoreをデータソースとして使用するためのIDataAdapterの実装。
 * Firestoreの各コレクションへのCRUD操作とリアルタイム購読機能を提供する。
 *
 * 設計のポイント:
 * - 全ての非同期操作はResult<T, Error>型を返し、呼び出し元で成功/失敗のハンドリングを強制する。
 * - Firestoreとの通信エラーはtry-catchで捕捉し、エラーログを出力した上でResult.errorとして返す。
 * - 将来的に、指数バックオフなどのリトライロジックをtry-catch内に実装できる構造になっている。
 * - onSnapshotを使用してリアルタイムでのデータ更新を実現し、UIに即時反映させる。
 */
export class FirebaseAdapter implements IDataAdapter {

  // --- Firestoreデータ変換ヘルパー ---
  /**
   * FirestoreのQuerySnapshotをアプリケーションで利用可能なデータ配列に変換する。
   * FirestoreのTimestampをJSのDateオブジェクトに変換する処理もここで行う。
   * @param snapshot - FirestoreのQuerySnapshot
   * @returns {T[]} IDを含むデータオブジェクトの配列
   */
  private fromSnapshot<T>(snapshot: QuerySnapshot<DocumentData>): T[] {
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // FirestoreのTimestampをJavaScriptのDateに変換
      for (const key in data) {
        if (data[key] instanceof Timestamp) {
          data[key] = data[key].toDate();
        }
      }
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(0),
        updatedAt: data.updatedAt?.toDate() || new Date(0),
      } as T;
    });
  }

  private async getDocAndConvert<T>(docRef: DocumentReference): Promise<T> {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error('Document not found after operation');
    }
    const data = docSnap.data();
    for (const key in data) {
      if (data[key] instanceof Timestamp) {
        data[key] = (data[key] as Timestamp).toDate();
      }
    }
    return { id: docSnap.id, ...data } as T;
  }
  
  // --- Generic CRUD Helpers ---
  private async getGenericDocById<T>(collectionName: string, id: string): Promise<Result<T | null>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = doc(db, collectionName, id);
      const data = await this.getDocAndConvert<T>(docRef);
      return { success: true, data };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('no such document'))) {
        return { success: true, data: null };
      }
      console.error(`Error getting doc by id ${id} from ${collectionName}:`, error);
      return { success: false, error: error as Error };
    }
  }

  private async createGenericDoc<T>(collectionName: string, data: Omit<T, 'id'>): Promise<Result<T>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newItem = await this.getDocAndConvert<T>(docRef);
      return { success: true, data: newItem };
    } catch (error) {
      console.error(`Error creating doc in ${collectionName}:`, error);
      return { success: false, error: error as Error };
    }
  }

  private async updateGenericDoc<T extends { id: string }>(collectionName: string, item: T): Promise<Result<T>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = item;
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      return { success: true, data: item };
    } catch (error) {
      console.error(`Error updating doc ${item.id} in ${collectionName}:`, error);
      return { success: false, error: error as Error };
    }
  }

  private async deleteGenericDoc(collectionName: string, id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, collectionName, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting doc ${id} from ${collectionName}:`, error);
      return { success: false, error: error as Error };
    }
  }


  // --- User Operations ---
  async getUsers(): Promise<Result<User[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
      const users = this.fromSnapshot<User>(querySnapshot);
      return { success: true, data: users };
    } catch (error) {
      console.error('Error getting users:', error);
      return { success: false, error: error as Error };
    }
  }
  
  async getUserById(id: string): Promise<Result<User | null>> {
    return this.getGenericDocById<User>(USERS_COLLECTION, id);
  }

  async createUser(data: Omit<User, 'id'>): Promise<Result<User>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, USERS_COLLECTION), where("email", "==", data.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          return { success: false, error: new Error("Email already exists") };
      }

      const docRef = await addDoc(collection(db, USERS_COLLECTION), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
      });
      const newUser = await this.getDocAndConvert<User>(docRef);
      return { success: true, data: newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error as Error };
    }
  }

  async updateUser(user: User): Promise<Result<User>> {
    return this.updateGenericDoc<User>(USERS_COLLECTION, user);
  }

  async deleteUser(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(USERS_COLLECTION, id);
  }

  subscribeToUsers(callback: (data: User[]) => void): () => void {
    if (!db) {
        console.error("Firebase not configured. Cannot subscribe to users.");
        return () => {};
    }
    const q = query(collection(db, USERS_COLLECTION));
    const unsubscribe: Unsubscribe = onSnapshot(q,
      (snapshot) => {
        const data = this.fromSnapshot<User>(snapshot);
        callback(data);
      },
      (error) => {
        console.error('Error subscribing to users:', error);
      }
    );
    return unsubscribe;
  }

  // --- Company Operations ---
  async getCompanies(): Promise<Result<Company[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const querySnapshot = await getDocs(collection(db, COMPANIES_COLLECTION));
      const data = this.fromSnapshot<Company>(querySnapshot);
      return { success: true, data };
    } catch (error) {
      console.error('Error getting companies:', error);
      return { success: false, error: error as Error };
    }
  }
  async getCompanyById(id: string): Promise<Result<Company | null>> {
    return this.getGenericDocById<Company>(COMPANIES_COLLECTION, id);
  }
  async createCompany(data: Omit<Company, 'id'>): Promise<Result<Company>> {
    return this.createGenericDoc<Company>(COMPANIES_COLLECTION, data);
  }
  async updateCompany(company: Company): Promise<Result<Company>> {
    return this.updateGenericDoc<Company>(COMPANIES_COLLECTION, company);
  }
  async deleteCompany(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(COMPANIES_COLLECTION, id);
  }
  subscribeToCompanies(callback: (data: Company[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, COMPANIES_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<Company>(snapshot));
    }, (error) => console.error('Error subscribing to companies:', error));
  }

  // --- Equipment Operations ---
  async getEquipmentList(): Promise<Result<Equipment[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const querySnapshot = await getDocs(collection(db, EQUIPMENT_COLLECTION));
      const equipmentList = this.fromSnapshot<Equipment>(querySnapshot);
      return { success: true, data: equipmentList };
    } catch (error) {
      console.error('Error getting equipment list:', error);
      return { success: false, error: error as Error };
    }
  }
  async getEquipmentById(id: string): Promise<Result<Equipment | null>> {
    return this.getGenericDocById<Equipment>(EQUIPMENT_COLLECTION, id);
  }
  async createEquipment(data: Omit<Equipment, 'id'>): Promise<Result<Equipment>> {
    return this.createGenericDoc<Equipment>(EQUIPMENT_COLLECTION, data);
  }
  async updateEquipment(equipment: Equipment): Promise<Result<Equipment>> {
    return this.updateGenericDoc<Equipment>(EQUIPMENT_COLLECTION, equipment);
  }
  async deleteEquipment(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(EQUIPMENT_COLLECTION, id);
  }
  subscribeToEquipment(callback: (data: Equipment[]) => void): () => void {
    if (!db) {
        console.error("Firebase not configured. Cannot subscribe to equipment.");
        return () => {};
    }
    const q = query(collection(db, EQUIPMENT_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<Equipment>(snapshot));
    }, (error) => console.error('Error subscribing to equipment:', error));
  }

  // --- Reservation Operations ---
  async getReservations(): Promise<Result<Reservation[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, RESERVATIONS_COLLECTION), orderBy('startTime', 'desc'));
      const snapshot = await getDocs(q);
      const data = this.fromSnapshot<Reservation>(snapshot);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return { success: false, error: error as Error };
    }
  }
  async getReservationById(id: string): Promise<Result<Reservation | null>> {
    return this.getGenericDocById<Reservation>(RESERVATIONS_COLLECTION, id);
  }
  async createReservation(data: Omit<Reservation, 'id'>): Promise<Result<Reservation>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, RESERVATIONS_COLLECTION),
          where("equipmentId", "==", data.equipmentId),
          where("status", "!=", ReservationStatus.Cancelled)
      );
      const querySnapshot = await getDocs(q);
      const reservations = this.fromSnapshot<Reservation>(querySnapshot);
      const overlapping = reservations.some(r => 
          (data.startTime >= r.startTime && data.startTime < r.endTime) ||
          (data.endTime > r.startTime && data.endTime <= r.endTime) ||
          (data.startTime <= r.startTime && data.endTime >= r.endTime)
      );
      if (overlapping) {
          return { success: false, error: new Error('Overlapping reservation exists.') };
      }
      return this.createGenericDoc<Reservation>(RESERVATIONS_COLLECTION, data);
    } catch (error) {
      console.error('Error creating reservation:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateReservation(reservation: Reservation): Promise<Result<Reservation>> {
    return this.updateGenericDoc<Reservation>(RESERVATIONS_COLLECTION, reservation);
  }
  async deleteReservation(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(RESERVATIONS_COLLECTION, id);
  }
  subscribeToReservations(callback: (data: Reservation[]) => void): () => void {
    if (!db) {
        console.error("Firebase not configured. Cannot subscribe to reservations.");
        return () => {};
    }
    const q = query(collection(db, RESERVATIONS_COLLECTION));
    return onSnapshot(q, 
      (snapshot) => {
        const reservations = this.fromSnapshot<Reservation>(snapshot);
        callback(reservations);
      },
      (error) => {
        console.error('Error subscribing to reservations:', error);
      }
    );
  }
  
  // --- Usage Operations ---
  async getUsages(): Promise<Result<Usage[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const querySnapshot = await getDocs(collection(db, USAGE_COLLECTION));
      const data = this.fromSnapshot<Usage>(querySnapshot);
      return { success: true, data };
    } catch (error) {
      console.error('Error getting usages:', error);
      return { success: false, error: error as Error };
    }
  }
  async getUsageById(id: string): Promise<Result<Usage | null>> {
    return this.getGenericDocById<Usage>(USAGE_COLLECTION, id);
  }
  async createUsage(data: Omit<Usage, 'id'>): Promise<Result<Usage>> {
    return this.createGenericDoc<Usage>(USAGE_COLLECTION, data);
  }
  async updateUsage(usage: Usage): Promise<Result<Usage>> {
    return this.updateGenericDoc<Usage>(USAGE_COLLECTION, usage);
  }
  async deleteUsage(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(USAGE_COLLECTION, id);
  }
  subscribeToUsages(callback: (data: Usage[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, USAGE_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<Usage>(snapshot));
    }, (error) => console.error('Error subscribing to usages:', error));
  }

  // --- Consumable Operations ---
  async getConsumables(): Promise<Result<Consumable[]>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, CONSUMABLES_COLLECTION));
      const snapshot = await getDocs(q);
      const data = this.fromSnapshot<Consumable>(snapshot);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching consumables:', error);
      return { success: false, error: error as Error };
    }
  }
  async getConsumableById(id: string): Promise<Result<Consumable | null>> { 
    return this.getGenericDocById<Consumable>(CONSUMABLES_COLLECTION, id);
  }
  async createConsumable(data: Omit<Consumable, 'id'>): Promise<Result<Consumable>> { 
    return this.createGenericDoc<Consumable>(CONSUMABLES_COLLECTION, data);
  }
  async updateConsumable(consumable: Consumable): Promise<Result<Consumable>> { 
    return this.updateGenericDoc<Consumable>(CONSUMABLES_COLLECTION, consumable);
  }
  async deleteConsumable(id: string): Promise<Result<void>> { 
    return this.deleteGenericDoc(CONSUMABLES_COLLECTION, id);
  }
  subscribeToConsumables(callback: (data: Consumable[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, CONSUMABLES_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<Consumable>(snapshot));
    }, (error) => console.error('Error subscribing to consumables:', error));
  }
  
  // --- Order Operations ---
  async getOrders(): Promise<Result<Order[]>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, ORDERS_COLLECTION), orderBy('orderDate', 'desc'));
      const snapshot = await getDocs(q);
      return { success: true, data: this.fromSnapshot<Order>(snapshot) };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error as Error };
    }
  }
  async getOrderById(id: string): Promise<Result<Order | null>> { 
    return this.getGenericDocById<Order>(ORDERS_COLLECTION, id);
  }
  async createOrder(data: Omit<Order, 'id'>): Promise<Result<Order>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const consumableRef = doc(db, CONSUMABLES_COLLECTION, data.consumableId);
      const newDocRef = await runTransaction(db, async (transaction) => {
          const consumableDoc = await transaction.get(consumableRef);
          if (!consumableDoc.exists()) {
              throw new Error("Consumable not found");
          }
          const consumableData = consumableDoc.data() as Consumable;
          if (consumableData.stock < data.quantity) {
              throw new Error("Insufficient stock");
          }
          if (consumableData.isLocked) {
              throw new Error("Inventory is locked");
          }
          transaction.update(consumableRef, { stock: increment(-data.quantity) });
          const newOrderRef = doc(collection(db, ORDERS_COLLECTION));
          transaction.set(newOrderRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          return newOrderRef;
      });
      const newOrder = await this.getDocAndConvert<Order>(newDocRef);
      return { success: true, data: newOrder };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateOrder(order: Order): Promise<Result<Order>> { 
    return this.updateGenericDoc<Order>(ORDERS_COLLECTION, order);
  }
  async deleteOrder(id: string): Promise<Result<void>> { 
    return this.deleteGenericDoc(ORDERS_COLLECTION, id);
  }
  subscribeToOrders(callback: (data: Order[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, ORDERS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<Order>(snapshot));
    }, (error) => console.error('Error subscribing to orders:', error));
  }
  
  // --- Project Operations ---
  async getProjects(): Promise<Result<Project[]>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
      return { success: true, data: this.fromSnapshot<Project>(snapshot) };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { success: false, error: error as Error };
    }
  }
  async getProjectById(id: string): Promise<Result<Project | null>> { 
    return this.getGenericDocById<Project>(PROJECTS_COLLECTION, id);
  }
  async createProject(data: Omit<Project, 'id'>): Promise<Result<Project>> { 
    return this.createGenericDoc<Project>(PROJECTS_COLLECTION, data);
  }
  async updateProject(project: Project): Promise<Result<Project>> { 
    return this.updateGenericDoc<Project>(PROJECTS_COLLECTION, project);
  }
  async deleteProject(id: string): Promise<Result<void>> { 
    return this.deleteGenericDoc(PROJECTS_COLLECTION, id);
  }
  subscribeToProjects(callback: (data: Project[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, PROJECTS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<Project>(snapshot));
    }, (error) => console.error('Error subscribing to projects:', error));
  }

  // --- Task Operations ---
  async getTasks(): Promise<Result<Task[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const snapshot = await getDocs(collection(db, TASKS_COLLECTION));
      return { success: true, data: this.fromSnapshot<Task>(snapshot) };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { success: false, error: error as Error };
    }
  }
  subscribeToTasks(callback: (data: Task[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, TASKS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<Task>(snapshot));
    }, (error) => console.error('Error subscribing to tasks:', error));
  }
  async createTask(data: Omit<Task, 'id'>): Promise<Result<Task>> {
    return this.createGenericDoc<Task>(TASKS_COLLECTION, data);
  }
  async updateTask(task: Task): Promise<Result<Task>> {
    return this.updateGenericDoc<Task>(TASKS_COLLECTION, task);
  }
  async deleteTask(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(TASKS_COLLECTION, id);
  }
  
  // --- Lab Notebook Operations ---
  async getLabNotebookEntries(): Promise<Result<LabNotebookEntry[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, LAB_NOTEBOOK_COLLECTION), orderBy('experimentDate', 'desc'));
      const snapshot = await getDocs(q);
      return { success: true, data: this.fromSnapshot<LabNotebookEntry>(snapshot) };
    } catch (error) {
      console.error('Error fetching lab notebook entries:', error);
      return { success: false, error: error as Error };
    }
  }
  async createLabNotebookEntry(data: Omit<LabNotebookEntry, 'id'>): Promise<Result<LabNotebookEntry>> {
    return this.createGenericDoc<LabNotebookEntry>(LAB_NOTEBOOK_COLLECTION, data);
  }
  async updateLabNotebookEntry(entry: LabNotebookEntry): Promise<Result<LabNotebookEntry>> {
    return this.updateGenericDoc<LabNotebookEntry>(LAB_NOTEBOOK_COLLECTION, entry);
  }
  async deleteLabNotebookEntry(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(LAB_NOTEBOOK_COLLECTION, id);
  }
  subscribeToLabNotebookEntries(callback: (data: LabNotebookEntry[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, LAB_NOTEBOOK_COLLECTION), orderBy('experimentDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<LabNotebookEntry>(snapshot));
    }, (error) => console.error('Error subscribing to lab notebook entries:', error));
  }

  // --- MaintenanceLog Operations ---
  async getMaintenanceLogs(): Promise<Result<MaintenanceLog[]>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, MAINTENANCE_LOGS_COLLECTION), orderBy('reportDate', 'desc'));
      const snapshot = await getDocs(q);
      return { success: true, data: this.fromSnapshot<MaintenanceLog>(snapshot) };
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
      return { success: false, error: error as Error };
    }
  }
  async getMaintenanceLogById(id: string): Promise<Result<MaintenanceLog | null>> { 
    return this.getGenericDocById<MaintenanceLog>(MAINTENANCE_LOGS_COLLECTION, id);
  }
  async createMaintenanceLog(data: Omit<MaintenanceLog, 'id'>): Promise<Result<MaintenanceLog>> { 
    return this.createGenericDoc<MaintenanceLog>(MAINTENANCE_LOGS_COLLECTION, data);
  }
  async updateMaintenanceLog(log: MaintenanceLog): Promise<Result<MaintenanceLog>> { 
    return this.updateGenericDoc<MaintenanceLog>(MAINTENANCE_LOGS_COLLECTION, log);
  }
  async deleteMaintenanceLog(id: string): Promise<Result<void>> { 
    return this.deleteGenericDoc(MAINTENANCE_LOGS_COLLECTION, id);
  }
  subscribeToMaintenanceLogs(callback: (data: MaintenanceLog[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, MAINTENANCE_LOGS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<MaintenanceLog>(snapshot));
    }, (error) => console.error('Error subscribing to maintenance logs:', error));
  }
  
  // --- Announcement Operations ---
  async getAnnouncements(): Promise<Result<Announcement[]>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), orderBy('startDate', 'desc'));
      const snapshot = await getDocs(q);
      return { success: true, data: this.fromSnapshot<Announcement>(snapshot) };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return { success: false, error: error as Error };
    }
  }
  async getAnnouncementById(id: string): Promise<Result<Announcement | null>> { 
    return this.getGenericDocById<Announcement>(ANNOUNCEMENTS_COLLECTION, id);
  }
  async createAnnouncement(data: Omit<Announcement, 'id'>): Promise<Result<Announcement>> { 
    return this.createGenericDoc<Announcement>(ANNOUNCEMENTS_COLLECTION, data);
  }
  async updateAnnouncement(announcement: Announcement): Promise<Result<Announcement>> { 
    return this.updateGenericDoc<Announcement>(ANNOUNCEMENTS_COLLECTION, announcement);
  }
  async deleteAnnouncement(id: string): Promise<Result<void>> { 
    return this.deleteGenericDoc(ANNOUNCEMENTS_COLLECTION, id);
  }
  subscribeToAnnouncements(callback: (data: Announcement[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, ANNOUNCEMENTS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<Announcement>(snapshot));
    }, (error) => console.error('Error subscribing to announcements:', error));
  }

  // --- Certificate Operations ---
  async getCertificates(): Promise<Result<Certificate[]>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const snapshot = await getDocs(collection(db, CERTIFICATES_COLLECTION));
      return { success: true, data: this.fromSnapshot<Certificate>(snapshot) };
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return { success: false, error: error as Error };
    }
  }
  async getCertificateById(id: string): Promise<Result<Certificate | null>> { 
    return this.getGenericDocById<Certificate>(CERTIFICATES_COLLECTION, id);
  }
  async createCertificate(data: Omit<Certificate, 'id'>): Promise<Result<Certificate>> { 
    return this.createGenericDoc<Certificate>(CERTIFICATES_COLLECTION, data);
  }
  async updateCertificate(certificate: Certificate): Promise<Result<Certificate>> { 
    return this.updateGenericDoc<Certificate>(CERTIFICATES_COLLECTION, certificate);
  }
  async deleteCertificate(id: string): Promise<Result<void>> { 
    return this.deleteGenericDoc(CERTIFICATES_COLLECTION, id);
  }
  subscribeToCertificates(callback: (data: Certificate[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, CERTIFICATES_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<Certificate>(snapshot));
    }, (error) => console.error('Error subscribing to certificates:', error));
  }
  
  // --- SDS Operations ---
  async getSdsList(): Promise<Result<SDS[]>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const snapshot = await getDocs(collection(db, SDS_COLLECTION));
      return { success: true, data: this.fromSnapshot<SDS>(snapshot) };
    } catch (error) {
      console.error('Error fetching SDS list:', error);
      return { success: false, error: error as Error };
    }
  }
  async getSdsById(id: string): Promise<Result<SDS | null>> { 
    return this.getGenericDocById<SDS>(SDS_COLLECTION, id);
  }
  async createSds(data: Omit<SDS, 'id'>): Promise<Result<SDS>> { 
    return this.createGenericDoc<SDS>(SDS_COLLECTION, data);
  }
  async updateSds(sds: SDS): Promise<Result<SDS>> { 
    return this.updateGenericDoc<SDS>(SDS_COLLECTION, sds);
  }
  async deleteSds(id: string): Promise<Result<void>> { 
    return this.deleteGenericDoc(SDS_COLLECTION, id);
  }
  subscribeToSds(callback: (data: SDS[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, SDS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<SDS>(snapshot));
    }, (error) => console.error('Error subscribing to SDS list:', error));
  }
  
  // --- Monthly Report Operations ---
  async getMonthlyReports(): Promise<Result<MonthlyReport[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, MONTHLY_REPORTS_COLLECTION), orderBy('generatedAt', 'desc'));
      const snapshot = await getDocs(q);
      return { success: true, data: this.fromSnapshot<MonthlyReport>(snapshot) };
    } catch (error) {
      console.error('Error fetching monthly reports:', error);
      return { success: false, error: error as Error };
    }
  }
  async createMonthlyReport(data: Omit<MonthlyReport, 'id'>): Promise<Result<MonthlyReport>> {
    return this.createGenericDoc<MonthlyReport>(MONTHLY_REPORTS_COLLECTION, data);
  }
  subscribeToMonthlyReports(callback: (data: MonthlyReport[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, MONTHLY_REPORTS_COLLECTION), orderBy('generatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(this.fromSnapshot<MonthlyReport>(snapshot));
    }, (error) => console.error('Error subscribing to monthly reports:', error));
  }
  
  // --- Ticket Operations ---
  async getTickets(): Promise<Result<Ticket[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const snapshot = await getDocs(collection(db, TICKETS_COLLECTION));
      return { success: true, data: this.fromSnapshot<Ticket>(snapshot) };
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return { success: false, error: error as Error };
    }
  }
  async getTicketById(id: string): Promise<Result<Ticket | null>> {
    return this.getGenericDocById<Ticket>(TICKETS_COLLECTION, id);
  }
  async createTicket(data: Omit<Ticket, 'id'>): Promise<Result<Ticket>> {
    return this.createGenericDoc<Ticket>(TICKETS_COLLECTION, data);
  }
  async updateTicket(ticket: Ticket): Promise<Result<Ticket>> {
    return this.updateGenericDoc<Ticket>(TICKETS_COLLECTION, ticket);
  }
  async deleteTicket(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(TICKETS_COLLECTION, id);
  }
  subscribeToTickets(callback: (data: Ticket[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, TICKETS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => callback(this.fromSnapshot<Ticket>(snapshot)),
      (error) => console.error('Error subscribing to tickets:', error));
  }

  // --- RegulatoryRequirement Operations ---
  async getRegulatoryRequirements(): Promise<Result<RegulatoryRequirement[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const snapshot = await getDocs(collection(db, REGULATORY_REQUIREMENTS_COLLECTION));
      return { success: true, data: this.fromSnapshot<RegulatoryRequirement>(snapshot) };
    } catch (error) {
      console.error('Error fetching regulatory requirements:', error);
      return { success: false, error: error as Error };
    }
  }
  async getRegulatoryRequirementById(id: string): Promise<Result<RegulatoryRequirement | null>> {
    return this.getGenericDocById<RegulatoryRequirement>(REGULATORY_REQUIREMENTS_COLLECTION, id);
  }
  async createRegulatoryRequirement(data: Omit<RegulatoryRequirement, 'id'>): Promise<Result<RegulatoryRequirement>> {
    return this.createGenericDoc<RegulatoryRequirement>(REGULATORY_REQUIREMENTS_COLLECTION, data);
  }
  async updateRegulatoryRequirement(req: RegulatoryRequirement): Promise<Result<RegulatoryRequirement>> {
    return this.updateGenericDoc<RegulatoryRequirement>(REGULATORY_REQUIREMENTS_COLLECTION, req);
  }
  async deleteRegulatoryRequirement(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(REGULATORY_REQUIREMENTS_COLLECTION, id);
  }
  subscribeToRegulatoryRequirements(callback: (data: RegulatoryRequirement[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, REGULATORY_REQUIREMENTS_COLLECTION));
    return onSnapshot(q, (snapshot) => callback(this.fromSnapshot<RegulatoryRequirement>(snapshot)),
      (error) => console.error('Error subscribing to regulatory requirements:', error));
  }

  // --- InsuranceCertificate Operations ---
  async getInsuranceCertificates(): Promise<Result<InsuranceCertificate[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const snapshot = await getDocs(collection(db, INSURANCE_CERTIFICATES_COLLECTION));
      return { success: true, data: this.fromSnapshot<InsuranceCertificate>(snapshot) };
    } catch (error) {
      console.error('Error fetching insurance certificates:', error);
      return { success: false, error: error as Error };
    }
  }
  async getInsuranceCertificateById(id: string): Promise<Result<InsuranceCertificate | null>> {
    return this.getGenericDocById<InsuranceCertificate>(INSURANCE_CERTIFICATES_COLLECTION, id);
  }
  async createInsuranceCertificate(data: Omit<InsuranceCertificate, 'id'>): Promise<Result<InsuranceCertificate>> {
    return this.createGenericDoc<InsuranceCertificate>(INSURANCE_CERTIFICATES_COLLECTION, data);
  }
  async updateInsuranceCertificate(cert: InsuranceCertificate): Promise<Result<InsuranceCertificate>> {
    return this.updateGenericDoc<InsuranceCertificate>(INSURANCE_CERTIFICATES_COLLECTION, cert);
  }
  async deleteInsuranceCertificate(id: string): Promise<Result<void>> {
    return this.deleteGenericDoc(INSURANCE_CERTIFICATES_COLLECTION, id);
  }
  subscribeToInsuranceCertificates(callback: (data: InsuranceCertificate[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, INSURANCE_CERTIFICATES_COLLECTION));
    return onSnapshot(q, (snapshot) => callback(this.fromSnapshot<InsuranceCertificate>(snapshot)),
      (error) => console.error('Error subscribing to insurance certificates:', error));
  }
  
  // --- Invoice Operations ---
  async createInvoice(data: Omit<Invoice, 'id'>): Promise<Result<Invoice>> {
    return this.createGenericDoc<Invoice>(INVOICES_COLLECTION, data);
  }
  async updateInvoice(invoice: Invoice): Promise<Result<Invoice>> {
    return this.updateGenericDoc<Invoice>(INVOICES_COLLECTION, invoice);
  }

  // --- Chat Operations ---
  async getChatRooms(userId: string): Promise<Result<ChatRoom[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, CHAT_ROOMS_COLLECTION), where('participantIds', 'array-contains', userId), orderBy('lastMessageAt', 'desc'));
      const snapshot = await getDocs(q);
      return { success: true, data: this.fromSnapshot<ChatRoom>(snapshot) };
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      return { success: false, error: error as Error };
    }
  }

  subscribeToChatRooms(userId: string, callback: (data: ChatRoom[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, CHAT_ROOMS_COLLECTION), where('participantIds', 'array-contains', userId), orderBy('lastMessageAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        callback(this.fromSnapshot<ChatRoom>(snapshot));
    }, (error) => console.error('Error subscribing to chat rooms:', error));
  }

  async createChatRoom(data: Omit<ChatRoom, 'id'>): Promise<Result<ChatRoom>> {
    return this.createGenericDoc<ChatRoom>(CHAT_ROOMS_COLLECTION, data);
  }
  
  async getChatMessages(roomId: string): Promise<Result<ChatMessage[]>> {
      if (!db) return { success: false, error: new Error("Firebase not configured.") };
      try {
          const messagesRef = collection(db, CHAT_ROOMS_COLLECTION, roomId, CHAT_MESSAGES_COLLECTION);
          const q = query(messagesRef, orderBy('createdAt', 'asc'));
          const snapshot = await getDocs(q);
          return { success: true, data: this.fromSnapshot<ChatMessage>(snapshot) };
      } catch (error) {
          console.error('Error getting chat messages:', error);
          return { success: false, error: error as Error };
      }
  }

  subscribeToChatMessages(roomId: string, callback: (data: ChatMessage[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); callback([]); return () => {}; }
    const messagesRef = collection(db, CHAT_ROOMS_COLLECTION, roomId, CHAT_MESSAGES_COLLECTION);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        callback(this.fromSnapshot<ChatMessage>(snapshot));
    }, (error) => console.error('Error subscribing to chat messages:', error));
  }

  async sendChatMessage(data: Omit<ChatMessage, 'id' | 'readBy'>): Promise<Result<ChatMessage>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const roomRef = doc(db, CHAT_ROOMS_COLLECTION, data.roomId);
      const messagesRef = collection(roomRef, CHAT_MESSAGES_COLLECTION);
      
      const { createdAt, ...restOfData } = data; // Exclude client-side timestamp
      const messageDataForFirestore = {
          ...restOfData,
          createdAt: serverTimestamp(),
          readBy: [data.senderId],
      };

      const newDocRef = await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) {
          throw new Error("Room does not exist!");
        }
        const roomData = roomDoc.data() as ChatRoom;

        const messageDoc = doc(messagesRef);
        transaction.set(messageDoc, messageDataForFirestore);

        const unreadUpdates: { [key: string]: any } = {};
        roomData.participantIds.forEach(pid => {
          if (pid !== data.senderId) {
            unreadUpdates[`unreadCount.${pid}`] = increment(1);
          }
        });

        transaction.update(roomRef, {
          lastMessage: data.content,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...unreadUpdates,
        });
        
        return messageDoc;
      });

      const finalDoc = await getDoc(newDocRef);
      const finalData = finalDoc.data();
      if (finalData) {
        for (const key in finalData) {
          if (finalData[key] instanceof Timestamp) {
            finalData[key] = (finalData[key] as Timestamp).toDate();
          }
        }
        return { success: true, data: { id: finalDoc.id, ...finalData } as ChatMessage };
      } else {
        throw new Error("Failed to retrieve sent message.");
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      return { success: false, error: error as Error };
    }
  }

  async markMessageAsRead(roomId: string, userId: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const roomRef = doc(db, CHAT_ROOMS_COLLECTION, roomId);
        await updateDoc(roomRef, {
            [`unreadCount.${userId}`]: 0
        });
        return { success: true, data: undefined };
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return { success: false, error: error as Error };
    }
  }
}