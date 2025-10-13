// src/types/common.ts
import { Role } from './core';

/**
 * 操作の結果を表現するための汎用的なResult型。
 * 成功時にはデータを、失敗時にはエラーを格納する。
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

// Enums from user.ts to break circular dependency
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


// --- Permission Types ---
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
