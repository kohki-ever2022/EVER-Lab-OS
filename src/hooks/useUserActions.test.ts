// src/hooks/useUserActions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { useUserActions } from './useUserActions';
import { IDataAdapter } from '../adapters/IDataAdapter';
import { SessionContext, SessionContextType } from '../contexts/SessionContext';
import { DataAdapterContext } from '../contexts/DataAdapterContext';
import { AdminContext, AdminContextValue } from '../contexts/app/AdminContext';
import { LabStateContext, LabStateContextValue } from '../contexts/app/LabStateContext';
import { NotificationContext } from '../contexts/NotificationContext';

import { Role, RoleCategory, User, Language, SystemSettings, Plan, EquipmentManual, MonthlyReport, BenchAssignment, InventorySnapshot, AuditLog, Consumable, Reservation, WaitlistEntry, Notification } from '../types';

// Mock Data Adapter
const mockAdapter: IDataAdapter = {
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
} as any; // Cast to any to avoid implementing all methods

// Mock Data
const mockUsers: User[] = [
    { id: 'user-1', name: 'Existing User', email: 'exist@test.com', companyId: 'company-a', role: Role.Researcher, roleCategory: RoleCategory.Tenant, password: 'password' },
];
const mockFacilityDirector: User = { id: 'admin-user', name: 'Admin', email: 'admin@test.com', companyId: 'company-lab', role: Role.FacilityDirector, roleCategory: RoleCategory.Facility, password: 'password' };

// This is a dynamic import because the context file itself is being modified.
let UsersDataContext: React.Context<User[]>;
let UsersLoadingContext: React.Context<boolean>;
let ConsumablesDataContext: React.Context<Consumable[]>;
let ConsumablesLoadingContext: React.Context<boolean>;
let ReservationsDataContext: React.Context<Reservation[]>;
let ReservationsLoadingContext: React.Context<boolean>;


beforeEach(async () => {
  const userContextModule = await import('../contexts/UserContext');
  // @ts-ignore - we are accessing a non-exported context for testing
  UsersDataContext = userContextModule.UsersDataContext;
  // @ts-ignore
  UsersLoadingContext = userContextModule.UsersLoadingContext;
  
  const consumableContextModule = await import('../contexts/ConsumableContext');
  // @ts-ignore
  ConsumablesDataContext = consumableContextModule.ConsumablesDataContext;
  // @ts-ignore
  ConsumablesLoadingContext = consumableContextModule.ConsumablesLoadingContext;

  const reservationContextModule = await import('../contexts/ReservationContext');
  // @ts-ignore
  ReservationsDataContext = reservationContextModule.ReservationsDataContext;
  // @ts-ignore
  ReservationsLoadingContext = reservationContextModule.ReservationsLoadingContext;
});

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
      ...notificationContextValue
  }

  return ({ children }: { children: ReactNode }) => (
    React.createElement(DataAdapterContext.Provider, { value: adapter },
      React.createElement(SessionContext.Provider, { value: fullSessionContextValue },
        React.createElement(AdminContext.Provider, { value: fullAdminContextValue },
          React.createElement(LabStateContext.Provider, { value: fullLabStateContextValue },
            React.createElement(NotificationContext.Provider, { value: fullNotificationContextValue },
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


describe('useUserActions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const adminSessionContext: Partial<SessionContextType> = {
    currentUser: mockFacilityDirector,
    language: Language.EN,
    isFacilityStaff: true,
    isTenantStaff: false,
  };

  it('should add a user successfully with admin privileges', async () => {
    const newUser: Omit<User, 'id'> = { name: 'New User', email: 'new@test.com', companyId: 'company-a', role: Role.Researcher, roleCategory: RoleCategory.Tenant };
    const createdUser = { ...newUser, id: 'new-id' };
    
    (mockAdapter.createUser as any).mockResolvedValue({ success: true, data: createdUser });
    
    const wrapper = createWrapper({ sessionContextValue: adminSessionContext });
    const { result } = renderHook(() => useUserActions(), { wrapper });
    
    let actionResult;
    await act(async () => {
      actionResult = await result.current.addUser(newUser);
    });

    expect(mockAdapter.createUser).toHaveBeenCalledWith(newUser);
    expect(actionResult).toEqual({ success: true, data: createdUser });
  });

  it('should fail to add a user if lacking permissions', async () => {
    const researcherSessionContext: Partial<SessionContextType> = {
      currentUser: mockUsers[0], // A researcher
      language: Language.EN,
      isFacilityStaff: false,
      isTenantStaff: true,
    };
    const newUser: Omit<User, 'id'> = { name: 'Another User', email: 'another@test.com', companyId: 'company-a', role: Role.Researcher, roleCategory: RoleCategory.Tenant };

    const wrapper = createWrapper({ sessionContextValue: researcherSessionContext });
    const { result } = renderHook(() => useUserActions(), { wrapper });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.addUser(newUser);
    });
    
    expect(mockAdapter.createUser).not.toHaveBeenCalled();
    expect(actionResult?.success).toBe(false);
    expect(actionResult?.error.message).toContain('Permission denied');
  });

  it('should update a user successfully', async () => {
    const userToUpdate = { ...mockUsers[0], name: 'Updated Name' };
    (mockAdapter.updateUser as any).mockResolvedValue({ success: true, data: userToUpdate });

    const wrapper = createWrapper({ sessionContextValue: adminSessionContext, users: mockUsers });
    const { result } = renderHook(() => useUserActions(), { wrapper });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.updateUser(userToUpdate);
    });

    expect(mockAdapter.updateUser).toHaveBeenCalledWith(userToUpdate);
    expect(actionResult).toEqual({ success: true, data: userToUpdate });
  });
  
  it('should prevent updating a user with an existing email', async () => {
    const userToUpdate = { ...mockUsers[0], email: 'admin@test.com' }; // email of another user
    const usersWithAdmin = [...mockUsers, mockFacilityDirector];
    
    const wrapper = createWrapper({ sessionContextValue: adminSessionContext, users: usersWithAdmin });
    const { result } = renderHook(() => useUserActions(), { wrapper });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.updateUser(userToUpdate);
    });

    expect(mockAdapter.updateUser).not.toHaveBeenCalled();
    expect(actionResult?.success).toBe(false);
    expect(actionResult?.error.message).toContain('Email already exists');
  });

  it('should delete a user successfully', async () => {
    const userIdToDelete = mockUsers[0].id;
    (mockAdapter.deleteUser as any).mockResolvedValue({ success: true, data: undefined });

    const wrapper = createWrapper({ sessionContextValue: adminSessionContext, users: mockUsers });
    const { result } = renderHook(() => useUserActions(), { wrapper });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.deleteUser(userIdToDelete);
    });

    expect(mockAdapter.deleteUser).toHaveBeenCalledWith(userIdToDelete);
    expect(actionResult).toEqual({ success: true, data: undefined });
  });
});