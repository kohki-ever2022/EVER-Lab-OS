// src/types/index.ts
// This file centralizes all type definitions for the application
// to prevent circular dependencies and improve maintainability.

// --- Enums & Types from core.ts ---

export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

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

export type View = AdminView | TenantView | SupplierView;

export type AdminView =
    | 'adminDashboard' | 'equipmentManagement' | 'billingManagement'
    | 'userManagement' | 'roleManagement' | 'settings' | 'auditLog'
    | 'maintenanceLog' | 'allInventoryViewer' | 'salesConsumablesManagement'
    | 'internalConsumablesManagement' | 'hazardousMaterialsDashboard'
    | 'labCalendarAdmin' | 'memos' | 'facilityDashboard' | 'compliance'
    | 'bsl2Checklist' | 'facilityLayout' | 'introductionsPipeline'
    | 'qmsDashboard' | 'cmmsDashboard' | 'coldChain' | 'dataPlatform'
    | 'tenantCrm' | 'legalDocsIp' | 'ehsDashboard' | 'budgeting'
    | 'wasteCompliance' | 'helpdesk' | 'allOrders' | 'inventoryLockManager'
    | 'facilityConsumableNotification' | 'co2IncubatorManagement' | 'manuals' | 'rules'
    | 'insuranceManagement' | 'monthlyReportGenerator' | 'training' | 'sdsManagement'
    | 'projectProgress' | 'projectGanttChart' | 'chat';

export type TenantView =
    | 'dashboard' | 'equipment' | 'reservations' | 'billing' | 'announcements'
    | 'profile' | 'memberManagement' | 'maintenanceStatus' | 'projects'
    | 'certificateManagement' | 'insuranceManagement' | 'labCalendarUser' | 'protocols'
    | 'sampleManagement' | 'billingSummary' | 'tasks' | 'training'
    | 'myTickets' | 'sdsManagement' | 'quotationList' | 'purchaseOrders'
    | 'inventoryList' | 'consumablesStore' | 'supplierInquiry'
    | 'reorderSuggestions' | 'supplierManagement' | 'favoriteConsumables'
    | 'facilityConsumableNotification' | 'manuals' | 'rules' | 'electronicLabNotebook'
    | 'projectProgress' | 'projectGanttChart' | 'chat';

export type SupplierView = 'dashboard' | 'profile' | 'supplierDashboard';

// --- Enums & Types from research.ts ---

export enum MilestoneStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
}

