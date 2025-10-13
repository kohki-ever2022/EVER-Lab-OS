// src/types/user.ts
import { 
  Resource, 
  Action, 
  ContractType,
  UserAvailabilityStatus,
  CourseStatus,
  TenantLifecycleStage
} from './common';
import { RoleCategory, Role } from './core';

// --- Interfaces ---

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