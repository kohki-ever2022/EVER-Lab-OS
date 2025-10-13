// src/types/equipment.ts
import { Role } from './core';
import { TaskPriority } from './research';

// --- Enums ---
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

// --- Interfaces ---

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