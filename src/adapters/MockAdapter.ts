// src/adapters/MockAdapter.ts

import {
  User, Company, Announcement, Equipment, Reservation, Usage, MaintenanceLog,
  EquipmentStatus, ReservationStatus, Consumable, Order, Project, Task,
  LabNotebookEntry, Certificate, SDS, Ticket, RegulatoryRequirement,
  InsuranceCertificate, MonthlyReport, ChatRoom, ChatMessage, Invoice, Result,
} from '../types';
import { IDataAdapter } from './IDataAdapter';
import { getMockData } from '../data/mockData';
import { ValidationError, validateDateRange } from '../utils/validation';
import { simpleUUID } from '../utils/uuid';

// Generic CRUD factory
function createGenericCrud<T extends { id: string }>(
  collection: T[],
  collectionName: string,
  adapter: MockAdapter
) {
  const notify = (data: T[]) => (adapter as any).notifySubscribers(collectionName, data);

  return {
    async getAll(): Promise<Result<T[]>> {
      return { success: true, data: [...collection] };
    },
    async getById(id: string): Promise<Result<T | null>> {
      return { success: true, data: collection.find(i => i.id === id) || null };
    },
    async create(data: Omit<T, 'id'>): Promise<Result<T>> {
      const newItem = { ...data, id: simpleUUID() } as T;
      collection.push(newItem);
      notify(collection);
      return { success: true, data: newItem };
    },
    async update(item: T): Promise<Result<T>> {
      const index = collection.findIndex(i => i.id === item.id);
      if (index === -1) return { success: false, error: new Error(`${collectionName} not found`) };
      collection[index] = item;
      notify(collection);
      return { success: true, data: item };
    },
    async delete(id: string): Promise<Result<void>> {
      const newCollection = collection.filter(i => i.id !== id);
      if (newCollection.length === collection.length) {
        // No item was deleted, maybe warn or handle as needed
      }
      collection.length = 0;
      Array.prototype.push.apply(collection, newCollection);
      notify(collection);
      return { success: true, data: undefined };
    },
    subscribe(callback: (data: T[]) => void): () => void {
      return (adapter as any).createSubscription(collectionName, collection, callback);
    }
  };
}


export class MockAdapter implements IDataAdapter {
  // Data properties
  private users: User[];
  private companies: Company[];
  private equipment: Equipment[];
  private reservations: Reservation[];
  private usages: Usage[];
  private consumables: Consumable[];
  private orders: Order[];
  private projects: Project[];
  private tasks: Task[];
  private labNotebookEntries: LabNotebookEntry[];
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

  // Generic CRUD instances
  private companyCrud;
  private equipmentCrud;
  private usageCrud;
  private consumableCrud;
  private orderCrud;
  private projectCrud;
  private labNotebookCrud;
  private maintenanceLogCrud;
  private announcementCrud;
  private certificateCrud;
  private sdsCrud;
  private monthlyReportCrud;
  private ticketCrud;
  private regulatoryRequirementCrud;
  private insuranceCertificateCrud;

  private subscribers: Map<string, Function[]> = new Map();

