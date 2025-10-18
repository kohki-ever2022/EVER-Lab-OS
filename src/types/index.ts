// src/types/index.ts
// This file centralizes all type definitions for the application
// to prevent circular dependencies and improve maintainability.

// --- Enums & Types from core.ts ---

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export enum Language {
  JA = 'JA',
  EN = 'EN',
}

export enum RoleCategory {
  Facility = 'FACILITY',
  Tenant = 'TENANT',
  External = 'EXTERNAL',
}

export enum Role {
  FacilityDirector = 'FACILITY_DIRECTOR',
  LabManager = 'LAB_MANAGER',
  ProjectManager = 'PROJECT_MANAGER',
  Researcher = 'RESEARCHER',
  Supplier = 'SUPPLIER',
}

// --- Enums & Types from research.ts ---

export enum MilestoneStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
}

export enum TaskScope {
  Team = 'TEAM',
}

export enum TaskStatus {
  ToDo = 'TO_DO',
  InProgress = 'IN_PROGRESS',
  InReview = 'IN_REVIEW',
  Done = 'DONE',
}

export enum TaskPriority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Urgent = 'URGENT',
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: Date;
  status: MilestoneStatus;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  companyId: string;
  memberIds: string[];
  milestones: Milestone[];
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  companyId: string;
  equipmentId?: string;
  consumableIds: { id: string; quantity: number }[];
  requiredVials?: { sampleLotId: string; count: number };
}

export interface SampleLot {
  id: string;
  name: string;
  source: string;
  companyId: string;
  createdAt: Date;
  notes?: string;
}

