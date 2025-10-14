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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      const user = await this.getDocAndConvert<User>(docRef);
      return { success: true, data: user };
    } catch (error) {
      console.error(`Error getting user by id ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = user;
      const docRef = doc(db, USERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      return { success: true, data: user };
    } catch (error) {
      console.error(`Error updating user ${user.id}:`, error);
      return { success: false, error: error as Error };
    }
  }

  async deleteUser(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, COMPANIES_COLLECTION, id);
        const company = await this.getDocAndConvert<Company>(docRef);
        return { success: true, data: company };
    } catch (error) {
      console.error(`Error getting company by id ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createCompany(data: Omit<Company, 'id'>): Promise<Result<Company>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newCompany = await this.getDocAndConvert<Company>(docRef);
      return { success: true, data: newCompany };
    } catch (error) {
      console.error('Error creating company:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateCompany(company: Company): Promise<Result<Company>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const { id, ...updateData } = company;
        const docRef = doc(db, COMPANIES_COLLECTION, id);
        await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
        return { success: true, data: company };
    } catch (error) {
      console.error(`Error updating company ${company.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteCompany(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, COMPANIES_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = doc(db, EQUIPMENT_COLLECTION, id);
      const equipment = await this.getDocAndConvert<Equipment>(docRef);
      return { success: true, data: equipment };
    } catch (error) {
      console.error(`Error getting equipment by id ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createEquipment(data: Omit<Equipment, 'id'>): Promise<Result<Equipment>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, EQUIPMENT_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newEquipment = await this.getDocAndConvert<Equipment>(docRef);
      return { success: true, data: newEquipment };
    } catch (error) {
      console.error('Error creating equipment:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateEquipment(equipment: Equipment): Promise<Result<Equipment>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = equipment;
      const docRef = doc(db, EQUIPMENT_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: equipment };
    } catch (error) {
      console.error(`Error updating equipment ${equipment.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteEquipment(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, EQUIPMENT_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting equipment ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, RESERVATIONS_COLLECTION, id);
        const reservation = await this.getDocAndConvert<Reservation>(docRef);
        return { success: true, data: reservation };
    } catch (error) {
      console.error(`Error getting reservation by id ${id}:`, error);
      return { success: false, error: error as Error };
    }
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

      const docRef = await addDoc(collection(db, RESERVATIONS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newReservation = await this.getDocAndConvert<Reservation>(docRef);
      return { success: true, data: newReservation };
    } catch (error) {
      console.error('Error creating reservation:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateReservation(reservation: Reservation): Promise<Result<Reservation>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = reservation;
      const docRef = doc(db, RESERVATIONS_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: reservation };
    } catch (error) {
      console.error(`Error updating reservation ${reservation.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteReservation(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, RESERVATIONS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting reservation ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, USAGE_COLLECTION, id);
        const usage = await this.getDocAndConvert<Usage>(docRef);
        return { success: true, data: usage };
    } catch (error) {
      console.error(`Error getting usage by id ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createUsage(data: Omit<Usage, 'id'>): Promise<Result<Usage>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, USAGE_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newUsage = await this.getDocAndConvert<Usage>(docRef);
      return { success: true, data: newUsage };
    } catch (error) {
      console.error('Error creating usage:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateUsage(usage: Usage): Promise<Result<Usage>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = usage;
      const docRef = doc(db, USAGE_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: usage };
    } catch (error) {
      console.error(`Error updating usage ${usage.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteUsage(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, USAGE_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting usage ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = doc(db, CONSUMABLES_COLLECTION, id);
      const consumable = await this.getDocAndConvert<Consumable>(docRef);
      return { success: true, data: consumable };
    } catch (error) {
      console.error(`Error getting consumable ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createConsumable(data: Omit<Consumable, 'id'>): Promise<Result<Consumable>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, CONSUMABLES_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newConsumable = await this.getDocAndConvert<Consumable>(docRef);
      return { success: true, data: newConsumable };
    } catch (error) {
      console.error('Error creating consumable:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateConsumable(consumable: Consumable): Promise<Result<Consumable>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = consumable;
      const docRef = doc(db, CONSUMABLES_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: consumable };
    } catch (error) {
      console.error(`Error updating consumable ${consumable.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteConsumable(id: string): Promise<Result<void>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, CONSUMABLES_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting consumable ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, ORDERS_COLLECTION, id);
        const order = await this.getDocAndConvert<Order>(docRef);
        return { success: true, data: order };
    } catch (error) {
      console.error(`Error getting order ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = order;
      const docRef = doc(db, ORDERS_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: order };
    } catch (error) {
      console.error(`Error updating order ${order.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteOrder(id: string): Promise<Result<void>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, ORDERS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, PROJECTS_COLLECTION, id);
        const project = await this.getDocAndConvert<Project>(docRef);
        return { success: true, data: project };
    } catch (error) {
      console.error(`Error getting project ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createProject(data: Omit<Project, 'id'>): Promise<Result<Project>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newProject = await this.getDocAndConvert<Project>(docRef);
      return { success: true, data: newProject };
    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateProject(project: Project): Promise<Result<Project>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = project;
      const docRef = doc(db, PROJECTS_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: project };
    } catch (error) {
      console.error(`Error updating project ${project.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteProject(id: string): Promise<Result<void>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, TASKS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newTask = await this.getDocAndConvert<Task>(docRef);
      return { success: true, data: newTask };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateTask(task: Task): Promise<Result<Task>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = task;
      const docRef = doc(db, TASKS_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: task };
    } catch (error) {
      console.error(`Error updating task ${task.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteTask(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  // --- Lab Notebook Operations ---
  async createLabNotebookEntry(data: Omit<LabNotebookEntry, 'id'>): Promise<Result<LabNotebookEntry>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, LAB_NOTEBOOK_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newEntry = await this.getDocAndConvert<LabNotebookEntry>(docRef);
      return { success: true, data: newEntry };
    } catch (error) {
      console.error('Error creating lab notebook entry:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateLabNotebookEntry(entry: LabNotebookEntry): Promise<Result<LabNotebookEntry>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = entry;
      const docRef = doc(db, LAB_NOTEBOOK_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: entry };
    } catch (error) {
      console.error(`Error updating lab notebook entry ${entry.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteLabNotebookEntry(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, LAB_NOTEBOOK_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting lab notebook entry ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, MAINTENANCE_LOGS_COLLECTION, id);
        const log = await this.getDocAndConvert<MaintenanceLog>(docRef);
        return { success: true, data: log };
    } catch (error) {
      console.error(`Error getting maintenance log ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createMaintenanceLog(data: Omit<MaintenanceLog, 'id'>): Promise<Result<MaintenanceLog>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, MAINTENANCE_LOGS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newLog = await this.getDocAndConvert<MaintenanceLog>(docRef);
      return { success: true, data: newLog };
    } catch (error) {
      console.error('Error creating maintenance log:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateMaintenanceLog(log: MaintenanceLog): Promise<Result<MaintenanceLog>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = log;
      const docRef = doc(db, MAINTENANCE_LOGS_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: log };
    } catch (error) {
      console.error(`Error updating maintenance log ${log.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteMaintenanceLog(id: string): Promise<Result<void>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, MAINTENANCE_LOGS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting maintenance log ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
        const announcement = await this.getDocAndConvert<Announcement>(docRef);
        return { success: true, data: announcement };
    } catch (error) {
      console.error(`Error getting announcement ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createAnnouncement(data: Omit<Announcement, 'id'>): Promise<Result<Announcement>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newAnnouncement = await this.getDocAndConvert<Announcement>(docRef);
      return { success: true, data: newAnnouncement };
    } catch (error) {
      console.error('Error creating announcement:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateAnnouncement(announcement: Announcement): Promise<Result<Announcement>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = announcement;
      const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: announcement };
    } catch (error) {
      console.error(`Error updating announcement ${announcement.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteAnnouncement(id: string): Promise<Result<void>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting announcement ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, CERTIFICATES_COLLECTION, id);
        const certificate = await this.getDocAndConvert<Certificate>(docRef);
        return { success: true, data: certificate };
    } catch (error) {
      console.error(`Error getting certificate ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createCertificate(data: Omit<Certificate, 'id'>): Promise<Result<Certificate>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newCertificate = await this.getDocAndConvert<Certificate>(docRef);
      return { success: true, data: newCertificate };
    } catch (error) {
      console.error('Error creating certificate:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateCertificate(certificate: Certificate): Promise<Result<Certificate>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = certificate;
      const docRef = doc(db, CERTIFICATES_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: certificate };
    } catch (error) {
      console.error(`Error updating certificate ${certificate.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteCertificate(id: string): Promise<Result<void>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, CERTIFICATES_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting certificate ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, SDS_COLLECTION, id);
        const sds = await this.getDocAndConvert<SDS>(docRef);
        return { success: true, data: sds };
    } catch (error) {
      console.error(`Error getting SDS ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createSds(data: Omit<SDS, 'id'>): Promise<Result<SDS>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, SDS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newSds = await this.getDocAndConvert<SDS>(docRef);
      return { success: true, data: newSds };
    } catch (error) {
      console.error('Error creating SDS:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateSds(sds: SDS): Promise<Result<SDS>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = sds;
      const docRef = doc(db, SDS_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: sds };
    } catch (error) {
      console.error(`Error updating SDS ${sds.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteSds(id: string): Promise<Result<void>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, SDS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting SDS ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, MONTHLY_REPORTS_COLLECTION), data);
      const newReport = await this.getDocAndConvert<MonthlyReport>(docRef);
      return { success: true, data: newReport };
    } catch (error) {
      console.error('Error creating monthly report:', error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, TICKETS_COLLECTION, id);
        const ticket = await this.getDocAndConvert<Ticket>(docRef);
        return { success: true, data: ticket };
    } catch (error) {
      console.error(`Error getting ticket ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createTicket(data: Omit<Ticket, 'id'>): Promise<Result<Ticket>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, TICKETS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newTicket = await this.getDocAndConvert<Ticket>(docRef);
      return { success: true, data: newTicket };
    } catch (error) {
      console.error('Error creating ticket:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateTicket(ticket: Ticket): Promise<Result<Ticket>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = ticket;
      const docRef = doc(db, TICKETS_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: ticket };
    } catch (error) {
      console.error(`Error updating ticket ${ticket.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteTicket(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, TICKETS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, REGULATORY_REQUIREMENTS_COLLECTION, id);
        const req = await this.getDocAndConvert<RegulatoryRequirement>(docRef);
        return { success: true, data: req };
    } catch (error) {
      console.error(`Error getting regulatory requirement ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createRegulatoryRequirement(data: Omit<RegulatoryRequirement, 'id'>): Promise<Result<RegulatoryRequirement>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, REGULATORY_REQUIREMENTS_COLLECTION), { ...data, lastUpdated: serverTimestamp(), createdAt: serverTimestamp() });
      const newReq = await this.getDocAndConvert<RegulatoryRequirement>(docRef);
      return { success: true, data: newReq };
    } catch (error) {
      console.error('Error creating regulatory requirement:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateRegulatoryRequirement(req: RegulatoryRequirement): Promise<Result<RegulatoryRequirement>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = req;
      const docRef = doc(db, REGULATORY_REQUIREMENTS_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, lastUpdated: serverTimestamp() });
      return { success: true, data: req };
    } catch (error) {
      console.error(`Error updating regulatory requirement ${req.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteRegulatoryRequirement(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, REGULATORY_REQUIREMENTS_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting regulatory requirement ${id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        const docRef = doc(db, INSURANCE_CERTIFICATES_COLLECTION, id);
        const cert = await this.getDocAndConvert<InsuranceCertificate>(docRef);
        return { success: true, data: cert };
    } catch (error) {
      console.error(`Error getting insurance certificate ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async createInsuranceCertificate(data: Omit<InsuranceCertificate, 'id'>): Promise<Result<InsuranceCertificate>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, INSURANCE_CERTIFICATES_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newCert = await this.getDocAndConvert<InsuranceCertificate>(docRef);
      return { success: true, data: newCert };
    } catch (error) {
      console.error('Error creating insurance certificate:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateInsuranceCertificate(cert: InsuranceCertificate): Promise<Result<InsuranceCertificate>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = cert;
      const docRef = doc(db, INSURANCE_CERTIFICATES_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: cert };
    } catch (error) {
      console.error(`Error updating insurance certificate ${cert.id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  async deleteInsuranceCertificate(id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, INSURANCE_CERTIFICATES_COLLECTION, id));
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`Error deleting insurance certificate ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  subscribeToInsuranceCertificates(callback: (data: InsuranceCertificate[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, INSURANCE_CERTIFICATES_COLLECTION));
    return onSnapshot(q, (snapshot) => callback(this.fromSnapshot<InsuranceCertificate>(snapshot)),
      (error) => console.error('Error subscribing to insurance certificates:', error));
  }
  
  // --- Invoice Operations ---
  async createInvoice(data: Omit<Invoice, 'id'>): Promise<Result<Invoice>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, INVOICES_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newInvoice = await this.getDocAndConvert<Invoice>(docRef);
      return { success: true, data: newInvoice };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error: error as Error };
    }
  }
  async updateInvoice(invoice: Invoice): Promise<Result<Invoice>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = invoice;
      const docRef = doc(db, INVOICES_COLLECTION, id);
      await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: invoice };
    } catch (error) {
      console.error(`Error updating invoice ${invoice.id}:`, error);
      return { success: false, error: error as Error };
    }
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
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, CHAT_ROOMS_COLLECTION), data);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Document not found after creation');
      const docData = docSnap.data();
      for (const key in docData) { if (docData[key] instanceof Timestamp) docData[key] = (docData[key] as Timestamp).toDate(); }
      return { success: true, data: { id: docRef.id, ...docData } as ChatRoom };
    } catch (error) {
      console.error('Error creating chat room:', error);
      return { success: false, error: error as Error };
    }
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