// src/services/reportAggregator.test.ts
import { describe, it, expect, vi } from 'vitest';
import React, { ReactNode } from 'react';
import { aggregateMonthlyData, MonthlyDataSources } from './reportAggregator';
import { ReservationStatus, SDSStatus, CertificateStatus, Language, EhsIncident } from '../types';

import { IDataAdapter } from '../adapters/IDataAdapter';
import { SessionContext, SessionContextType } from '../contexts/SessionContext';
import { DataAdapterContext } from '../contexts/DataAdapterContext';
import { AdminContext, AdminContextValue } from '../contexts/app/AdminContext';
import { LabStateContext, LabStateContextValue } from '../contexts/app/LabStateContext';
import { NotificationContext } from '../contexts/NotificationContext';

import { Role, RoleCategory, User, SystemSettings, Plan, EquipmentManual, MonthlyReport, BenchAssignment, InventorySnapshot, AuditLog, Consumable, Reservation, WaitlistEntry, Notification } from '../types';

// Statically import contexts
import { UsersDataContext, UsersLoadingContext } from '../contexts/UserContext';
import { ConsumablesDataContext, ConsumablesLoadingContext } from '../contexts/ConsumableContext';
import { ReservationsDataContext, ReservationsLoadingContext } from '../contexts/ReservationContext';

// Mock Data Adapter
const mockAdapter: IDataAdapter = {
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
} as any; // Cast to any to avoid implementing all methods

interface CreateWrapperOptions {
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


describe('aggregateMonthlyData', () => {
  const mockDataSources: MonthlyDataSources = {
    reservations: [],
    equipment: [],
    consumables: [],
    sds: [],
    certificates: [],
    invoices: [],
    users: [],
    incidents: [],
    language: Language.EN,
  };

  it('should return a default structure with empty data', () => {
    const result = aggregateMonthlyData(2024, 7, mockDataSources);
    expect(result.period).toBe('2024-07');
    expect(result.equipmentUsage.totalReservations).toBe(0);
    expect(result.equipmentUsage.completedReservations).toBe(0);
    expect(result.equipmentUsage.totalUsageHours).toBe(0);
    expect(result.inventory.hazardousRatio).toBe(0);
    expect(result.compliance.pendingSDSCount).toBe(0);
    expect(result.financial.totalRevenue).toBe(0);
  });

  it('should correctly calculate equipment usage for the specified month', () => {
    const sources: MonthlyDataSources = {
      ...mockDataSources,
      equipment: [
        { id: 'eq1', nameEN: 'Machine A', nameJP: 'マシンA' } as any,
      ],
      reservations: [
        { 
          equipmentId: 'eq1', 
          startTime: '2024-07-10T10:00:00Z', 
          endTime: '2024-07-10T12:00:00Z', 
          actualStartTime: '2024-07-10T10:00:00Z', 
          actualEndTime: '2024-07-10T11:00:00Z', // 60 minutes
          status: ReservationStatus.Completed 
        } as any,
        { 
          equipmentId: 'eq1', 
          startTime: '2024-07-15T10:00:00Z', 
          endTime: '2024-07-15T12:00:00Z', 
          status: ReservationStatus.Cancelled 
        } as any,
        { 
          equipmentId: 'eq1', 
          startTime: '2024-08-10T10:00:00Z', // Different month
          endTime: '2024-08-10T12:00:00Z', 
          status: ReservationStatus.Completed 
        } as any,
      ],
    };
    const result = aggregateMonthlyData(2024, 7, sources);
    expect(result.equipmentUsage.totalReservations).toBe(2);
    expect(result.equipmentUsage.completedReservations).toBe(1);
    expect(result.equipmentUsage.cancelledReservations).toBe(1);
    expect(result.equipmentUsage.totalUsageHours).toBe(1); // 60 minutes = 1 hour
    expect(result.equipmentUsage.byEquipment[0].equipmentName).toBe('Machine A');
    expect(result.equipmentUsage.byEquipment[0].totalHours).toBe(1);
  });

  it('should calculate financial data correctly, including previous month comparison', () => {
    const sources: MonthlyDataSources = {
      ...mockDataSources,
      invoices: [
        { period: '2024-07', totalAmount: 15000, companyName: 'Tenant A' } as any,
        { period: '2024-07', totalAmount: 5000, companyName: 'Tenant B' } as any,
        { period: '2024-06', totalAmount: 10000, companyName: 'Tenant A' } as any, // Previous month
        { period: '2024-08', totalAmount: 20000, companyName: 'Tenant A' } as any, // Next month
      ]
    };
    const result = aggregateMonthlyData(2024, 7, sources);
    expect(result.financial.totalRevenue).toBe(20000);
    expect(result.financial.previousMonthRevenue).toBe(10000);
    expect(result.financial.revenueChangePercentage).toBe(100); // (20000 - 10000) / 10000 * 100
    expect(result.financial.byTenant).toEqual([
        { tenantName: 'Tenant A', amount: 15000 },
        { tenantName: 'Tenant B', amount: 5000 },
    ]);
  });
  
  it('should correctly report inventory status', () => {
    const sources: MonthlyDataSources = {
      ...mockDataSources,
      consumables: [
        { nameEN: 'Item A', stock: 0, lowStockThreshold: 5 } as any,
        { nameEN: 'Item B', stock: 3, lowStockThreshold: 5 } as any,
        { nameEN: 'Item C', stock: 10, lowStockThreshold: 5 } as any,
      ],
      language: Language.EN,
    };
    const result = aggregateMonthlyData(2024, 7, sources);
    expect(result.inventory.stockoutItems).toEqual(['Item A']);
    expect(result.inventory.reorderNeededItems).toEqual(['Item B']);
  });

  it('should correctly report compliance status', () => {
      const sources: MonthlyDataSources = {
          ...mockDataSources,
          sds: [
              { status: SDSStatus.Pending } as any,
              { status: SDSStatus.Approved } as any,
          ],
          certificates: [
              { status: CertificateStatus.Expired } as any,
              { status: CertificateStatus.Valid } as any,
          ],
          incidents: [
              { reportedAt: '2024-07-20T10:00:00Z' } as any,
              { reportedAt: '2024-06-20T10:00:00Z' } as any, // Previous month
          ]
      };
      const result = aggregateMonthlyData(2024, 7, sources);
      expect(result.compliance.pendingSDSCount).toBe(1);
      expect(result.compliance.expiredCertificatesCount).toBe(1);
      expect(result.compliance.incidentsCount).toBe(1);
  });

  it('should use Japanese names when language is set to JA', () => {
    const sources: MonthlyDataSources = {
      ...mockDataSources,
      equipment: [{ id: 'eq1', nameEN: 'Machine A', nameJP: 'マシンA' } as any],
      reservations: [{ 
          equipmentId: 'eq1', 
          startTime: '2024-07-10T10:00:00Z', 
          endTime: '2024-07-10T12:00:00Z', 
          actualStartTime: '2024-07-10T10:00:00Z', 
          actualEndTime: '2024-07-10T11:00:00Z',
          status: ReservationStatus.Completed 
        } as any],
      language: Language.JA,
    };
    const result = aggregateMonthlyData(2024, 7, sources);
    expect(result.equipmentUsage.byEquipment[0].equipmentName).toBe('マシンA');
  });
});