export enum TaskScope {
  Personal = 'PERSONAL',
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

export enum PipelineStage {
  Idea = 'IDEA',
  Sourcing = 'SOURCING',
  Ordered = 'ORDERED',
  Installation = 'INSTALLATION',
  Validation = 'VALIDATION',
  InService = 'IN_SERVICE',
}

export enum VialStatus {
    Available = 'Available',
    Reserved = 'Reserved',
    InUse = 'InUse',
    Depleted = 'Depleted',
    Disposed = 'Disposed',
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
  consumableIds: { id: string, quantity: number }[];
  requiredVials?: { sampleLotId: string, count: number };
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

export interface PipelineItem {
  id: string;
  name: string;
  type: 'Equipment' | 'Reagent';
  stage: PipelineStage;
}

export interface Freezer {
  id: string;
  name: string;
  location: string;
  targetTemperature: number;
}

export interface FreezerRack {
  id: string;
  name: string;
  freezerId: string;
}

export interface SampleBox {
  id: string;
  name: string;
  rackId: string;
  gridSize: [number, number]; // [rows, columns]
}

export interface Vial {
  id: string;
  sampleLotId: string;
  boxId: string;
  position: [number, number]; // [row, column]
  status: VialStatus;
  volume: number;
  volumeUnit: 'uL' | 'mL';
  expiryDate: Date;
  custodyChain: { id: string; userId: string; timestamp: Date; action: string; details: string }[];
}

export interface TemperatureLog {
  id: string;
  freezerId: string;
  timestamp: Date;
  temperature: number;
  isExcursion: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
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

export enum DocumentStatus {
    Draft = 'Draft',
    InApproval = 'InApproval',
    Effective = 'Effective',
    Retired = 'Retired',
}

export enum ApprovalStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
}

export enum DeviationStatus {
    Open = 'Open',
    UnderInvestigation = 'UnderInvestigation',
    CapaInitiated = 'CapaInitiated',
    Closed = 'Closed',
}

export enum LegalDocumentType {
    NDA = 'NDA',
    MTA = 'MTA',
    CDA = 'CDA',
    LeaseAgreement = 'LeaseAgreement',
}

export enum LegalDocumentStatus {
    Draft = 'Draft',
    InReview = 'InReview',
    Active = 'Active',
    Expired = 'Expired',
}

export enum EhsIncidentType {
    Incident = 'Incident',
    NearMiss = 'NearMiss',
    SafetyObservation = 'SafetyObservation',
}

export enum EhsIncidentStatus {
    Reported = 'Reported',
    UnderInvestigation = 'UnderInvestigation',
    ActionsPending = 'ActionsPending',
    Closed = 'Closed',
}

export enum RiskLikelihood {
    Rare = 1,
    Unlikely = 2,
    Possible = 3,
    Likely = 4,
    AlmostCertain = 5,
}

export enum RiskSeverity {
    Insignificant = 1,
    Minor = 2,
    Moderate = 3,
    Major = 4,
    Catastrophic = 5,
}

export enum RiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical',
}

export enum BudgetType {
    Company = 'Company',
    Project = 'Project',
}

export enum WasteStreamType {
    OrganicSolvent = 'OrganicSolvent',
    HalogenatedSolvent = 'HalogenatedSolvent',
    AqueousAcid = 'AqueousAcid',
    AqueousAlkali = 'AqueousAlkali',
    Solid = 'Solid',
}

export enum WasteContainerStatus {
    Active = 'Active',
    Full = 'Full',
    PendingPickup = 'PendingPickup',
    Disposed = 'Disposed',
}

export enum WastePickupStatus {
    Scheduled = 'Scheduled',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
}

export enum TicketCategory {
    Equipment = 'Equipment',
    IT = 'IT',
    Facility = 'Facility',
    Billing = 'Billing',
    Other = 'Other',
}

export enum TicketStatus {
    Open = 'Open',
    InProgress = 'InProgress',
    Resolved = 'Resolved',
    Closed = 'Closed',
}

export enum TicketPriority {
    Low = 'Low',
    Medium = 'MEDIUM',
    High = 'High',
    Urgent = 'Urgent',
}

export enum SDSStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Superseded = 'Superseded',
}

export enum CertificateStatus {
    Valid = 'Valid',
    Expiring = 'Expiring',
    Expired = 'Expired',
}

export enum RegulationType {
  PharmaceuticalLaw = 'PHARMACEUTICAL_LAW',
  CartegenaLaw = 'CARTAGENA_LAW',
  SafetyHealthLaw = 'SAFETY_HEALTH_LAW',
  FireServiceLaw = 'FIRE_SERVICE_LAW',
  PoisonControlLaw = 'POISON_CONTROL_LAW',
  Other = 'OTHER'
}

export enum SubmissionStatus {
  NotRequired = 'NOT_REQUIRED',
  Required = 'REQUIRED',
  Preparing = 'PREPARING',
  Submitted = 'SUBMITTED',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
  Expired = 'EXPIRED'
}

export enum SupportStaffType {
  SocialInsuranceLaborConsultant = 'SOCIAL_INSURANCE',
  AdministrativeScrivener = 'ADMINISTRATIVE_SCRIVENER',
  FacilityStaff = 'FACILITY_STAFF'
}

export enum InsuranceType {
  Fire = 'FIRE',
  Liability = 'LIABILITY',
  ProductLiability = 'PRODUCT_LIABILITY',
  WorkersCompensation = 'WORKERS_COMP',
  Other = 'OTHER'
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
  Other = 'OTHER'
}

export enum ManualTargetAudience {
  AllUsers = 'ALL_USERS',
  Tenants = 'TENANTS',
  FacilityStaff = 'FACILITY_STAFF',
  LabManagers = 'LAB_MANAGERS',
  Administrators = 'ADMINISTRATORS',
  NewUsers = 'NEW_USERS',
  SpecificRoles = 'SPECIFIC_ROLES'
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
  Other = 'OTHER'
}