export interface ProtocolUsageLog {
  id: string;
  protocolId: string;
  userId: string;
  timestamp: Date;
  sampleLotId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  scope: TaskScope;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date;
  dueDate?: Date;
  assigneeIds: string[];
  isPrivate: boolean;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

export interface LabNotebookEntry {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  content: string; // Markdown
  experimentDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  attachments: string[]; // Firebase Storage URLs
  relatedEquipment: string[];
  relatedSamples: string[];
}

// --- Enums & Types from qms.ts ---

export enum ApprovalStatus {}

export enum SDSStatus {
  Pending = 'Pending',
  Approved = 'Approved',
}

export enum CertificateStatus {
  Valid = 'Valid',
  Expired = 'Expired',
}

export enum RegulationType {
  PharmaceuticalLaw = 'PHARMACEUTICAL_LAW',
  CartegenaLaw = 'CARTAGENA_LAW',
  SafetyHealthLaw = 'SAFETY_HEALTH_LAW',
  FireServiceLaw = 'FIRE_SERVICE_LAW',
  PoisonControlLaw = 'POISON_CONTROL_LAW',
  Other = 'OTHER',
}

export enum SubmissionStatus {
  NotRequired = 'NOT_REQUIRED',
  Required = 'REQUIRED',
  Preparing = 'PREPARING',
  Submitted = 'SUBMITTED',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
  Expired = 'EXPIRED',
}

export enum InsuranceType {
  Fire = 'FIRE',
  Liability = 'LIABILITY',
  ProductLiability = 'PRODUCT_LIABILITY',
  WorkersCompensation = 'WORKERS_COMP',
  Other = 'OTHER',
}

export enum ManualCategory {
  GettingStarted = 'GETTING_STARTED',
  EquipmentOperation = 'EQUIPMENT_OPERATION',
  SafetyProcedures = 'SAFETY_PROCEDURES',
  EmergencyResponse = 'EMERGENCY_RESPONSE',
  Compliance = 'COMPLIANCE',
  DataManagement = 'DATA_MANAGEMENT',
  Maintenance = 'MAINTENANCE',
  TenantGuide = 'TENANT_GUIDE',
  FacilityStaffGuide = 'FACILITY_STAFF_GUIDE',
  FAQ = 'FAQ',
  Other = 'OTHER',
}

export enum ManualTargetAudience {
  AllUsers = 'ALL_USERS',
  Tenants = 'TENANTS',
  FacilityStaff = 'FACILITY_STAFF',
  NewUsers = 'NEW_USERS',
  SpecificRoles = 'SPECIFIC_ROLES',
}

export enum LabRuleCategory {
  GeneralConduct = 'GENERAL_CONDUCT',
  SafetyRules = 'SAFETY_RULES',
  EquipmentUsage = 'EQUIPMENT_USAGE',
  ChemicalHandling = 'CHEMICAL_HANDLING',
  WasteDisposal = 'WASTE_DISPOSAL',
  AccessControl = 'ACCESS_CONTROL',
  DataSecurity = 'DATA_SECURITY',
  Cleanliness = 'CLEANLINESS',
  Parking = 'PARKING',
  CommonArea = 'COMMON_AREA',
  Other = 'OTHER',
}

export enum RuleImportance {
  Mandatory = 'MANDATORY',
  Recommended = 'RECOMMENDED',
  Optional = 'OPTIONAL',
}

export interface SDSSummary {
  hazards: string[];
  handling: string;
  storage: string;
  firstAid: string;
  spillResponse: string;
  disposal: string;
  ppe: string[];
}

export interface SDS {
  id: string;
  chemicalName: string;
  cas?: string;
  supplier?: string;
  version: string;
  pdfUrl: string;
  sourceUrl?: string;
  status: SDSStatus;
  scope: 'FACILITY' | 'TENANT';
  tenantId: string;
  receivedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  rejectionReason?: string;
  emergencySummary?: SDSSummary;
  rooms: string[];
}

export interface Certificate {
  id: string;
  userId: string;
  companyId: string;
  certificateType: 'MYCOPLASMA' | 'TRAINING' | 'OTHER';
  issueDate: Date;
  expiryDate: Date;
  status: CertificateStatus;
  testMethod?: 'PCR' | 'Culture' | 'ELISA';
  testingLab?: string;
  fileUrl?: string;
  fileName?: string;
  notes?: string;
}

export interface RegulatoryRequirement {
  id: string;
  tenantId: string;
  type: RegulationType;
  requirementName: string;
  requirementNameJP: string;
  requirementNameEN: string;
  description: string;
  descriptionJP: string;
  descriptionEN: string;
  isApplicable: boolean;
  submissionAuthority: string;
  submissionDeadline?: Date;
  submissionStatus: SubmissionStatus;
  documentUrl?: string;
  notes?: string;
  assignedTo?: string;
  lastUpdated: Date;
  googleCalendarEventId?: string;
}

export interface InsuranceCertificate {
  id: string;
  tenantId: string;
  type: InsuranceType;
  insuranceCompany: string;
  policyNumber: string;
  coverageAmount: number;
  startDate: Date;
  endDate: Date;
  certificateUrl: string;
  uploadedDate: Date;
  uploadedBy: string;
  verifiedBy?: string;
  verifiedDate?: Date;
  status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'REJECTED';
  notes?: string;
  googleCalendarEventId?: string;
}

export interface Manual {
  id: string;
  category: ManualCategory;
  targetAudience: ManualTargetAudience;
  specificRoles?: Role[];
  title: string;
  titleJP: string;
  titleEN: string;
  description: string;
  descriptionJP: string;
  descriptionEN: string;
  content: string;
  contentJP: string;
  contentEN: string;
  attachments: any[]; // ManualAttachment[]
  version: string;
  versionHistory: any[]; // ManualVersion[]
  author: string;
  createdAt: Date;
  updatedAt: Date;
  lastReviewedDate?: Date;
  nextReviewDate?: Date;
  isPublished: boolean;
  publishedDate?: Date;
  viewCount: number;
  lastViewedBy?: string[];
  tags: string[];
  tagsJP: string[];
  tagsEN: string[];
  relatedManuals: string[];
  relatedEquipment?: string[];
}

export interface LabRule {
  id: string;
  category: LabRuleCategory;
  importance: RuleImportance;
  ruleNumber: string;
  title: string;
  titleJP: string;
  titleEN: string;
  description: string;
  descriptionJP: string;
  descriptionEN: string;
  details?: string;
  detailsJP?: string;
  detailsEN?: string;
  violationConsequence?: string;
  violationConsequenceJP?: string;
  violationConsequenceEN?: string;
  targetAudience: ManualTargetAudience;
  specificRoles?: Role[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  relatedManuals: string[];
  relatedRules: string[];
  acknowledgedBy: any[]; // RuleAcknowledgment[]
}

// --- Enums & Types from common.ts ---

export enum UserAvailabilityStatus {
  Available = 'AVAILABLE',
  Busy = 'BUSY',
  Away = 'AWAY',
}

export type Resource =
  | 'reservation'
  | 'equipment'
  | 'inventory'
  | 'sds'
  | 'billing'
  | 'users'
  | 'projects'
  | 'quotations'
  | 'audit'
  | 'settings'
  | 'moneyforward'
  | 'system'
  | 'project'
  | 'regulatory'
  | 'manuals'
  | 'rules';
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'cancelOwn'
  | 'configureSettings';

export enum ContractType {
  Monthly = 'Monthly',
  Annual = 'Annual',
}

export interface SystemSettings {
  labOpeningTime: string;
  labClosingTime: string;
  noShowPenalty: number;
  surgePricingEnabled: boolean;
  surgeMultiplier: number;
  surgeStartTime: string;
  surgeEndTime: string;
}

export interface Announcement {
  id: string;
  titleJP: string;
  titleEN: string;
  contentJP: string;
  contentEN: string;
  startDate: Date;
  endDate: Date;
  importance: any; // AnnouncementImportance
  targetCompanyId?: string[];
  targetRole?: Role[];
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export enum NotificationType {
  EquipmentMalfunction = 'EQUIPMENT_MALFUNCTION',
  LowStock = 'LOW_STOCK',
  CertificateExpiring = 'CERTIFICATE_EXPIRING',
  NewQuotationRequest = 'NEW_QUOTATION_REQUEST',
  ReservationCancelled = 'RESERVATION_CANCELLED',
  General = 'GENERAL',
}

export interface Notification {
  id: string;
  recipientUserId: string;
  type: NotificationType;
  titleJP: string;
  titleEN: string;
  messageJP: string;
  messageEN: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// --- Enums & Types from user.ts ---

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  companyId: string;
  role: Role;
  roleCategory: RoleCategory;
  imageUrl?: string;
  availabilityStatus?: UserAvailabilityStatus;
  statusMessage?: string;
  qualificationIds?: string[];
  favoriteConsumableIds?: string[];
  favoriteEquipmentIds?: string[];
}

export type CurrentUser = Omit<User, 'password'>;

export interface Company {
  id: string;
  nameJP: string;
  nameEN: string;
  planId: string;
  consolidatedBilling: boolean;
  contractType: ContractType;
  contractStartDate: Date;
  nameKana?: string;
  representativeName?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  billingEmail?: string;
  mfPartnerId?: string;
  mfPartnerCode?: string;
  registrationNumber?: string;
  isActive?: boolean;
}

export interface Plan {
  id: string;
  nameJP: string;
  nameEN: string;
  monthlyFee: number;
  detailsJP: string;
  detailsEN: string;
  maxConcurrentUsers: number;
  allowedHoursStart: string;
  allowedHoursEnd: string;
}

export interface RolePermissions {
  role: Role;
  permissions: any[]; // Permission[]
}

// --- Enums & Types from billing.ts ---

export enum InvoiceStatus {}

// --- Enums & Types from chat.ts ---

export interface ChatRoom {
  id: string;
  type: 'TENANT_TO_FACILITY' | 'INTERNAL';
  participantIds: string[]; // User IDsの配列
  tenantId?: string; // テナントからの問い合わせの場合
  subject: string;
  lastMessageAt: Date;
  lastMessage?: string;
  unreadCount: { [userId: string]: number }; // ユーザーごとの未読数
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  attachments?: { name: string; url: string }[]; // Firebase Storage URLs
  createdAt: Date;
  readBy: string[]; // 既読したユーザーID配列
  editedAt?: Date;
}

// --- Enums & Types from equipment.ts ---

export enum EquipmentStatus {
  Available = 'AVAILABLE',
  InUse = 'IN_USE',
  Maintenance = 'MAINTENANCE',
  Calibration = 'CALIBRATION',
}

export enum ReservationStatus {
  AwaitingCheckIn = 'AWAITING_CHECK_IN',
  CheckedIn = 'CHECKED_IN',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
  NoShow = 'NO_SHOW',
  Upcoming = 'UPCOMING',
}

export enum MaintenanceLogStatus {
  Reported = 'REPORTED',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
}

export enum ManualType {
  PDF = 'PDF',
  YouTube = 'YOUTUBE',
  ExternalLink = 'EXTERNAL_LINK',
}

export enum CalendarEventType {
  CO2Replacement = 'CO2_REPLACEMENT',
  InsuranceRenewal = 'INSURANCE_RENEWAL',
  RegulatorySubmission = 'REGULATORY_SUBMISSION',
  EquipmentMaintenance = 'EQUIPMENT_MAINTENANCE',
  ConsumableRestock = 'CONSUMABLE_RESTOCK',
  Meeting = 'MEETING',
  Other = 'OTHER',
}

export interface Equipment {
  id: string;
  nameJP: string;
  nameEN: string;
  categoryJP: string;
  categoryEN: string;
  status: EquipmentStatus;
  rate: number;
  rateUnitJP: string;
  rateUnitEN: string;
  granularity: string;
  imageUrl: string;
  requiredQualificationId?: string;
  personInChargeUserId?: string;
  isReservable: boolean;
  manualIds?: string[];
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  acquisitionDate?: string;
  acquisitionPrice?: number;
  location?: string;
  locationDetailsJP?: string;
  locationDetailsEN?: string;
  knowledgeBaseJP?: string;
  knowledgeBaseEN?: string;
  recommendedProtocolIds?: string[];
  pmIntervalDays?: number;
  lastPmDate?: string;
  calibrationIntervalDays?: number;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  isSpaceOccupying?: boolean;
  monthlyFee?: number;
  pmGoogleCalendarEventId?: string;
  calGoogleCalendarEventId?: string;
}

export interface Reservation {
  id: string;
  userId: string;
  equipmentId: string;
  projectId?: string;
  startTime: Date;
  endTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: ReservationStatus;
  notes?: string;
  isCleanedAfterUse?: boolean;
}

export interface Usage {
  id: string;
  userId: string;
  equipmentId: string;
  reservationId?: string;
  projectId?: string;
  durationMinutes: number;
  date: Date;
  cycles?: number;
  attachments?: string[];
}

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  logType: 'Repair' | 'Calibration' | 'Maintenance';
  status: MaintenanceLogStatus;
  reportedByUserId: string;
  reportDate: Date;
  handledByUserId?: string;
  completionDate?: Date;
  dueDate?: Date;
  notes: string;
  cost?: number;
}

export interface EquipmentManual {
  id: string;
  name: string;
  type: ManualType;
  version: string;
  url: string;
  uploadedByUserId: string;
  createdAt: Date;
}

// --- Enums & Types from inventory.ts ---

export enum OrderStatus {
  Ordered = 'ORDERED',
}

export interface Consumable {
  id: string;
  type: 'sales' | 'internal';
  nameJP: string;
  nameEN: string;
  categoryJP: string;
  categoryEN: string;
  stock: number;
  lowStockThreshold: number;
  price?: number;
  location?: string;
  isHazardous?: boolean;
  hazardousCategory?: string;
  designatedQuantity?: number;
  packageSize?: number;
  packageUnit?: 'mL' | 'L' | 'g' | 'kg';
  sdsId?: string;
  sdsSummaryCacheJP?: SDSSummary;
  sdsSummaryCacheEN?: SDSSummary;
  ownerCompanyId?: string;
  expiryDate?: string;
  manufacturer?: string;
  casNumber?: string;
  modelNumber?: string;
  lotNumber?: string;
  inventoryType: any; // InventoryType
  poisonousDesignation?: any; // PoisonousDesignation
  properStock?: number;
  isLocked?: boolean;
  lockDate?: Date;
}

export interface Order {
  id: string;
  userId: string;
  companyId: string;
  consumableId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderDate: Date;
  status: OrderStatus;
  projectId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  companyId: string;
}

export interface Quotation {
  id: string;
  requesterId: string;
  companyId: string;
  productName: string;
  productDetails: string;
  quantity: number;
  supplierIds: string[];
  requestDate: Date;
  status: any; // QuotationStatus
  responses: any[]; // QuotationResponse[]
  quotationToken: string;
  tokenExpiresAt: Date;
}

export interface Inquiry {
  id: string;
  requesterId: string;
  companyId: string;
  subject: string;
  message: string;
  supplierIds: string[];
  requestDate: Date;
  status: any; // InquiryStatus
  responses: any[]; // InquiryResponse[]
  isRead: boolean;
}

export interface InventorySnapshot {
  id: string;
  snapshotDate: Date;
  period: string; // YYYY-MM
  consumables: {
    id: string;
    nameJP: string;
    nameEN: string;
    stock: number;
    unit: string;
    categoryJP: string;
    categoryEN: string;
    ownerCompanyId?: string;
  }[];
  createdBy: string;
  notes?: string;
}

// --- Enums & Types from reports.ts ---

export interface MonthlyReport {
  id: string;
  period: string; // YYYY-MM
  generatedAt: Date;
  generatedByUserId: string;
  markdownContent: string;
}
