// src/adapters/FirebaseAdapter.ts

// Firebase Firestoreの関数をインポート
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, QuerySnapshot, DocumentData, Timestamp, orderBy, runTransaction, serverTimestamp,
  increment, DocumentReference, FieldValue,
} from 'firebase/firestore';

// 実際のFirebase設定ファイルからdbインスタンスをインポート
import { db } from '../firebase';

// 必要な型定義とインターフェースをインポート
import {
  User, Company, Announcement, Equipment, Reservation, Usage, MaintenanceLog,
  Consumable, Order, Project, Task, LabNotebookEntry,
  Certificate, SDS, Ticket, RegulatoryRequirement, InsuranceCertificate,
  MonthlyReport, ChatRoom, ChatMessage, Invoice, Result,
} from '../types';
import { IDataAdapter } from './IDataAdapter';


// Collection Names
const COLLECTIONS = {
  USERS: 'users', COMPANIES: 'companies', EQUIPMENT: 'equipment', RESERVATIONS: 'reservations',
  USAGE: 'usage', CONSUMABLES: 'consumables', ORDERS: 'orders', PROJECTS: 'projects',
  TASKS: 'tasks', LAB_NOTEBOOK: 'labNotebookEntries', MAINTENANCE_LOGS: 'maintenanceLogs',
  ANNOUNCEMENTS: 'announcements', CERTIFICATES: 'certificates', SDS: 'sds',
  MONTHLY_REPORTS: 'monthlyReports', TICKETS: 'tickets', REGULATORY_REQUIREMENTS: 'regulatoryRequirements',
  INSURANCE_CERTIFICATES: 'insuranceCertificates', CHAT_ROOMS: 'chatRooms',
  CHAT_MESSAGES: 'messages', INVOICES: 'invoices',
};


export class FirebaseAdapter implements IDataAdapter {

  private fromSnapshot<T>(snapshot: QuerySnapshot<DocumentData>): T[] {
    return snapshot.docs.map(doc => this.docToData<T>(doc));
  }
  
  private docToData<T>(doc: DocumentData): T {
    const data = doc.data();
    for (const key in data) {
      if (data[key] instanceof Timestamp) data[key] = data[key].toDate();
    }
    return { id: doc.id, ...data } as T;
  }
  
  private async getDocAndConvert<T>(docRef: DocumentReference): Promise<T> {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error('Document not found after operation');
    return this.docToData<T>(docSnap);
  }

