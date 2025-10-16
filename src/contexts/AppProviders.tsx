// src/contexts/AppProviders.tsx
import React, { ReactNode } from 'react';
import {
  MonthlyReport,
  BenchAssignment,
  InventorySnapshot,
  AuditLog,
  SystemSettings,
  Plan,
  EquipmentManual,
  SDS,
  EhsIncident,
  RegulatoryRequirement,
  InsuranceCertificate,
  Manual,
  LabRule,
  Qualification,
  UserCertification,
  Protocol,
  Invoice,
  Quotation,
  ConsumableNotification,
  CO2IncubatorTracking,
  Memo,
  WaitlistEntry,
} from '../types';

// Individual providers that will be nested
import { ModalProvider } from './ModalContext';
import { CompanyProvider } from './CompanyContext';
import { ConsumableProvider } from './ConsumableContext';
import { EquipmentProvider } from './EquipmentContext';
import { ProjectProvider } from './ProjectContext';
import { ReservationProvider } from './ReservationContext';
import { UserProvider } from './UserContext';
import { CertificateProvider } from './CertificateContext';
import { AnnouncementProvider } from './AnnouncementContext';
import { MaintenanceLogProvider } from './MaintenanceLogContext';
import { OrderProvider } from './OrderContext';
import { UsageProvider } from './UsageContext';

// Import providers that were previously defined in this file
import { AdminProvider, useAdminContext } from './app/AdminContext';
import { AuditProvider, useAuditContext } from './app/AuditContext';
import { QmsProvider, useQmsContext } from './app/QmsContext';
import { BillingProvider, useBillingContext } from './app/BillingContext';
import { PurchasingProvider, usePurchasingContext } from './app/PurchasingContext';
import { LabStateProvider, useLabStateContext } from './app/LabStateContext';

// Re-export hooks for convenience
export {
  useAdminContext,
  useAuditContext,
  useQmsContext,
  useBillingContext,
  usePurchasingContext,
  useLabStateContext
};

/**
 * A single component that composes all the app's context providers.
 * This flattens the "Provider Hell" structure and improves readability.
 */
const providers = [
  AdminProvider,
  AuditProvider,
  BillingProvider,
  PurchasingProvider,
  QmsProvider,
  LabStateProvider,
  UserProvider,
  CompanyProvider,
  EquipmentProvider,
  ReservationProvider,
  ConsumableProvider,
  ProjectProvider,
  AnnouncementProvider,
  MaintenanceLogProvider,
  OrderProvider,
  UsageProvider,
  CertificateProvider,
  ModalProvider,
];

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, <>{children}</>);
};