// src/types/qms.ts
import { Role } from './core';

// --- Enums ---

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

// --- Interfaces ---

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