export enum RuleImportance {
  Mandatory = 'MANDATORY',
  Recommended = 'RECOMMENDED',
  Optional = 'OPTIONAL'
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

export interface ControlledDocument {
    id: string;
    title: string;
    docType: 'SOP' | 'Manual' | 'Policy';
    latestVersion: number;
    currentStatus: DocumentStatus;
}

export interface Approval {
    id: string;
    approverId: string;
    status: ApprovalStatus;
    approvedAt?: Date;
    comments?: string;
}

export interface DocumentVersion {
    id: string;
    documentId: string;
    version: number;
    title: string;
    content: string;
    status: DocumentStatus;
    createdByUserId: string;
    createdAt: Date;
    effectiveDate?: Date;
    approvals: Approval[];
}

export interface Deviation {
    id: string;
    title: string;
    description: string;
    reportedAt: Date;
    reportedByUserId: string;
    status: DeviationStatus;
    relatedDocumentId?: string;
    capaId?: string;
}

export interface Capa {
    id: string;
    deviationId: string;
    rootCause: string;
    correctiveActions: string[];
    preventiveActions: string[];
}

export interface ChangeRequest {
    id: string;
    title: string;
    description: string;
    requestedByUserId: string;
    requestedAt: Date;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface ReadReceipt {
    id: string;
    documentVersionId: string;
    userId: string;
    readAt: Date;
}

export interface ESignature {
    userId: string;
    timestamp: Date;
    reason: string;
}

export interface LegalDocument {
    id: string;
    title: string;
    type: LegalDocumentType;
    status: LegalDocumentStatus;
    companyId: string;
    content: string;
    version: number;
    createdAt: Date;
    effectiveDate?: Date;
    expiryDate?: Date;
    approvals: Approval[];
}

export interface LegalClause {
    id: string;
    title: string;
    content: string;
}

export interface FiveWhy {
  problemStatement: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  rootCause: string;
}

export interface EhsActionItem {
  id: string;
  description: string;
  assigneeId: string;
  dueDate: Date;
  isCompleted: boolean;
}

export interface EhsIncident {
  id: string;
  title: string;
  description: string;
  type: EhsIncidentType;
  status: EhsIncidentStatus;
  reportedAt: Date;
  reportedByUserId: string;
  location: string;
  involvedUserIds: string[];
  likelihood?: RiskLikelihood;
  severity?: RiskSeverity;
  riskLevel?: RiskLevel;
  fiveWhy?: FiveWhy;
  actionItems: EhsActionItem[];
  requiresRetraining?: boolean;
}

export interface Budget {
  id: string;
  name: string;
  type: BudgetType;
  targetId: string; // Company ID or Project ID
  periodStart: Date;
  periodEnd: Date;
  capexAmount: number;
  opexAmount: number;
}

export interface WasteChemical {
  id: string;
  name: string;
  casNumber: string;
}

export interface WasteContainer {
  id: string;
  name: string;
  type: WasteStreamType;
  location: string;
  capacity: number;
  currentVolume: number;
  status: WasteContainerStatus;
  chemicals: { chemicalId: string, amount: number }[];
}

export interface WastePickupSchedule {
  id: string;
  scheduledDate: Date;
  vendor: string;
  containerIds: string[];
  status: WastePickupStatus;
  manifestId?: string;
}

export interface WasteManifest {
  id: string;
  pickupId: string;
  generationDate: Date;
  containerIds: string[];
}

export interface TicketComment {
    id: string;
    authorId: string;
    content: string;
    createdAt: Date;
    isInternal: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  requesterId: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
  slaDueDate: Date;
  comments: TicketComment[];
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string; // Markdown
  category: TicketCategory;
  keywords: string[];
}

export interface CsatSurvey {
  id: string;
  ticketId: string;
  rating: number; // 1-5
  comment?: string;
  submittedAt: Date;
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

export interface RegulatorySupport {
  id: string;
  requirementId: string;
  tenantId: string;
  supportStaffType: SupportStaffType;
  supportContent: string;
  supportContentJP: string;
  supportContentEN: string;
  providedBy: string;
  providedDate: Date;
  documents: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface MHLWSubmissionChecklist {
  id: string;
  tenantId: string;
  fiscalYear: number;
  items: {
    itemName: string;
    itemNameJP: string;
    itemNameEN: string;
    isRequired: boolean;
    deadline: Date;
    status: SubmissionStatus;
    documentUrl?: string;
  }[];
  lastReviewDate: Date;
  nextReviewDate: Date;
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

export interface ManualAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'PDF' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ManualVersion {
  version: string;
  changedAt: Date;
  changedBy: string;
  changeDescription: string;
  changeDescriptionJP: string;
  changeDescriptionEN: string;
  previousContent?: string;
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
  attachments: ManualAttachment[];
  version: string;
  versionHistory: ManualVersion[];
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
  acknowledgedBy: RuleAcknowledgment[];
}

export interface RuleAcknowledgment {
  userId: string;
  userName: string;
  acknowledgedAt: Date;
  ruleVersion: string;
}

export interface ViewHistory {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'MANUAL' | 'RULE';
  viewedAt: Date;
  duration?: number;
}

export interface ManualSearchFilter {
  category?: ManualCategory[];
  targetAudience?: ManualTargetAudience[];
  tags?: string[];
  searchText?: string;
  dateFrom?: Date;
  dateTo?: Date;
}


// --- Enums & Types from common.ts ---

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export enum UserAvailabilityStatus {
  Available = 'AVAILABLE',
  Busy = 'BUSY',
  Away = 'AWAY',
}

export enum CourseStatus {
    NotStarted = 'NotStarted',
    InProgress = 'InProgress',
    Completed = 'Completed',
}

export enum TenantLifecycleStage {
    Lead = 'Lead',
    Application = 'Application',
    Kyc = 'Kyc',
    Contract = 'Contract',
    MoveIn = 'MoveIn',
    Onboarding = 'Onboarding',
    Active = 'Active',
    Offboarding = 'Offboarding',
    Archived = 'Archived',
}

export type Resource = 'reservation' | 'equipment' | 'inventory' | 'sds' | 'billing' | 'users' | 'projects' | 'quotations' | 'audit' | 'settings' | 'moneyforward' | 'system' | 'project' | 'regulatory' | 'manuals' | 'rules';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'cancelOwn' | 'configureSettings';

export enum ContractType {
    Monthly = 'Monthly',
    Annual = 'Annual',
    MultiMonth = 'MultiMonth',
}

export enum AnnouncementImportance {
  Urgent = 'URGENT',
  Important = 'IMPORTANT',
  Normal = 'NORMAL',
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
  importance: AnnouncementImportance;
  targetCompanyId?: string[];
  targetRole?: Role[];
}

export interface FixedOption {
  id: string;
  nameJP: string;
  nameEN: string;
  monthlyFee: number;
}

export interface BenchAssignment {
  id: string;
  companyId: string;
  startDate: string;
  fixedOptionIds: string[];
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

export interface Memo {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
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

export interface Qualification {
  id: string;
  nameJP: string;
  nameEN: string;
}

export interface Shift {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  shiftTypeJP: string;
  shiftTypeEN: string;
  notesJP?: string;
  notesEN?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  content: string; // Markdown/HTML content
  quiz: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: string;
    }[];
    passingScore: number;
  };
  qualificationId: string; // The qualification awarded upon completion
}

export interface UserCertification {
  id: string;
  userId: string;
  qualificationId: string;
  issuedAt: Date;
  expiresAt: Date;
  courseId: string;
}

export interface UserCourseProgress {
  id: string;
  userId: string;
  courseId: string;
  status: CourseStatus;
  score?: number;
  completedAt?: Date;
}

export interface Tenant {
    id: string; // Corresponds to Company ID
    primaryContactId: string; // Corresponds to User ID of primary contact
    stage: TenantLifecycleStage;
    kycStatus: 'Pending' | 'Approved' | 'Rejected';
}

export interface Permission {
  resource: Resource;
  action: Action;
  scope: 'all' | 'own_tenant' | 'own_only';
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

// --- Enums & Types from billing.ts ---

export enum InvoiceStatus {
    Draft = 'Draft',
    Issued = 'Issued',
    Sent = 'Sent',
    Paid = 'Paid',
    Overdue = 'Overdue',
    Cancelled = 'Cancelled',
}

export enum PaymentMethod {
  Monthly = 'MONTHLY',
  Annual = 'ANNUAL',
  MultiMonth = 'MULTI_MONTH'
}

export enum PaymentCycle {
  CurrentMonth = 'CURRENT_MONTH',
  NextMonth = 'NEXT_MONTH',
  Immediate = 'IMMEDIATE'
}

export enum ChargeItemType {
  BaseRent = 'BASE_RENT',
  EquipmentUsage = 'EQUIPMENT_USAGE',
  DedicatedEquipment = 'DEDICATED_EQUIPMENT',
  Option = 'OPTION',
  Utility = 'UTILITY'
}

export interface ChargeItem {
  id: string;
  type: ChargeItemType;
  name: string;
  nameJP: string;
  nameEN: string;
  amount: number;
  paymentCycle: PaymentCycle;
  isTaxable: boolean;
  tenantId: string;
  equipmentId?: string;
  startDate: Date;
  endDate?: Date;
}

export interface TaxRate {
  id: string;
  effectiveDate: string;
  rate: number;
}

export interface InvoiceLine {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  companyName: string;
  period: string; // YYYY-MM
  issueDate: Date;
  dueDate: Date;
  fixedCosts: {
    facilityFee: number;
    storageFee: number;
  };
  variableCosts: {
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotalBeforeTax: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  mfPartnerId?: string;
  mfInvoiceId?: string;
  mfInvoiceUrl?: string;
  mfPdfUrl?: string;
  localPdfPath?: string;
}

export interface SpaceOccupyingLease {
    id: string;
    tenantId: string;
    equipmentId: string;
    monthlyFee: number;
    startDate: Date;
    endDate?: Date;
}

export interface MFConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: string;
}

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

export enum ChatRoomType {
  TenantToFacility = 'TENANT_TO_FACILITY',
  Internal = 'INTERNAL'
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

export enum WorkOrderStatus {
    Open = 'Open',
    InProgress = 'InProgress',
    OnHold = 'OnHold',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
}

export enum CalibrationStatus {
    Ok = 'Ok',
    Due = 'Due',
    Overdue = 'Overdue',
    OutOfTolerance = 'OutOfTolerance',
}

export enum WaitlistStatus {
    Pending = 'Pending',
    Notified = 'Notified',
    Fulfilled = 'Fulfilled',
    Expired = 'Expired',
    Cancelled = 'Cancelled',
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
  Other = 'OTHER'
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

export interface WaitlistEntry {
  id: string;
  userId: string;
  equipmentId: string;
  requestedStartTime: Date;
  requestedEndTime: Date;
  createdAt: Date;
  status: WaitlistStatus;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  equipmentId: string;
  status: WorkOrderStatus;
  priority: TaskPriority;
  assigneeId?: string;
  createdAt: Date;
  dueDate?: Date;
}

export interface CalibrationRecord {
  id: string;
  equipmentId: string;
  performedAt: Date;
  performedByUserId: string;
  status: CalibrationStatus;
  notes?: string;
  certificateUrl?: string;
}

export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  stock: number;
  location: string;
}

export interface CO2IncubatorTracking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  gasType: 'CO2' | 'N2' | 'O2';
  cylinderSize: number; // in kg
  currentLevel: number; // in kg
  minimumLevel: number; // in kg, threshold for critical alert
  lastMeasuredDate: Date;
  lastMeasuredBy: string; // userId
  previousLevel?: number; // for calculation
  previousDate?: Date; // for calculation
  estimatedEmptyDate: Date | null;
  alertTriggered: boolean;
  alertDate?: Date;
  notes?: string;
  replacementScheduled: boolean;
  replacementDate?: Date;
  googleCalendarEventId?: string;
}

export interface CalendarEvent {
  id: string;
  eventType: CalendarEventType;
  title: string;
  titleJP: string;
  titleEN: string;
  description: string;
  descriptionJP: string;
  descriptionEN: string;
  startDateTime: Date;
  endDateTime: Date;
  isAllDay: boolean;
  location?: string;
  googleCalendarEventId?: string;
  isSyncedToGoogle: boolean;
  lastSyncedAt?: Date;
  reminderMinutes: number[];
  relatedItemId?: string;
  assignedTo: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  completedAt?: Date;
  completedBy?: string;
}

export interface GoogleCalendarSyncSettings {
  userId: string;
  isEnabled: boolean;
  calendarId: string;
  syncEventTypes: CalendarEventType[];
  autoSync: boolean;
  lastSyncAt?: Date;
  syncErrors?: string[];
}

export interface CalendarSyncResult {
  success: boolean;
  googleCalendarEventId?: string;
  errorMessage?: string;
  syncedAt: Date;
}

// --- Enums & Types from inventory.ts ---

export enum OrderStatus {
  PendingApproval = 'PENDING_APPROVAL',
  Approved = 'APPROVED',
  Ordered = 'ORDERED',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED',
  Rejected = 'REJECTED',
}

export enum InventoryType {
  General = 'general',
  Volume = 'volume',
  HazardousOrPoisonous = 'hazardous_poison',
  Unclassified = 'unclassified',
}

export enum PoisonousDesignation {
  None = 'NONE',
  Poison = 'POISON',
  Deleterious = 'DELETERIOUS',
  SpecifiedPoison = 'SPECIFIED_POISON',
}

export enum QuotationStatus {
  Requested = 'REQUESTED',
  Answered = 'ANSWERED',
  Ordered = 'ORDERED',
  Expired = 'EXPIRED',
}

export enum InquiryStatus {
  Sent = 'SENT',
  Answered = 'ANSWERED',
}

export enum ExpenseType {
    CapEx = 'CapEx',
    OpEx = 'OpEx',
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
  inventoryType: InventoryType;
  poisonousDesignation?: PoisonousDesignation;
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

export interface PurchaseOrderLine {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    expenseType: ExpenseType;
}

export interface PurchaseOrder {
  id: string;
  requesterId: string;
  companyId: string;
  orderDate: Date;
  status: OrderStatus;
  lines: PurchaseOrderLine[];
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

export interface QuotationResponse {
  supplierId: string;
  answeredAt: Date;
  price?: number;
  deliveryDate?: Date;
  validUntil?: Date;
  storageCondition?: string;
  isHazardous?: boolean;
  hazardousCategory?: string;
  designatedQuantity?: number;
  packageSize?: number;
  packageUnit?: string;
  notes?: string;
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
  status: QuotationStatus;
  responses: QuotationResponse[];
  quotationToken: string;
  tokenExpiresAt: Date;
}

export interface InquiryResponse {
    supplierId: string;
    respondedAt: Date;
    message: string;
}

export interface Inquiry {
  id: string;
  requesterId: string;
  companyId: string;
  subject: string;
  message: string;
  supplierIds: string[];
  requestDate: Date;
  status: InquiryStatus;
  responses: InquiryResponse[];
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

export interface ConsumableNotification {
  id: string;
  consumableId: string;
  consumableName: string;
  consumableNameJP: string;
  consumableNameEN: string;
  location: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  reportedBy: string;
  reportedDate: Date;
  acknowledgedBy?: string;
  acknowledgedDate?: Date;
  restockedDate?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'REPORTED' | 'ACKNOWLEDGED' | 'RESTOCKING' | 'COMPLETED';
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

// --- Enums & Types from supplier.ts ---

export interface QuotationRequest {
  id: string;
  requesterId: string;
  supplierId: string;
  items: QuotationItem[];
  requestDate: Date;
  dueDate: Date;
  status: 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED';
  notes?: string;
}

export interface QuotationItem {
  productName: string;
  quantity: number;
  unit: string;
  specifications?: string;
}

export interface SupplierQuotationResponse {
  id: string;
  requestId: string;
  supplierId: string;
  items: QuotedItem[];
  responseDate: Date;
  validUntil: Date;
  totalPrice: number;
  deliveryDays: number;
  notes?: string;
}

export interface QuotedItem extends QuotationItem {
  unitPrice: number;
  totalPrice: number;
  leadTime: number;
}
