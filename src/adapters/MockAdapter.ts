// src/adapters/MockAdapter.ts

import {
  User,
  Company,
  Announcement,
  Equipment,
  Reservation,
  Usage,
  MaintenanceLog,
  EquipmentStatus,
  ReservationStatus,
  Consumable,
  Order,
  Project,
  Task,
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
import { getMockData } from '../data/mockData';
import { ValidationError, validatePassword, validateDateRange } from '../utils/validation';

// ID生成用のヘルパー関数
const simpleUUID = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * モックデータを操作するためのIDataAdapterの実装。
 * 実際のAPIコールをシミュレートし、メモリ上のデータを操作する。
 * getMockData.tsから初期データをロードし、useAppActions.tsのロジックを統合している。
 */
export class MockAdapter implements IDataAdapter {
  // 各エンティティのデータを保持するプライベートプロパティ
  private users: User[];
  private companies: Company[];
  private equipment: Equipment[];
  private reservations: Reservation[];
  private usages: Usage[];
  private consumables: Consumable[];
  private orders: Order[];
  private projects: Project[];
  private tasks: Task[];
  private maintenanceLogs: MaintenanceLog[];
  private announcements: Announcement[];
  private certificates: Certificate[];
  private sdsList: SDS[];
  private monthlyReports: MonthlyReport[];
  private tickets: Ticket[];
  private regulatoryRequirements: RegulatoryRequirement[];
  private insuranceCertificates: InsuranceCertificate[];
  private chatRooms: ChatRoom[];
  private chatMessages: ChatMessage[];
  private invoices: Invoice[];

  private subscribers: Map<string, Function[]> = new Map();

  constructor() {
    // getMockDataフックから初期データを取得してクラスプロパティに設定
    const initialData = getMockData();
    this.users = initialData.users;
    this.companies = initialData.companies;
    this.equipment = initialData.equipment;
    this.reservations = initialData.reservations;
    this.usages = initialData.usage; // useMockDataでは 'usage'
    this.consumables = initialData.consumables;
    this.orders = initialData.orders;
    this.projects = initialData.projects;
    this.tasks = initialData.tasks;
    this.maintenanceLogs = initialData.maintenanceLogs;
    this.announcements = initialData.announcements;
    this.certificates = initialData.certificates;
    this.sdsList = initialData.sds; // useMockDataでは 'sds'
    this.monthlyReports = [];
    this.tickets = []; // mockData does not have tickets yet
    this.regulatoryRequirements = initialData.regulatoryRequirements;
    this.insuranceCertificates = initialData.insuranceCertificates;
    this.chatRooms = initialData.chatRooms;
    this.chatMessages = initialData.chatMessages;
    this.invoices = initialData.invoices;
  }

  /**
   * 購読者に更新を通知するためのプライベートメソッド。
   * @param collectionName - 更新があったコレクション名 (e.g., 'users')
   * @param data - 更新後のデータ配列
   */
  private notifySubscribers(collectionName: string, data: any[]) {
    const callbacks = this.subscribers.get(collectionName);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
  
  /**
   * 購読を管理するための汎用メソッド。
   * @param collectionName - 購読対象のコレクション名
   * @param dataArray - 現在のデータ配列
   * @param callback - 呼び出すコールバック関数
   * @returns 購読解除用の関数
   */
  private createSubscription(collectionName: string, dataArray: any[], callback: (data: any[]) => void): () => void {
    const currentCallbacks = this.subscribers.get(collectionName) || [];
    this.subscribers.set(collectionName, [...currentCallbacks, callback]);
    
    // 初回実行
    callback(dataArray);

    // 購読解除関数
    return () => {
      const updatedCallbacks = (this.subscribers.get(collectionName) || []).filter(cb => cb !== callback);
      this.subscribers.set(collectionName, updatedCallbacks);
    };
  }

  // --- User Operations ---
  async getUsers(): Promise<Result<User[]>> {
    return { success: true, data: [...this.users] };
  }
  async getUserById(id: string): Promise<Result<User | null>> {
    const user = this.users.find(u => u.id === id) || null;
    return { success: true, data: user };
  }
  async createUser(data: Omit<User, 'id'>): Promise<Result<User>> {
    try {
      if (this.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new ValidationError('email', 'EXISTS', 'Email already exists.');
      }
      if(data.password) validatePassword(data.password);
      
      const newUser: User = { ...data, id: simpleUUID() };
      this.users.push(newUser);
      this.notifySubscribers('users', this.users);
      return { success: true, data: newUser };
    } catch (e) {
      return { success: false, error: e as Error };
    }
  }
  async updateUser(user: User): Promise<Result<User>> {
    const userIndex = this.users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      return { success: false, error: new Error('User not found') };
    }
    this.users[userIndex] = user;
    this.notifySubscribers('users', this.users);
    return { success: true, data: user };
  }
  async deleteUser(id: string): Promise<Result<void>> {
    this.users = this.users.filter(u => u.id !== id);
    this.notifySubscribers('users', this.users);
    return { success: true, data: undefined };
  }
  subscribeToUsers(callback: (data: User[]) => void): () => void {
    return this.createSubscription('users', this.users, callback);
  }

  // --- Company Operations ---
  async getCompanies(): Promise<Result<Company[]>> {
    return { success: true, data: [...this.companies] };
  }
  async getCompanyById(id: string): Promise<Result<Company | null>> {
    const company = this.companies.find(c => c.id === id) || null;
    return { success: true, data: company };
  }
  async createCompany(data: Omit<Company, 'id'>): Promise<Result<Company>> {
    const newCompany: Company = { ...data, id: simpleUUID() };
    this.companies.push(newCompany);
    this.notifySubscribers('companies', this.companies);
    return { success: true, data: newCompany };
  }
  async updateCompany(company: Company): Promise<Result<Company>> {
     const index = this.companies.findIndex(c => c.id === company.id);
     if (index === -1) return { success: false, error: new Error('Company not found') };
     this.companies[index] = company;
     this.notifySubscribers('companies', this.companies);
     return { success: true, data: company };
  }
  async deleteCompany(id: string): Promise<Result<void>> {
    this.companies = this.companies.filter(c => c.id !== id);
    this.notifySubscribers('companies', this.companies);
    return { success: true, data: undefined };
  }
  subscribeToCompanies(callback: (data: Company[]) => void): () => void {
    return this.createSubscription('companies', this.companies, callback);
  }

  // --- Equipment Operations ---
  async getEquipmentList(): Promise<Result<Equipment[]>> {
    return { success: true, data: [...this.equipment] };
  }
  async getEquipmentById(id: string): Promise<Result<Equipment | null>> {
    const item = this.equipment.find(e => e.id === id) || null;
    return { success: true, data: item };
  }
  async createEquipment(data: Omit<Equipment, 'id'>): Promise<Result<Equipment>> {
    const newItem: Equipment = { ...data, id: simpleUUID() };
    this.equipment.push(newItem);
    this.notifySubscribers('equipment', this.equipment);
    return { success: true, data: newItem };
  }
  async updateEquipment(equipment: Equipment): Promise<Result<Equipment>> {
    const index = this.equipment.findIndex(e => e.id === equipment.id);
    if (index === -1) return { success: false, error: new Error('Equipment not found') };
    this.equipment[index] = equipment;
    this.notifySubscribers('equipment', this.equipment);
    return { success: true, data: equipment };
  }
  async deleteEquipment(id: string): Promise<Result<void>> {
    this.equipment = this.equipment.filter(e => e.id !== id);
    this.notifySubscribers('equipment', this.equipment);
    return { success: true, data: undefined };
  }
  subscribeToEquipment(callback: (data: Equipment[]) => void): () => void {
    return this.createSubscription('equipment', this.equipment, callback);
  }

  // --- Reservation Operations ---
  async getReservations(): Promise<Result<Reservation[]>> {
    return { success: true, data: [...this.reservations] };
  }
  async getReservationById(id: string): Promise<Result<Reservation | null>> {
    const item = this.reservations.find(r => r.id === id) || null;
    return { success: true, data: item };
  }
  async createReservation(data: Omit<Reservation, 'id'>): Promise<Result<Reservation>> {
     try {
        validateDateRange(data.startTime, data.endTime);
        const overlapping = this.reservations.some(r => 
            r.equipmentId === data.equipmentId &&
            r.status !== ReservationStatus.Cancelled &&
            (
                (data.startTime >= r.startTime && data.startTime < r.endTime) ||
                (data.endTime > r.startTime && data.endTime <= r.endTime) ||
                (data.startTime <= r.startTime && data.endTime >= r.endTime)
            )
        );
        if (overlapping) {
            throw new Error('OVERLAP_ERROR');
        }
        const newReservation: Reservation = { ...data, id: simpleUUID() };
        this.reservations.push(newReservation);
        this.notifySubscribers('reservations', this.reservations);
        return { success: true, data: newReservation };
    } catch (e) {
        return { success: false, error: e as Error };
    }
  }
  async updateReservation(reservation: Reservation): Promise<Result<Reservation>> {
    const index = this.reservations.findIndex(r => r.id === reservation.id);
    if (index === -1) return { success: false, error: new Error('Reservation not found') };
    this.reservations[index] = reservation;
    this.notifySubscribers('reservations', this.reservations);
    return { success: true, data: reservation };
  }
  async deleteReservation(id: string): Promise<Result<void>> {
    this.reservations = this.reservations.filter(r => r.id !== id);
    this.notifySubscribers('reservations', this.reservations);
    return { success: true, data: undefined };
  }
  subscribeToReservations(callback: (data: Reservation[]) => void): () => void {
    return this.createSubscription('reservations', this.reservations, callback);
  }

  // --- CRUD Stubs for other entities ---
  // The following methods are implemented as simple in-memory operations.
  // In a real application, they would involve API calls.

  async getUsages(): Promise<Result<Usage[]>> { return { success: true, data: [...this.usages] }; }
  async getUsageById(id: string): Promise<Result<Usage | null>> { return { success: true, data: this.usages.find(i => i.id === id) || null }; }
  async createUsage(data: Omit<Usage, 'id'>): Promise<Result<Usage>> { const n: Usage = {...data, id: simpleUUID()}; this.usages.push(n); this.notifySubscribers('usages', this.usages); return { success: true, data: n }; }
  async updateUsage(usage: Usage): Promise<Result<Usage>> { const i = this.usages.findIndex(item => item.id === usage.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.usages[i] = usage; this.notifySubscribers('usages', this.usages); return { success: true, data: this.usages[i] }; }
  async deleteUsage(id: string): Promise<Result<void>> { this.usages = this.usages.filter(i => i.id !== id); this.notifySubscribers('usages', this.usages); return { success: true, data: undefined }; }
  subscribeToUsages(callback: (data: Usage[]) => void): () => void { return this.createSubscription('usages', this.usages, callback); }

  async getConsumables(): Promise<Result<Consumable[]>> { return { success: true, data: [...this.consumables] }; }
  async getConsumableById(id: string): Promise<Result<Consumable | null>> { return { success: true, data: this.consumables.find(i => i.id === id) || null }; }
  async createConsumable(data: Omit<Consumable, 'id'>): Promise<Result<Consumable>> { const n: Consumable = {...data, id: simpleUUID()}; this.consumables.push(n); this.notifySubscribers('consumables', this.consumables); return { success: true, data: n }; }
  async updateConsumable(consumable: Consumable): Promise<Result<Consumable>> { const i = this.consumables.findIndex(item => item.id === consumable.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.consumables[i] = consumable; this.notifySubscribers('consumables', this.consumables); return { success: true, data: this.consumables[i] }; }
  async deleteConsumable(id: string): Promise<Result<void>> { this.consumables = this.consumables.filter(i => i.id !== id); this.notifySubscribers('consumables', this.consumables); return { success: true, data: undefined }; }
  subscribeToConsumables(callback: (data: Consumable[]) => void): () => void { return this.createSubscription('consumables', this.consumables, callback); }

  async getOrders(): Promise<Result<Order[]>> { return { success: true, data: [...this.orders] }; }
  async getOrderById(id: string): Promise<Result<Order | null>> { return { success: true, data: this.orders.find(i => i.id === id) || null }; }
  async createOrder(data: Omit<Order, 'id'>): Promise<Result<Order>> {
    const consumable = this.consumables.find(c => c.id === data.consumableId);
    if (!consumable) {
        return { success: false, error: new Error("Consumable not found.") };
    }
    if (consumable.stock < data.quantity) {
        return { success: false, error: new Error("Insufficient stock.") };
    }
    if (consumable.isLocked) {
        return { success: false, error: new Error("Inventory is locked.") };
    }
    this.consumables = this.consumables.map(c => 
        c.id === data.consumableId ? { ...c, stock: c.stock - data.quantity } : c
    );
    this.notifySubscribers('consumables', this.consumables);
    const newOrder: Order = {...data, id: simpleUUID()};
    this.orders.push(newOrder);
    this.notifySubscribers('orders', this.orders);
    return { success: true, data: newOrder };
  }
  async updateOrder(order: Order): Promise<Result<Order>> { const i = this.orders.findIndex(item => item.id === order.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.orders[i] = order; this.notifySubscribers('orders', this.orders); return { success: true, data: this.orders[i] }; }
  async deleteOrder(id: string): Promise<Result<void>> { this.orders = this.orders.filter(i => i.id !== id); this.notifySubscribers('orders', this.orders); return { success: true, data: undefined }; }
  subscribeToOrders(callback: (data: Order[]) => void): () => void { return this.createSubscription('orders', this.orders, callback); }

  async getProjects(): Promise<Result<Project[]>> { return { success: true, data: [...this.projects] }; }
  async getProjectById(id: string): Promise<Result<Project | null>> { return { success: true, data: this.projects.find(i => i.id === id) || null }; }
  async createProject(data: Omit<Project, 'id'>): Promise<Result<Project>> { const n: Project = {...data, id: simpleUUID()}; this.projects.push(n); this.notifySubscribers('projects', this.projects); return { success: true, data: n }; }
  async updateProject(project: Project): Promise<Result<Project>> { const i = this.projects.findIndex(item => item.id === project.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.projects[i] = project; this.notifySubscribers('projects', this.projects); return { success: true, data: this.projects[i] }; }
  async deleteProject(id: string): Promise<Result<void>> { this.projects = this.projects.filter(i => i.id !== id); this.notifySubscribers('projects', this.projects); return { success: true, data: undefined }; }
  subscribeToProjects(callback: (data: Project[]) => void): () => void { return this.createSubscription('projects', this.projects, callback); }

  async getTasks(): Promise<Result<Task[]>> { return { success: true, data: [...this.tasks] }; }
  subscribeToTasks(callback: (data: Task[]) => void): () => void { return this.createSubscription('tasks', this.tasks, callback); }

  async getMaintenanceLogs(): Promise<Result<MaintenanceLog[]>> { return { success: true, data: [...this.maintenanceLogs] }; }
  async getMaintenanceLogById(id: string): Promise<Result<MaintenanceLog | null>> { return { success: true, data: this.maintenanceLogs.find(i => i.id === id) || null }; }
  async createMaintenanceLog(data: Omit<MaintenanceLog, 'id'>): Promise<Result<MaintenanceLog>> { const n: MaintenanceLog = {...data, id: simpleUUID()}; this.maintenanceLogs.push(n); this.notifySubscribers('maintenanceLogs', this.maintenanceLogs); return { success: true, data: n }; }
  async updateMaintenanceLog(log: MaintenanceLog): Promise<Result<MaintenanceLog>> { const i = this.maintenanceLogs.findIndex(item => item.id === log.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.maintenanceLogs[i] = log; this.notifySubscribers('maintenanceLogs', this.maintenanceLogs); return { success: true, data: this.maintenanceLogs[i] }; }
  async deleteMaintenanceLog(id: string): Promise<Result<void>> { this.maintenanceLogs = this.maintenanceLogs.filter(i => i.id !== id); this.notifySubscribers('maintenanceLogs', this.maintenanceLogs); return { success: true, data: undefined }; }
  subscribeToMaintenanceLogs(callback: (data: MaintenanceLog[]) => void): () => void { return this.createSubscription('maintenanceLogs', this.maintenanceLogs, callback); }

  async getAnnouncements(): Promise<Result<Announcement[]>> { return { success: true, data: [...this.announcements] }; }
  async getAnnouncementById(id: string): Promise<Result<Announcement | null>> { return { success: true, data: this.announcements.find(i => i.id === id) || null }; }
  async createAnnouncement(data: Omit<Announcement, 'id'>): Promise<Result<Announcement>> { const n: Announcement = {...data, id: simpleUUID()}; this.announcements.push(n); this.notifySubscribers('announcements', this.announcements); return { success: true, data: n }; }
  async updateAnnouncement(announcement: Announcement): Promise<Result<Announcement>> { const i = this.announcements.findIndex(item => item.id === announcement.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.announcements[i] = announcement; this.notifySubscribers('announcements', this.announcements); return { success: true, data: this.announcements[i] }; }
  async deleteAnnouncement(id: string): Promise<Result<void>> { this.announcements = this.announcements.filter(i => i.id !== id); this.notifySubscribers('announcements', this.announcements); return { success: true, data: undefined }; }
  subscribeToAnnouncements(callback: (data: Announcement[]) => void): () => void { return this.createSubscription('announcements', this.announcements, callback); }

  async getCertificates(): Promise<Result<Certificate[]>> { return { success: true, data: [...this.certificates] }; }
  async getCertificateById(id: string): Promise<Result<Certificate | null>> { return { success: true, data: this.certificates.find(i => i.id === id) || null }; }
  async createCertificate(data: Omit<Certificate, 'id'>): Promise<Result<Certificate>> { const n: Certificate = {...data, id: simpleUUID()}; this.certificates.push(n); this.notifySubscribers('certificates', this.certificates); return { success: true, data: n }; }
  async updateCertificate(certificate: Certificate): Promise<Result<Certificate>> { const i = this.certificates.findIndex(item => item.id === certificate.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.certificates[i] = certificate; this.notifySubscribers('certificates', this.certificates); return { success: true, data: this.certificates[i] }; }
  async deleteCertificate(id: string): Promise<Result<void>> { this.certificates = this.certificates.filter(i => i.id !== id); this.notifySubscribers('certificates', this.certificates); return { success: true, data: undefined }; }
  subscribeToCertificates(callback: (data: Certificate[]) => void): () => void { return this.createSubscription('certificates', this.certificates, callback); }

  async getSdsList(): Promise<Result<SDS[]>> { return { success: true, data: [...this.sdsList] }; }
  async getSdsById(id: string): Promise<Result<SDS | null>> { return { success: true, data: this.sdsList.find(i => i.id === id) || null }; }
  async createSds(data: Omit<SDS, 'id'>): Promise<Result<SDS>> { const n: SDS = {...data, id: simpleUUID()}; this.sdsList.push(n); this.notifySubscribers('sdsList', this.sdsList); return { success: true, data: n }; }
  async updateSds(sds: SDS): Promise<Result<SDS>> { const i = this.sdsList.findIndex(item => item.id === sds.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.sdsList[i] = sds; this.notifySubscribers('sdsList', this.sdsList); return { success: true, data: this.sdsList[i] }; }
  async deleteSds(id: string): Promise<Result<void>> { this.sdsList = this.sdsList.filter(i => i.id !== id); this.notifySubscribers('sdsList', this.sdsList); return { success: true, data: undefined }; }
  subscribeToSds(callback: (data: SDS[]) => void): () => void { return this.createSubscription('sdsList', this.sdsList, callback); }
  
  // --- Monthly Report Operations ---
  async getMonthlyReports(): Promise<Result<MonthlyReport[]>> {
    return { success: true, data: [...this.monthlyReports] };
  }
  async createMonthlyReport(data: Omit<MonthlyReport, 'id'>): Promise<Result<MonthlyReport>> {
    const newReport: MonthlyReport = { ...data, id: simpleUUID() };
    this.monthlyReports.push(newReport);
    this.notifySubscribers('monthlyReports', this.monthlyReports);
    return { success: true, data: newReport };
  }
  subscribeToMonthlyReports(callback: (data: MonthlyReport[]) => void): () => void {
    return this.createSubscription('monthlyReports', this.monthlyReports, callback);
  }

  // --- Ticket Operations ---
  async getTickets(): Promise<Result<Ticket[]>> { return { success: true, data: [...this.tickets] }; }
  async getTicketById(id: string): Promise<Result<Ticket | null>> { return { success: true, data: this.tickets.find(i => i.id === id) || null }; }
  async createTicket(data: Omit<Ticket, 'id'>): Promise<Result<Ticket>> { const n: Ticket = {...data, id: simpleUUID()}; this.tickets.push(n); this.notifySubscribers('tickets', this.tickets); return { success: true, data: n }; }
  async updateTicket(ticket: Ticket): Promise<Result<Ticket>> { const i = this.tickets.findIndex(item => item.id === ticket.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.tickets[i] = ticket; this.notifySubscribers('tickets', this.tickets); return { success: true, data: this.tickets[i] }; }
  async deleteTicket(id: string): Promise<Result<void>> { this.tickets = this.tickets.filter(i => i.id !== id); this.notifySubscribers('tickets', this.tickets); return { success: true, data: undefined }; }
  subscribeToTickets(callback: (data: Ticket[]) => void): () => void { return this.createSubscription('tickets', this.tickets, callback); }
  
  // --- RegulatoryRequirement Operations ---
  async getRegulatoryRequirements(): Promise<Result<RegulatoryRequirement[]>> { return { success: true, data: [...this.regulatoryRequirements] }; }
  async getRegulatoryRequirementById(id: string): Promise<Result<RegulatoryRequirement | null>> { return { success: true, data: this.regulatoryRequirements.find(i => i.id === id) || null }; }
  async createRegulatoryRequirement(data: Omit<RegulatoryRequirement, 'id'>): Promise<Result<RegulatoryRequirement>> { const n: RegulatoryRequirement = {...data, id: simpleUUID()}; this.regulatoryRequirements.push(n); this.notifySubscribers('regulatoryRequirements', this.regulatoryRequirements); return { success: true, data: n }; }
  async updateRegulatoryRequirement(req: RegulatoryRequirement): Promise<Result<RegulatoryRequirement>> { const i = this.regulatoryRequirements.findIndex(item => item.id === req.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.regulatoryRequirements[i] = req; this.notifySubscribers('regulatoryRequirements', this.regulatoryRequirements); return { success: true, data: this.regulatoryRequirements[i] }; }
  async deleteRegulatoryRequirement(id: string): Promise<Result<void>> { this.regulatoryRequirements = this.regulatoryRequirements.filter(i => i.id !== id); this.notifySubscribers('regulatoryRequirements', this.regulatoryRequirements); return { success: true, data: undefined }; }
  subscribeToRegulatoryRequirements(callback: (data: RegulatoryRequirement[]) => void): () => void { return this.createSubscription('regulatoryRequirements', this.regulatoryRequirements, callback); }

  // --- InsuranceCertificate Operations ---
  async getInsuranceCertificates(): Promise<Result<InsuranceCertificate[]>> { return { success: true, data: [...this.insuranceCertificates] }; }
  async getInsuranceCertificateById(id: string): Promise<Result<InsuranceCertificate | null>> { return { success: true, data: this.insuranceCertificates.find(i => i.id === id) || null }; }
  async createInsuranceCertificate(data: Omit<InsuranceCertificate, 'id'>): Promise<Result<InsuranceCertificate>> { const n: InsuranceCertificate = {...data, id: simpleUUID()}; this.insuranceCertificates.push(n); this.notifySubscribers('insuranceCertificates', this.insuranceCertificates); return { success: true, data: n }; }
  async updateInsuranceCertificate(cert: InsuranceCertificate): Promise<Result<InsuranceCertificate>> { const i = this.insuranceCertificates.findIndex(item => item.id === cert.id); if(i===-1) return {success: false, error: new Error('Not found')}; this.insuranceCertificates[i] = cert; this.notifySubscribers('insuranceCertificates', this.insuranceCertificates); return { success: true, data: this.insuranceCertificates[i] }; }
  async deleteInsuranceCertificate(id: string): Promise<Result<void>> { this.insuranceCertificates = this.insuranceCertificates.filter(i => i.id !== id); this.notifySubscribers('insuranceCertificates', this.insuranceCertificates); return { success: true, data: undefined }; }
  subscribeToInsuranceCertificates(callback: (data: InsuranceCertificate[]) => void): () => void { return this.createSubscription('insuranceCertificates', this.insuranceCertificates, callback); }
  
  // --- Invoice Operations ---
  async createInvoice(data: Omit<Invoice, 'id'>): Promise<Result<Invoice>> {
    const newInvoice: Invoice = { ...data, id: simpleUUID() };
    this.invoices.push(newInvoice);
    this.notifySubscribers('invoices', this.invoices);
    return { success: true, data: newInvoice };
  }
  async updateInvoice(invoice: Invoice): Promise<Result<Invoice>> {
    const index = this.invoices.findIndex(inv => inv.id === invoice.id);
    if (index === -1) return { success: false, error: new Error('Invoice not found') };
    this.invoices[index] = invoice;
    this.notifySubscribers('invoices', this.invoices);
    return { success: true, data: invoice };
  }

  // --- Chat Operations ---
  async getChatRooms(userId: string): Promise<Result<ChatRoom[]>> {
    const userRooms = this.chatRooms.filter(r => r.participantIds.includes(userId));
    return { success: true, data: userRooms };
  }

  subscribeToChatRooms(userId: string, callback: (data: ChatRoom[]) => void): () => void {
    return this.createSubscription('chatRooms', this.chatRooms, (allRooms) => {
        const userRooms = allRooms.filter(r => r.participantIds.includes(userId))
                                  .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        callback(userRooms);
    });
  }

  async createChatRoom(data: Omit<ChatRoom, 'id'>): Promise<Result<ChatRoom>> {
    const newRoom: ChatRoom = { ...data, id: simpleUUID() };
    this.chatRooms.push(newRoom);
    this.notifySubscribers('chatRooms', this.chatRooms);
    return { success: true, data: newRoom };
  }

  async getChatMessages(roomId: string): Promise<Result<ChatMessage[]>> {
      const roomMessages = this.chatMessages
          .filter(m => m.roomId === roomId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return { success: true, data: roomMessages };
  }

  subscribeToChatMessages(roomId: string, callback: (data: ChatMessage[]) => void): () => void {
      return this.createSubscription('chatMessages', this.chatMessages, (allMessages) => {
          const roomMessages = allMessages
              .filter(m => m.roomId === roomId)
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          callback(roomMessages);
      });
  }

  async sendChatMessage(data: Omit<ChatMessage, 'id' | 'readBy'>): Promise<Result<ChatMessage>> {
      const newMessage: ChatMessage = {
          ...data,
          id: simpleUUID(),
          readBy: [data.senderId],
          createdAt: data.createdAt || new Date(),
      };
      this.chatMessages.push(newMessage);
  
      const roomIndex = this.chatRooms.findIndex(r => r.id === data.roomId);
      if (roomIndex > -1) {
          const room = this.chatRooms[roomIndex];
          room.lastMessage = data.content;
          room.lastMessageAt = newMessage.createdAt;
          room.participantIds.forEach(pid => {
            if (pid !== data.senderId) {
                room.unreadCount[pid] = (room.unreadCount[pid] || 0) + 1;
            }
          });
          this.chatRooms[roomIndex] = room;
      }
      
      this.notifySubscribers('chatMessages', this.chatMessages);
      this.notifySubscribers('chatRooms', this.chatRooms);
      return { success: true, data: newMessage };
  }

  async markMessageAsRead(roomId: string, userId: string): Promise<Result<void>> {
      const roomIndex = this.chatRooms.findIndex(r => r.id === roomId);
      if (roomIndex > -1) {
          this.chatRooms[roomIndex].unreadCount[userId] = 0;
          this.notifySubscribers('chatRooms', this.chatRooms);
          return { success: true, data: undefined };
      }
      return { success: false, error: new Error('Room not found') };
  }
}