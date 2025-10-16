// src/test-utils.tsx
import React, { ReactNode } from 'react';
import { vi } from 'vitest';
import { IDataAdapter } from './adapters/IDataAdapter';
import { SessionContext, SessionContextType } from './contexts/SessionContext';
import { DataAdapterContext } from './contexts/DataAdapterContext';
import { AdminContext, AdminContextValue } from './contexts/app/AdminContext';
import { LabStateContext, LabStateContextValue } from './contexts/app/LabStateContext';
import { NotificationContext } from './contexts/NotificationContext';

import { 
  Role, RoleCategory, User, SystemSettings, Plan, EquipmentManual, MonthlyReport, BenchAssignment, InventorySnapshot, AuditLog, 
  Consumable, Reservation, WaitlistEntry, Notification, Language 
} from './types';

// Statically import contexts
import { UsersDataContext, UsersLoadingContext } from './contexts/UserContext';
import { ConsumablesDataContext, ConsumablesLoadingContext } from './contexts/ConsumableContext';
import { ReservationsDataContext, ReservationsLoadingContext } from './contexts/ReservationContext';

// Mock Data Adapter
export const mockAdapter: IDataAdapter = {
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  createReservation: vi.fn(),
  updateReservation: vi.fn(),
  createUsage: vi.fn(),
  updateConsumable: vi.fn(),
  createConsumable: vi.fn(),
  deleteConsumable: vi.fn(),
  createOrder: vi.fn(),
} as any; // Cast to any to avoid implementing all methods

export interface CreateWrapperOptions {
    adapter?: IDataAdapter;
    sessionContextValue?: Partial<SessionContextType>;
    adminContextValue?: Partial<AdminContextValue>;
    labStateContextValue?: Partial<LabStateContextValue>;
    notificationContextValue?: Partial<{ notifications: Notification[], addNotification: (n: any) => void }>;
    users?: User[];
    consumables?: Consumable[];
    reservations?: Reservation[];
}

export const createWrapper = (options: CreateWrapperOptions = {}) => {
  const {
    adapter = mockAdapter,
    sessionContextValue = {},
    adminContextValue = {},
    labStateContextValue = {},
    notificationContextValue = {},
    users = [],
    consumables = [],
    reservations = [],
  } = options;

  const fullSessionContextValue: SessionContextType = {
    currentUser: null, language: Language.EN, setLanguage: vi.fn(),
    login: vi.fn(), logout: vi.fn(), isFacilityStaff: false, isTenantStaff: false,
    ...sessionContextValue,
  };

  const fullAdminContextValue: AdminContextValue = {
    monthlyReports: [], benchAssignments: [], inventorySnapshots: [],
    setInventorySnapshots: vi.fn(), auditLogs: [], setAuditLogs: vi.fn(),
    systemSettings: { labOpeningTime: '', labClosingTime: '', noShowPenalty: 0, surgePricingEnabled: false, surgeMultiplier: 1, surgeStartTime: '', surgeEndTime: '' },
    setSystemSettings: vi.fn(), plans: [], setPlans: vi.fn(), equipmentManuals: [],
    ...adminContextValue
  };

  const fullLabStateContextValue: LabStateContextValue = {
    consumableNotifications: [], setConsumableNotifications: vi.fn(),
    co2IncubatorTrackingData: [], setCo2IncubatorTrackingData: vi.fn(),
    memos: [], waitlist: [], setWaitlist: vi.fn(),
    ...labStateContextValue
  }

  const fullNotificationContextValue = {
      notifications: [],
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsReadForUser: vi.fn(),
      ...notificationContextValue
  }

  return ({ children }: { children: ReactNode }) => (
    React.createElement(DataAdapterContext.Provider, { value: adapter },
      React.createElement(SessionContext.Provider, { value: fullSessionContextValue },
        React.createElement(AdminContext.Provider, { value: fullAdminContextValue },
          React.createElement(LabStateContext.Provider, { value: fullLabStateContextValue },
            React.createElement(NotificationContext.Provider, { value: fullNotificationContextValue as any },
              React.createElement(UsersDataContext.Provider, { value: users },
                React.createElement(UsersLoadingContext.Provider, { value: false },
                  React.createElement(ConsumablesDataContext.Provider, { value: consumables },
                    React.createElement(ConsumablesLoadingContext.Provider, { value: false },
                      React.createElement(ReservationsDataContext.Provider, { value: reservations },
                        React.createElement(ReservationsLoadingContext.Provider, { value: false },
                          children
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};