  constructor() {
    const d = getMockData();
    this.users = d.users; this.companies = d.companies; this.equipment = d.equipment;
    this.reservations = d.reservations; this.usages = d.usage; this.consumables = d.consumables;
    this.orders = d.orders; this.projects = d.projects; this.tasks = d.tasks;
    this.labNotebookEntries = d.labNotebookEntries; this.maintenanceLogs = d.maintenanceLogs;
    this.announcements = d.announcements; this.certificates = d.certificates; this.sdsList = d.sds;
    this.monthlyReports = []; this.tickets = []; this.regulatoryRequirements = d.regulatoryRequirements;
    this.insuranceCertificates = d.insuranceCertificates; this.chatRooms = d.chatRooms;
    this.chatMessages = d.chatMessages; this.invoices = d.invoices;
    
    // Initialize generic CRUD helpers
    this.companyCrud = createGenericCrud(this.companies, 'companies', this);
    this.equipmentCrud = createGenericCrud(this.equipment, 'equipment', this);
    this.usageCrud = createGenericCrud(this.usages, 'usages', this);
    this.consumableCrud = createGenericCrud(this.consumables, 'consumables', this);
    this.orderCrud = createGenericCrud(this.orders, 'orders', this);
    this.projectCrud = createGenericCrud(this.projects, 'projects', this);
    this.labNotebookCrud = createGenericCrud(this.labNotebookEntries, 'labNotebookEntries', this);
    this.maintenanceLogCrud = createGenericCrud(this.maintenanceLogs, 'maintenanceLogs', this);
    this.announcementCrud = createGenericCrud(this.announcements, 'announcements', this);
    this.certificateCrud = createGenericCrud(this.certificates, 'certificates', this);
    this.sdsCrud = createGenericCrud(this.sdsList, 'sdsList', this);
    this.monthlyReportCrud = createGenericCrud(this.monthlyReports, 'monthlyReports', this);
    this.ticketCrud = createGenericCrud(this.tickets, 'tickets', this);
    this.regulatoryRequirementCrud = createGenericCrud(this.regulatoryRequirements, 'regulatoryRequirements', this);
    this.insuranceCertificateCrud = createGenericCrud(this.insuranceCertificates, 'insuranceCertificates', this);

    this.getCompanies = this.companyCrud.getAll; this.getCompanyById = this.companyCrud.getById; this.createCompany = this.companyCrud.create; this.updateCompany = this.companyCrud.update; this.deleteCompany = this.companyCrud.delete; this.subscribeToCompanies = this.companyCrud.subscribe;
    this.getEquipmentList = this.equipmentCrud.getAll; this.getEquipmentById = this.equipmentCrud.getById; this.createEquipment = this.equipmentCrud.create; this.updateEquipment = this.equipmentCrud.update; this.deleteEquipment = this.equipmentCrud.delete; this.subscribeToEquipment = this.equipmentCrud.subscribe;
    this.getUsages = this.usageCrud.getAll; this.getUsageById = this.usageCrud.getById; this.createUsage = this.usageCrud.create; this.updateUsage = this.usageCrud.update; this.deleteUsage = this.usageCrud.delete; this.subscribeToUsages = this.usageCrud.subscribe;
    this.getConsumables = this.consumableCrud.getAll; this.getConsumableById = this.consumableCrud.getById; this.createConsumable = this.consumableCrud.create; this.updateConsumable = this.consumableCrud.update; this.deleteConsumable = this.consumableCrud.delete; this.subscribeToConsumables = this.consumableCrud.subscribe;
    this.getOrders = this.orderCrud.getAll; this.getOrderById = this.orderCrud.getById; this.updateOrder = this.orderCrud.update; this.deleteOrder = this.orderCrud.delete; this.subscribeToOrders = this.orderCrud.subscribe;
    this.getProjects = this.projectCrud.getAll; this.getProjectById = this.projectCrud.getById; this.createProject = this.projectCrud.create; this.updateProject = this.projectCrud.update; this.deleteProject = this.projectCrud.delete; this.subscribeToProjects = this.projectCrud.subscribe;
    this.getLabNotebookEntries = this.labNotebookCrud.getAll; this.createLabNotebookEntry = this.labNotebookCrud.create; this.updateLabNotebookEntry = this.labNotebookCrud.update; this.deleteLabNotebookEntry = this.labNotebookCrud.delete; this.subscribeToLabNotebookEntries = this.labNotebookCrud.subscribe;
    this.getMaintenanceLogs = this.maintenanceLogCrud.getAll; this.getMaintenanceLogById = this.maintenanceLogCrud.getById; this.createMaintenanceLog = this.maintenanceLogCrud.create; this.updateMaintenanceLog = this.maintenanceLogCrud.update; this.deleteMaintenanceLog = this.maintenanceLogCrud.delete; this.subscribeToMaintenanceLogs = this.maintenanceLogCrud.subscribe;
    this.getAnnouncements = this.announcementCrud.getAll; this.getAnnouncementById = this.announcementCrud.getById; this.createAnnouncement = this.announcementCrud.create; this.updateAnnouncement = this.announcementCrud.update; this.deleteAnnouncement = this.announcementCrud.delete; this.subscribeToAnnouncements = this.announcementCrud.subscribe;
    this.getCertificates = this.certificateCrud.getAll; this.getCertificateById = this.certificateCrud.getById; this.createCertificate = this.certificateCrud.create; this.updateCertificate = this.certificateCrud.update; this.deleteCertificate = this.certificateCrud.delete; this.subscribeToCertificates = this.certificateCrud.subscribe;
    this.getSdsList = this.sdsCrud.getAll; this.getSdsById = this.sdsCrud.getById; this.createSds = this.sdsCrud.create; this.updateSds = this.sdsCrud.update; this.deleteSds = this.sdsCrud.delete; this.subscribeToSds = this.sdsCrud.subscribe;
    this.getMonthlyReports = this.monthlyReportCrud.getAll; this.createMonthlyReport = this.monthlyReportCrud.create; this.subscribeToMonthlyReports = this.monthlyReportCrud.subscribe;
    this.getTickets = this.ticketCrud.getAll; this.getTicketById = this.ticketCrud.getById; this.createTicket = this.ticketCrud.create; this.updateTicket = this.ticketCrud.update; this.deleteTicket = this.ticketCrud.delete; this.subscribeToTickets = this.ticketCrud.subscribe;
    this.getRegulatoryRequirements = this.regulatoryRequirementCrud.getAll; this.getRegulatoryRequirementById = this.regulatoryRequirementCrud.getById; this.createRegulatoryRequirement = this.regulatoryRequirementCrud.create; this.updateRegulatoryRequirement = this.regulatoryRequirementCrud.update; this.deleteRegulatoryRequirement = this.regulatoryRequirementCrud.delete; this.subscribeToRegulatoryRequirements = this.regulatoryRequirementCrud.subscribe;
    this.getInsuranceCertificates = this.insuranceCertificateCrud.getAll; this.getInsuranceCertificateById = this.insuranceCertificateCrud.getById; this.createInsuranceCertificate = this.insuranceCertificateCrud.create; this.updateInsuranceCertificate = this.insuranceCertificateCrud.update; this.deleteInsuranceCertificate = this.insuranceCertificateCrud.delete; this.subscribeToInsuranceCertificates = this.insuranceCertificateCrud.subscribe;
  }

