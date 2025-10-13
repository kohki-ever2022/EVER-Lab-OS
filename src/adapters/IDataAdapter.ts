// src/adapters/IDataAdapter.ts

// 必要な型定義をインポート
import {
  User,
  Company,
  Announcement,
  Equipment,
  Reservation,
  Usage,
  MaintenanceLog,
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

/**
 * データ永続化層の抽象インターフェース (Repository Pattern)。
 * このインターフェースを実装することで、モックデータ、Firebase、または他のバックエンドと
 * アプリケーションロジックを疎結合に保つ（Adapter Pattern）。
 */
export interface IDataAdapter {
  // --- User Operations ---
  getUsers(): Promise<Result<User[]>>;
  getUserById(id: string): Promise<Result<User | null>>;
  createUser(data: Omit<User, 'id'>): Promise<Result<User>>;
  updateUser(user: User): Promise<Result<User>>;
  deleteUser(id: string): Promise<Result<void>>;
  /** ユーザーコレクションのリアルタイム更新を購読する。戻り値は購読解除用の関数。 */
  subscribeToUsers(callback: (data: User[]) => void): () => void;

  // --- Company Operations ---
  getCompanies(): Promise<Result<Company[]>>;
  getCompanyById(id: string): Promise<Result<Company | null>>;
  createCompany(data: Omit<Company, 'id'>): Promise<Result<Company>>;
  updateCompany(company: Company): Promise<Result<Company>>;
  deleteCompany(id: string): Promise<Result<void>>;
  subscribeToCompanies(callback: (data: Company[]) => void): () => void;

  // --- Equipment Operations ---
  getEquipmentList(): Promise<Result<Equipment[]>>;
  getEquipmentById(id: string): Promise<Result<Equipment | null>>;
  createEquipment(data: Omit<Equipment, 'id'>): Promise<Result<Equipment>>;
  updateEquipment(equipment: Equipment): Promise<Result<Equipment>>;
  deleteEquipment(id: string): Promise<Result<void>>;
  subscribeToEquipment(callback: (data: Equipment[]) => void): () => void;

  // --- Reservation Operations ---
  getReservations(): Promise<Result<Reservation[]>>;
  getReservationById(id: string): Promise<Result<Reservation | null>>;
  createReservation(data: Omit<Reservation, 'id'>): Promise<Result<Reservation>>;
  updateReservation(reservation: Reservation): Promise<Result<Reservation>>;
  deleteReservation(id: string): Promise<Result<void>>;
  /** 予約状況はリアルタイム性が高いため、購読機能を設ける。 */
  subscribeToReservations(callback: (data: Reservation[]) => void): () => void;

  // --- Usage Operations ---
  getUsages(): Promise<Result<Usage[]>>;
  getUsageById(id: string): Promise<Result<Usage | null>>;
  createUsage(data: Omit<Usage, 'id'>): Promise<Result<Usage>>;
  updateUsage(usage: Usage): Promise<Result<Usage>>;
  deleteUsage(id: string): Promise<Result<void>>;
  subscribeToUsages(callback: (data: Usage[]) => void): () => void;

  // --- Consumable Operations ---
  getConsumables(): Promise<Result<Consumable[]>>;
  getConsumableById(id: string): Promise<Result<Consumable | null>>;
  createConsumable(data: Omit<Consumable, 'id'>): Promise<Result<Consumable>>;
  updateConsumable(consumable: Consumable): Promise<Result<Consumable>>;
  deleteConsumable(id: string): Promise<Result<void>>;
  /** 在庫数はリアルタイム性が高いため、購読機能を設ける。 */
  subscribeToConsumables(callback: (data: Consumable[]) => void): () => void;

  // --- Order Operations ---
  getOrders(): Promise<Result<Order[]>>;
  getOrderById(id: string): Promise<Result<Order | null>>;
  createOrder(data: Omit<Order, 'id'>): Promise<Result<Order>>;
  updateOrder(order: Order): Promise<Result<Order>>;
  deleteOrder(id: string): Promise<Result<void>>;
  subscribeToOrders(callback: (data: Order[]) => void): () => void;

  // --- Project Operations ---
  getProjects(): Promise<Result<Project[]>>;
  getProjectById(id: string): Promise<Result<Project | null>>;
  createProject(data: Omit<Project, 'id'>): Promise<Result<Project>>;
  updateProject(project: Project): Promise<Result<Project>>;
  deleteProject(id: string): Promise<Result<void>>;
  subscribeToProjects(callback: (data: Project[]) => void): () => void;

  // --- Task Operations ---
  getTasks(): Promise<Result<Task[]>>;
  subscribeToTasks(callback: (data: Task[]) => void): () => void;

  // --- MaintenanceLog Operations ---
  getMaintenanceLogs(): Promise<Result<MaintenanceLog[]>>;
  getMaintenanceLogById(id: string): Promise<Result<MaintenanceLog | null>>;
  createMaintenanceLog(data: Omit<MaintenanceLog, 'id'>): Promise<Result<MaintenanceLog>>;
  updateMaintenanceLog(log: MaintenanceLog): Promise<Result<MaintenanceLog>>;
  deleteMaintenanceLog(id: string): Promise<Result<void>>;
  subscribeToMaintenanceLogs(callback: (data: MaintenanceLog[]) => void): () => void;

  // --- Announcement Operations ---
  getAnnouncements(): Promise<Result<Announcement[]>>;
  getAnnouncementById(id: string): Promise<Result<Announcement | null>>;
  createAnnouncement(data: Omit<Announcement, 'id'>): Promise<Result<Announcement>>;
  updateAnnouncement(announcement: Announcement): Promise<Result<Announcement>>;
  deleteAnnouncement(id: string): Promise<Result<void>>;
  /** お知らせもリアルタイムで更新されることが望ましい。 */
  subscribeToAnnouncements(callback: (data: Announcement[]) => void): () => void;

  // --- Certificate Operations ---
  getCertificates(): Promise<Result<Certificate[]>>;
  getCertificateById(id: string): Promise<Result<Certificate | null>>;
  createCertificate(data: Omit<Certificate, 'id'>): Promise<Result<Certificate>>;
  updateCertificate(certificate: Certificate): Promise<Result<Certificate>>;
  deleteCertificate(id: string): Promise<Result<void>>;
  subscribeToCertificates(callback: (data: Certificate[]) => void): () => void;

  // --- SDS Operations ---
  getSdsList(): Promise<Result<SDS[]>>;
  getSdsById(id: string): Promise<Result<SDS | null>>;
  createSds(data: Omit<SDS, 'id'>): Promise<Result<SDS>>;
  updateSds(sds: SDS): Promise<Result<SDS>>;
  deleteSds(id: string): Promise<Result<void>>;
  subscribeToSds(callback: (data: SDS[]) => void): () => void;

  // --- Monthly Report Operations ---
  getMonthlyReports(): Promise<Result<MonthlyReport[]>>;
  createMonthlyReport(data: Omit<MonthlyReport, 'id'>): Promise<Result<MonthlyReport>>;
  subscribeToMonthlyReports(callback: (data: MonthlyReport[]) => void): () => void;
  
  // --- Ticket Operations ---
  getTickets(): Promise<Result<Ticket[]>>;
  getTicketById(id: string): Promise<Result<Ticket | null>>;
  createTicket(data: Omit<Ticket, 'id'>): Promise<Result<Ticket>>;
  updateTicket(ticket: Ticket): Promise<Result<Ticket>>;
  deleteTicket(id: string): Promise<Result<void>>;
  subscribeToTickets(callback: (data: Ticket[]) => void): () => void;

  // --- RegulatoryRequirement Operations ---
  getRegulatoryRequirements(): Promise<Result<RegulatoryRequirement[]>>;
  getRegulatoryRequirementById(id: string): Promise<Result<RegulatoryRequirement | null>>;
  createRegulatoryRequirement(data: Omit<RegulatoryRequirement, 'id'>): Promise<Result<RegulatoryRequirement>>;
  updateRegulatoryRequirement(req: RegulatoryRequirement): Promise<Result<RegulatoryRequirement>>;
  deleteRegulatoryRequirement(id: string): Promise<Result<void>>;
  subscribeToRegulatoryRequirements(callback: (data: RegulatoryRequirement[]) => void): () => void;

  // --- InsuranceCertificate Operations ---
  getInsuranceCertificates(): Promise<Result<InsuranceCertificate[]>>;
  getInsuranceCertificateById(id: string): Promise<Result<InsuranceCertificate | null>>;
  createInsuranceCertificate(data: Omit<InsuranceCertificate, 'id'>): Promise<Result<InsuranceCertificate>>;
  updateInsuranceCertificate(cert: InsuranceCertificate): Promise<Result<InsuranceCertificate>>;
  deleteInsuranceCertificate(id: string): Promise<Result<void>>;
  subscribeToInsuranceCertificates(callback: (data: InsuranceCertificate[]) => void): () => void;

  // --- Invoice Operations ---
  createInvoice(data: Omit<Invoice, 'id'>): Promise<Result<Invoice>>;
  updateInvoice(invoice: Invoice): Promise<Result<Invoice>>;

  // --- Chat Operations ---
  getChatRooms(userId: string): Promise<Result<ChatRoom[]>>;
  subscribeToChatRooms(userId: string, callback: (data: ChatRoom[]) => void): () => void;
  createChatRoom(data: Omit<ChatRoom, 'id'>): Promise<Result<ChatRoom>>;
  getChatMessages(roomId: string): Promise<Result<ChatMessage[]>>;
  subscribeToChatMessages(roomId: string, callback: (data: ChatMessage[]) => void): () => void;
  sendChatMessage(data: Omit<ChatMessage, 'id' | 'readBy'>): Promise<Result<ChatMessage>>;
  markMessageAsRead(roomId: string, userId: string): Promise<Result<void>>;
}