  // --- Generic CRUD Helpers ---
  private async getGenericCollection<T>(collectionName: string, order?: { field: string, direction?: 'asc' | 'desc' }): Promise<Result<T[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const collRef = collection(db, collectionName);
      const q = order ? query(collRef, orderBy(order.field, order.direction)) : query(collRef);
      const snapshot = await getDocs(q);
      return { success: true, data: this.fromSnapshot<T>(snapshot) };
    } catch (e) {
      console.error(`Error getting collection ${collectionName}:`, e);
      return { success: false, error: e as Error };
    }
  }

  private async getGenericDocById<T>(collectionName: string, id: string): Promise<Result<T | null>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return { success: true, data: null };
      return { success: true, data: this.docToData<T>(docSnap) };
    } catch (e) {
      console.error(`Error getting doc ${id} from ${collectionName}:`, e);
      return { success: false, error: e as Error };
    }
  }

  private async createGenericDoc<T extends object>(collectionName: string, data: Omit<T, 'id'>): Promise<Result<T>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const docRef = await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      const newItem = await this.getDocAndConvert<T>(docRef);
      return { success: true, data: newItem };
    } catch (e) {
      console.error(`Error creating doc in ${collectionName}:`, e);
      return { success: false, error: e as Error };
    }
  }

  private async updateGenericDoc<T extends { id: string }>(collectionName: string, item: T): Promise<Result<T>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const { id, ...updateData } = item;
      await updateDoc(doc(db, collectionName, id), { ...updateData, updatedAt: serverTimestamp() });
      return { success: true, data: item }; // Return optimistic data
    } catch (e) {
      console.error(`Error updating doc ${item.id} in ${collectionName}:`, e);
      return { success: false, error: e as Error };
    }
  }

  private async deleteGenericDoc(collectionName: string, id: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      await deleteDoc(doc(db, collectionName, id));
      return { success: true, data: undefined };
    } catch (e) {
      console.error(`Error deleting doc ${id} from ${collectionName}:`, e);
      return { success: false, error: e as Error };
    }
  }
  
  private subscribeToGenericCollection<T>(collectionName: string, callback: (data: T[]) => void, order?: { field: string, direction?: 'asc' | 'desc' }): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const collRef = collection(db, collectionName);
    const q = order ? query(collRef, orderBy(order.field, order.direction)) : query(collRef);
    return onSnapshot(q, (snapshot) => callback(this.fromSnapshot<T>(snapshot)), (e) => console.error(`Error subscribing to ${collectionName}:`, e));
  }

  // --- User Operations (custom logic for email check) ---
  getUsers = () => this.getGenericCollection<User>(COLLECTIONS.USERS);
  getUserById = (id: string) => this.getGenericDocById<User>(COLLECTIONS.USERS, id);
  updateUser = (user: User) => this.updateGenericDoc<User>(COLLECTIONS.USERS, user);
  deleteUser = (id: string) => this.deleteGenericDoc(COLLECTIONS.USERS, id);
  subscribeToUsers = (cb: (d: User[]) => void) => this.subscribeToGenericCollection<User>(COLLECTIONS.USERS, cb);

  async createUser(data: Omit<User, 'id'>): Promise<Result<User>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where("email", "==", data.email));
      if (!(await getDocs(q)).empty) return { success: false, error: new Error("Email already exists") };
      return this.createGenericDoc<User>(COLLECTIONS.USERS, data);
    } catch (e) {
      console.error('Error creating user:', e);
      return { success: false, error: e as Error };
    }
  }

  // --- Reservation Operations (custom logic for overlap check) ---
  getReservations = () => this.getGenericCollection<Reservation>(COLLECTIONS.RESERVATIONS, { field: 'startTime', direction: 'desc' });
  getReservationById = (id: string) => this.getGenericDocById<Reservation>(COLLECTIONS.RESERVATIONS, id);
  updateReservation = (res: Reservation) => this.updateGenericDoc<Reservation>(COLLECTIONS.RESERVATIONS, res);
  deleteReservation = (id: string) => this.deleteGenericDoc(COLLECTIONS.RESERVATIONS, id);
  subscribeToReservations = (cb: (d: Reservation[]) => void) => this.subscribeToGenericCollection<Reservation>(COLLECTIONS.RESERVATIONS, cb);

  async createReservation(data: Omit<Reservation, 'id'>): Promise<Result<Reservation>> {
    // Overlap validation is now handled in useReservationActions hook to ensure consistency.
    // This method is now just for data persistence. Firebase security rules should provide the definitive server-side validation.
    return this.createGenericDoc<Reservation>(COLLECTIONS.RESERVATIONS, data);
  }

  // --- Order Operations (custom logic for transaction) ---
  getOrders = () => this.getGenericCollection<Order>(COLLECTIONS.ORDERS, { field: 'orderDate', direction: 'desc' });
  getOrderById = (id: string) => this.getGenericDocById<Order>(COLLECTIONS.ORDERS, id);
  updateOrder = (order: Order) => this.updateGenericDoc<Order>(COLLECTIONS.ORDERS, order);
  deleteOrder = (id: string) => this.deleteGenericDoc(COLLECTIONS.ORDERS, id);
  subscribeToOrders = (cb: (d: Order[]) => void) => this.subscribeToGenericCollection<Order>(COLLECTIONS.ORDERS, cb);

  async createOrder(data: Omit<Order, 'id'>): Promise<Result<Order>> { 
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const consumableRef = doc(db, COLLECTIONS.CONSUMABLES, data.consumableId);
      const newDocRef = await runTransaction(db, async (transaction) => {
          const cDoc = await transaction.get(consumableRef);
          if (!cDoc.exists()) throw new Error("Consumable not found");
          const cData = cDoc.data() as Consumable;
          if (cData.stock < data.quantity) throw new Error("Insufficient stock");
          if (cData.isLocked) throw new Error("Inventory is locked");
          transaction.update(consumableRef, { stock: increment(-data.quantity) });
          const newOrderRef = doc(collection(db, COLLECTIONS.ORDERS));
          transaction.set(newOrderRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          return newOrderRef;
      });
      return { success: true, data: await this.getDocAndConvert<Order>(newDocRef) };
    } catch (e) {
      console.error('Error creating order:', e);
      return { success: false, error: e as Error };
    }
  }

  // --- Chat Operations (custom logic) ---
  createChatRoom = (data: Omit<ChatRoom, 'id'>) => this.createGenericDoc<ChatRoom>(COLLECTIONS.CHAT_ROOMS, data);
  async getChatRooms(userId: string): Promise<Result<ChatRoom[]>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const q = query(collection(db, COLLECTIONS.CHAT_ROOMS), where('participantIds', 'array-contains', userId), orderBy('lastMessageAt', 'desc'));
      return { success: true, data: this.fromSnapshot<ChatRoom>(await getDocs(q)) };
    } catch (e) { return { success: false, error: e as Error }; }
  }
  subscribeToChatRooms(userId: string, cb: (d: ChatRoom[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, COLLECTIONS.CHAT_ROOMS), where('participantIds', 'array-contains', userId), orderBy('lastMessageAt', 'desc'));
    return onSnapshot(q, (snapshot) => cb(this.fromSnapshot<ChatRoom>(snapshot)), (e) => console.error('Error subscribing to chat rooms:', e));
  }
  async getChatMessages(roomId: string): Promise<Result<ChatMessage[]>> {
      if (!db) return { success: false, error: new Error("Firebase not configured.") };
      try {
          const q = query(collection(db, COLLECTIONS.CHAT_ROOMS, roomId, COLLECTIONS.CHAT_MESSAGES), orderBy('createdAt', 'asc'));
          return { success: true, data: this.fromSnapshot<ChatMessage>(await getDocs(q)) };
      } catch (e) { return { success: false, error: e as Error }; }
  }
  subscribeToChatMessages(roomId: string, cb: (d: ChatMessage[]) => void): () => void {
    if (!db) { console.error("Firebase not configured."); return () => {}; }
    const q = query(collection(db, COLLECTIONS.CHAT_ROOMS, roomId, COLLECTIONS.CHAT_MESSAGES), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => cb(this.fromSnapshot<ChatMessage>(snapshot)), (e) => console.error('Error subscribing to chat messages:', e));
  }
  async sendChatMessage(data: Omit<ChatMessage, 'id' | 'readBy'>): Promise<Result<ChatMessage>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
      const roomRef = doc(db, COLLECTIONS.CHAT_ROOMS, data.roomId);
      const newDocRef = await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) throw new Error("Room does not exist!");
        const roomData = roomDoc.data() as ChatRoom;
        const msgDoc = doc(collection(roomRef, COLLECTIONS.CHAT_MESSAGES));
        transaction.set(msgDoc, { ...data, createdAt: serverTimestamp(), readBy: [data.senderId] });
        const unreadUpdates: { [key: string]: FieldValue } = {};
        roomData.participantIds.forEach(pid => { if (pid !== data.senderId) unreadUpdates[`unreadCount.${pid}`] = increment(1); });
        transaction.update(roomRef, { lastMessage: data.content, lastMessageAt: serverTimestamp(), ...unreadUpdates });
        return msgDoc;
      });
      return { success: true, data: await this.getDocAndConvert<ChatMessage>(newDocRef) };
    } catch (e) { return { success: false, error: e as Error }; }
  }
  async markMessageAsRead(roomId: string, userId: string): Promise<Result<void>> {
    if (!db) return { success: false, error: new Error("Firebase not configured.") };
    try {
        await updateDoc(doc(db, COLLECTIONS.CHAT_ROOMS, roomId), { [`unreadCount.${userId}`]: 0 });
        return { success: true, data: undefined };
    } catch (e) { return { success: false, error: e as Error }; }
  }
  
  // --- Generic Implementations ---
  getCompanies = () => this.getGenericCollection<Company>(COLLECTIONS.COMPANIES);
  getCompanyById = (id: string) => this.getGenericDocById<Company>(COLLECTIONS.COMPANIES, id);
  createCompany = (data: Omit<Company, 'id'>) => this.createGenericDoc<Company>(COLLECTIONS.COMPANIES, data);
  updateCompany = (item: Company) => this.updateGenericDoc<Company>(COLLECTIONS.COMPANIES, item);
  deleteCompany = (id: string) => this.deleteGenericDoc(COLLECTIONS.COMPANIES, id);
  subscribeToCompanies = (cb: (d: Company[]) => void) => this.subscribeToGenericCollection<Company>(COLLECTIONS.COMPANIES, cb);

  getEquipmentList = () => this.getGenericCollection<Equipment>(COLLECTIONS.EQUIPMENT);
  getEquipmentById = (id: string) => this.getGenericDocById<Equipment>(COLLECTIONS.EQUIPMENT, id);
  createEquipment = (data: Omit<Equipment, 'id'>) => this.createGenericDoc<Equipment>(COLLECTIONS.EQUIPMENT, data);
  updateEquipment = (item: Equipment) => this.updateGenericDoc<Equipment>(COLLECTIONS.EQUIPMENT, item);
  deleteEquipment = (id: string) => this.deleteGenericDoc(COLLECTIONS.EQUIPMENT, id);
  subscribeToEquipment = (cb: (d: Equipment[]) => void) => this.subscribeToGenericCollection<Equipment>(COLLECTIONS.EQUIPMENT, cb);

  getUsages = () => this.getGenericCollection<Usage>(COLLECTIONS.USAGE);
  getUsageById = (id: string) => this.getGenericDocById<Usage>(COLLECTIONS.USAGE, id);
  createUsage = (data: Omit<Usage, 'id'>) => this.createGenericDoc<Usage>(COLLECTIONS.USAGE, data);
  updateUsage = (item: Usage) => this.updateGenericDoc<Usage>(COLLECTIONS.USAGE, item);
  deleteUsage = (id: string) => this.deleteGenericDoc(COLLECTIONS.USAGE, id);
  subscribeToUsages = (cb: (d: Usage[]) => void) => this.subscribeToGenericCollection<Usage>(COLLECTIONS.USAGE, cb);

  getConsumables = () => this.getGenericCollection<Consumable>(COLLECTIONS.CONSUMABLES);
  getConsumableById = (id: string) => this.getGenericDocById<Consumable>(COLLECTIONS.CONSUMABLES, id);
  createConsumable = (data: Omit<Consumable, 'id'>) => this.createGenericDoc<Consumable>(COLLECTIONS.CONSUMABLES, data);
  updateConsumable = (item: Consumable) => this.updateGenericDoc<Consumable>(COLLECTIONS.CONSUMABLES, item);
  deleteConsumable = (id: string) => this.deleteGenericDoc(COLLECTIONS.CONSUMABLES, id);
  subscribeToConsumables = (cb: (d: Consumable[]) => void) => this.subscribeToGenericCollection<Consumable>(COLLECTIONS.CONSUMABLES, cb);

  getProjects = () => this.getGenericCollection<Project>(COLLECTIONS.PROJECTS);
  getProjectById = (id: string) => this.getGenericDocById<Project>(COLLECTIONS.PROJECTS, id);
  createProject = (data: Omit<Project, 'id'>) => this.createGenericDoc<Project>(COLLECTIONS.PROJECTS, data);
  updateProject = (item: Project) => this.updateGenericDoc<Project>(COLLECTIONS.PROJECTS, item);
  deleteProject = (id: string) => this.deleteGenericDoc(COLLECTIONS.PROJECTS, id);
  subscribeToProjects = (cb: (d: Project[]) => void) => this.subscribeToGenericCollection<Project>(COLLECTIONS.PROJECTS, cb);

  getTasks = () => this.getGenericCollection<Task>(COLLECTIONS.TASKS);
  subscribeToTasks = (cb: (d: Task[]) => void) => this.subscribeToGenericCollection<Task>(COLLECTIONS.TASKS, cb);
  createTask = (data: Omit<Task, 'id'>) => this.createGenericDoc<Task>(COLLECTIONS.TASKS, data);
  updateTask = (item: Task) => this.updateGenericDoc<Task>(COLLECTIONS.TASKS, item);
  deleteTask = (id: string) => this.deleteGenericDoc(COLLECTIONS.TASKS, id);
  
  getLabNotebookEntries = () => this.getGenericCollection<LabNotebookEntry>(COLLECTIONS.LAB_NOTEBOOK, { field: 'experimentDate', direction: 'desc' });
  createLabNotebookEntry = (data: Omit<LabNotebookEntry, 'id'>) => this.createGenericDoc<LabNotebookEntry>(COLLECTIONS.LAB_NOTEBOOK, data);
  updateLabNotebookEntry = (item: LabNotebookEntry) => this.updateGenericDoc<LabNotebookEntry>(COLLECTIONS.LAB_NOTEBOOK, item);
  deleteLabNotebookEntry = (id: string) => this.deleteGenericDoc(COLLECTIONS.LAB_NOTEBOOK, id);
  subscribeToLabNotebookEntries = (cb: (d: LabNotebookEntry[]) => void) => this.subscribeToGenericCollection<LabNotebookEntry>(COLLECTIONS.LAB_NOTEBOOK, cb, { field: 'experimentDate', direction: 'desc' });

  getMaintenanceLogs = () => this.getGenericCollection<MaintenanceLog>(COLLECTIONS.MAINTENANCE_LOGS, { field: 'reportDate', direction: 'desc' });
  getMaintenanceLogById = (id: string) => this.getGenericDocById<MaintenanceLog>(COLLECTIONS.MAINTENANCE_LOGS, id);
  createMaintenanceLog = (data: Omit<MaintenanceLog, 'id'>) => this.createGenericDoc<MaintenanceLog>(COLLECTIONS.MAINTENANCE_LOGS, data);
  updateMaintenanceLog = (item: MaintenanceLog) => this.updateGenericDoc<MaintenanceLog>(COLLECTIONS.MAINTENANCE_LOGS, item);
  deleteMaintenanceLog = (id: string) => this.deleteGenericDoc(COLLECTIONS.MAINTENANCE_LOGS, id);
  subscribeToMaintenanceLogs = (cb: (d: MaintenanceLog[]) => void) => this.subscribeToGenericCollection<MaintenanceLog>(COLLECTIONS.MAINTENANCE_LOGS, cb);
  
  getAnnouncements = () => this.getGenericCollection<Announcement>(COLLECTIONS.ANNOUNCEMENTS, { field: 'startDate', direction: 'desc' });
  getAnnouncementById = (id: string) => this.getGenericDocById<Announcement>(COLLECTIONS.ANNOUNCEMENTS, id);
  createAnnouncement = (data: Omit<Announcement, 'id'>) => this.createGenericDoc<Announcement>(COLLECTIONS.ANNOUNCEMENTS, data);
  updateAnnouncement = (item: Announcement) => this.updateGenericDoc<Announcement>(COLLECTIONS.ANNOUNCEMENTS, item);
  deleteAnnouncement = (id: string) => this.deleteGenericDoc(COLLECTIONS.ANNOUNCEMENTS, id);
  subscribeToAnnouncements = (cb: (d: Announcement[]) => void) => this.subscribeToGenericCollection<Announcement>(COLLECTIONS.ANNOUNCEMENTS, cb);

  getCertificates = () => this.getGenericCollection<Certificate>(COLLECTIONS.CERTIFICATES);
  getCertificateById = (id: string) => this.getGenericDocById<Certificate>(COLLECTIONS.CERTIFICATES, id);
  createCertificate = (data: Omit<Certificate, 'id'>) => this.createGenericDoc<Certificate>(COLLECTIONS.CERTIFICATES, data);
  updateCertificate = (item: Certificate) => this.updateGenericDoc<Certificate>(COLLECTIONS.CERTIFICATES, item);
  deleteCertificate = (id: string) => this.deleteGenericDoc(COLLECTIONS.CERTIFICATES, id);
  subscribeToCertificates = (cb: (d: Certificate[]) => void) => this.subscribeToGenericCollection<Certificate>(COLLECTIONS.CERTIFICATES, cb);
  
  getSds = () => this.getGenericCollection<SDS>(COLLECTIONS.SDS);
  getSdsById = (id: string) => this.getGenericDocById<SDS>(COLLECTIONS.SDS, id);
  createSds = (data: Omit<SDS, 'id'>) => this.createGenericDoc<SDS>(COLLECTIONS.SDS, data);
  updateSds = (item: SDS) => this.updateGenericDoc<SDS>(COLLECTIONS.SDS, item);
  deleteSds = (id: string) => this.deleteGenericDoc(COLLECTIONS.SDS, id);
  subscribeToSds = (cb: (d: SDS[]) => void) => this.subscribeToGenericCollection<SDS>(COLLECTIONS.SDS, cb);
  
  getMonthlyReports = () => this.getGenericCollection<MonthlyReport>(COLLECTIONS.MONTHLY_REPORTS, { field: 'generatedAt', direction: 'desc' });
  createMonthlyReport = (data: Omit<MonthlyReport, 'id'>) => this.createGenericDoc<MonthlyReport>(COLLECTIONS.MONTHLY_REPORTS, data);
  subscribeToMonthlyReports = (cb: (d: MonthlyReport[]) => void) => this.subscribeToGenericCollection<MonthlyReport>(COLLECTIONS.MONTHLY_REPORTS, cb, { field: 'generatedAt', direction: 'desc' });
  
  getTickets = () => this.getGenericCollection<Ticket>(COLLECTIONS.TICKETS);
  getTicketById = (id: string) => this.getGenericDocById<Ticket>(COLLECTIONS.TICKETS, id);
  createTicket = (data: Omit<Ticket, 'id'>) => this.createGenericDoc<Ticket>(COLLECTIONS.TICKETS, data);
  updateTicket = (item: Ticket) => this.updateGenericDoc<Ticket>(COLLECTIONS.TICKETS, item);
  deleteTicket = (id: string) => this.deleteGenericDoc(COLLECTIONS.TICKETS, id);
  subscribeToTickets = (cb: (d: Ticket[]) => void) => this.subscribeToGenericCollection<Ticket>(COLLECTIONS.TICKETS, cb, { field: 'createdAt', direction: 'desc' });

  getRegulatoryRequirements = () => this.getGenericCollection<RegulatoryRequirement>(COLLECTIONS.REGULATORY_REQUIREMENTS);
  getRegulatoryRequirementById = (id: string) => this.getGenericDocById<RegulatoryRequirement>(COLLECTIONS.REGULATORY_REQUIREMENTS, id);
  createRegulatoryRequirement = (data: Omit<RegulatoryRequirement, 'id'>) => this.createGenericDoc<RegulatoryRequirement>(COLLECTIONS.REGULATORY_REQUIREMENTS, data);
  updateRegulatoryRequirement = (item: RegulatoryRequirement) => this.updateGenericDoc<RegulatoryRequirement>(COLLECTIONS.REGULATORY_REQUIREMENTS, item);
  deleteRegulatoryRequirement = (id: string) => this.deleteGenericDoc(COLLECTIONS.REGULATORY_REQUIREMENTS, id);
  subscribeToRegulatoryRequirements = (cb: (d: RegulatoryRequirement[]) => void) => this.subscribeToGenericCollection<RegulatoryRequirement>(COLLECTIONS.REGULATORY_REQUIREMENTS, cb);

  getInsuranceCertificates = () => this.getGenericCollection<InsuranceCertificate>(COLLECTIONS.INSURANCE_CERTIFICATES);
  getInsuranceCertificateById = (id: string) => this.getGenericDocById<InsuranceCertificate>(COLLECTIONS.INSURANCE_CERTIFICATES, id);
  createInsuranceCertificate = (data: Omit<InsuranceCertificate, 'id'>) => this.createGenericDoc<InsuranceCertificate>(COLLECTIONS.INSURANCE_CERTIFICATES, data);
  updateInsuranceCertificate = (item: InsuranceCertificate) => this.updateGenericDoc<InsuranceCertificate>(COLLECTIONS.INSURANCE_CERTIFICATES, item);
  deleteInsuranceCertificate = (id: string) => this.deleteGenericDoc(COLLECTIONS.INSURANCE_CERTIFICATES, id);
  subscribeToInsuranceCertificates = (cb: (d: InsuranceCertificate[]) => void) => this.subscribeToGenericCollection<InsuranceCertificate>(COLLECTIONS.INSURANCE_CERTIFICATES, cb);
  
  createInvoice = (data: Omit<Invoice, 'id'>) => this.createGenericDoc<Invoice>(COLLECTIONS.INVOICES, data);
  updateInvoice = (item: Invoice) => this.updateGenericDoc<Invoice>(COLLECTIONS.INVOICES, item);
}