  // --- Subscription Management (made public for generic helper) ---
  public notifySubscribers(collectionName: string, data: any[]) {
    const callbacks = this.subscribers.get(collectionName);
    if (callbacks) callbacks.forEach(cb => cb(data));
  }
  
  public createSubscription(collectionName: string, dataArray: any[], callback: (data: any[]) => void): () => void {
    const cbs = this.subscribers.get(collectionName) || [];
    this.subscribers.set(collectionName, [...cbs, callback]);
    callback(dataArray);
    return () => {
      const updatedCbs = (this.subscribers.get(collectionName) || []).filter(cb => cb !== callback);
      this.subscribers.set(collectionName, updatedCbs);
    };
  }

  // --- Specific Implementations ---

  // --- User Operations (custom logic) ---
  async getUsers(): Promise<Result<User[]>> { return { success: true, data: [...this.users] }; }
  async getUserById(id: string): Promise<Result<User | null>> { return { success: true, data: this.users.find(u => u.id === id) || null }; }
  async createUser(data: Omit<User, 'id'>): Promise<Result<User>> {
    try {
      if (this.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new ValidationError('email', 'EXISTS', 'Email already exists.');
      }
      const newUser: User = { ...data, id: simpleUUID() };
      this.users.push(newUser);
      this.notifySubscribers('users', this.users);
      return { success: true, data: newUser };
    } catch (e) {
      return { success: false, error: e as Error };
    }
  }
  async updateUser(user: User): Promise<Result<User>> {
    const i = this.users.findIndex(u => u.id === user.id);
    if (i === -1) return { success: false, error: new Error('User not found') };
    this.users[i] = user;
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

  // --- Reservation Operations (custom logic) ---
  async getReservations(): Promise<Result<Reservation[]>> { return { success: true, data: [...this.reservations] }; }
  async getReservationById(id: string): Promise<Result<Reservation | null>> { return { success: true, data: this.reservations.find(r => r.id === id) || null }; }
  async createReservation(data: Omit<Reservation, 'id'>): Promise<Result<Reservation>> {
     try {
        validateDateRange(data.startTime, data.endTime);
        const newReservation: Reservation = { ...data, id: simpleUUID() };
        this.reservations.push(newReservation);
        this.notifySubscribers('reservations', this.reservations);
        return { success: true, data: newReservation };
    } catch (e) {
        return { success: false, error: e as Error };
    }
  }
  async updateReservation(reservation: Reservation): Promise<Result<Reservation>> {
    const i = this.reservations.findIndex(r => r.id === reservation.id);
    if (i === -1) return { success: false, error: new Error('Reservation not found') };
    this.reservations[i] = reservation;
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

  // --- Task Operations (custom logic, simple) ---
  async getTasks(): Promise<Result<Task[]>> { return { success: true, data: [...this.tasks] }; }
  subscribeToTasks(callback: (data: Task[]) => void): () => void { return this.createSubscription('tasks', this.tasks, callback); }
  async createTask(data: Omit<Task, 'id'>): Promise<Result<Task>> {
    const newTask: Task = { ...data, id: simpleUUID() };
    this.tasks.push(newTask);
    this.notifySubscribers('tasks', this.tasks);
    return { success: true, data: newTask };
  }
  async updateTask(task: Task): Promise<Result<Task>> {
    const i = this.tasks.findIndex(t => t.id === task.id);
    if (i === -1) return { success: false, error: new Error('Task not found') };
    this.tasks[i] = task;
    this.notifySubscribers('tasks', this.tasks);
    return { success: true, data: task };
  }
  async deleteTask(id: string): Promise<Result<void>> {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.notifySubscribers('tasks', this.tasks);
    return { success: true, data: undefined };
  }
  
  // --- Order Creation (custom logic with side effect) ---
  async createOrder(data: Omit<Order, 'id'>): Promise<Result<Order>> {
    // This logic simulates a transaction.
    // The validation (stock check, lock check) is now expected to be done in the action hook.
    this.consumables = this.consumables.map(c => c.id === data.consumableId ? { ...c, stock: c.stock - data.quantity } : c);
    this.notifySubscribers('consumables', this.consumables);
    
    const newOrder: Order = {...data, id: simpleUUID()};
    this.orders.push(newOrder);
    this.notifySubscribers('orders', this.orders);
    return { success: true, data: newOrder };
  }

  // --- Generic Implementations ---
  getCompanies; getCompanyById; createCompany; updateCompany; deleteCompany; subscribeToCompanies;
  getEquipmentList; getEquipmentById; createEquipment; updateEquipment; deleteEquipment; subscribeToEquipment;
  getUsages; getUsageById; createUsage; updateUsage; deleteUsage; subscribeToUsages;
  getConsumables; getConsumableById; createConsumable; updateConsumable; deleteConsumable; subscribeToConsumables;
  getOrders; getOrderById; updateOrder; deleteOrder; subscribeToOrders;
  getProjects; getProjectById; createProject; updateProject; deleteProject; subscribeToProjects;
  getLabNotebookEntries; createLabNotebookEntry; updateLabNotebookEntry; deleteLabNotebookEntry; subscribeToLabNotebookEntries;
  getMaintenanceLogs; getMaintenanceLogById; createMaintenanceLog; updateMaintenanceLog; deleteMaintenanceLog; subscribeToMaintenanceLogs;
  getAnnouncements; getAnnouncementById; createAnnouncement; updateAnnouncement; deleteAnnouncement; subscribeToAnnouncements;
  getCertificates; getCertificateById; createCertificate; updateCertificate; deleteCertificate; subscribeToCertificates;
  getSdsList; getSdsById; createSds; updateSds; deleteSds; subscribeToSds;
  getMonthlyReports; createMonthlyReport; subscribeToMonthlyReports;
  getTickets; getTicketById; createTicket; updateTicket; deleteTicket; subscribeToTickets;
  getRegulatoryRequirements; getRegulatoryRequirementById; createRegulatoryRequirement; updateRegulatoryRequirement; deleteRegulatoryRequirement; subscribeToRegulatoryRequirements;
  getInsuranceCertificates; getInsuranceCertificateById; createInsuranceCertificate; updateInsuranceCertificate; deleteInsuranceCertificate; subscribeToInsuranceCertificates;

  // --- Invoice Operations (simple) ---
  async createInvoice(data: Omit<Invoice, 'id'>): Promise<Result<Invoice>> {
    const newInvoice: Invoice = { ...data, id: simpleUUID() };
    this.invoices.push(newInvoice);
    this.notifySubscribers('invoices', this.invoices);
    return { success: true, data: newInvoice };
  }
  async updateInvoice(invoice: Invoice): Promise<Result<Invoice>> {
    const i = this.invoices.findIndex(inv => inv.id === invoice.id);
    if (i === -1) return { success: false, error: new Error('Invoice not found') };
    this.invoices[i] = invoice;
    this.notifySubscribers('invoices', this.invoices);
    return { success: true, data: invoice };
  }

  // --- Chat Operations (custom logic) ---
  async getChatRooms(userId: string): Promise<Result<ChatRoom[]>> {
    return { success: true, data: this.chatRooms.filter(r => r.participantIds.includes(userId)) };
  }
  subscribeToChatRooms(userId: string, callback: (data: ChatRoom[]) => void): () => void {
    return this.createSubscription('chatRooms', this.chatRooms, (allRooms) => {
        const userRooms = allRooms.filter(r => r.participantIds.includes(userId)).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
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
      return { success: true, data: this.chatMessages.filter(m => m.roomId === roomId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) };
  }
  subscribeToChatMessages(roomId: string, callback: (data: ChatMessage[]) => void): () => void {
      return this.createSubscription('chatMessages', this.chatMessages, (allMessages) => {
          const roomMessages = allMessages.filter(m => m.roomId === roomId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          callback(roomMessages);
      });
  }
  async sendChatMessage(data: Omit<ChatMessage, 'id' | 'readBy'>): Promise<Result<ChatMessage>> {
      const newMessage: ChatMessage = { ...data, id: simpleUUID(), readBy: [data.senderId], createdAt: data.createdAt || new Date() };
      this.chatMessages.push(newMessage);
      const roomIndex = this.chatRooms.findIndex(r => r.id === data.roomId);
      if (roomIndex > -1) {
          const room = this.chatRooms[roomIndex];
          room.lastMessage = data.content;
          room.lastMessageAt = newMessage.createdAt;
          room.participantIds.forEach(pid => { if (pid !== data.senderId) room.unreadCount[pid] = (room.unreadCount[pid] || 0) + 1; });
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