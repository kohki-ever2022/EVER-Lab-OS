// src/hooks/useUserActions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { useUserActions } from './useUserActions';
import { IDataAdapter } from '../adapters/IDataAdapter';
import { SessionContext, SessionContextType } from '../contexts/SessionContext';
import { DataAdapterContext } from '../contexts/DataAdapterContext';
import { UserContext, UserContextValue } from '../contexts/UserContext';
import { AdminContext, AdminContextValue } from '../contexts/app/AdminContext';
// FIX: Add missing 'Language' import and other types for a complete mock
import { Role, RoleCategory, User, Language, SystemSettings, Plan, EquipmentManual, MonthlyReport, BenchAssignment, InventorySnapshot, AuditLog } from '../types';

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


// FIX: Refactored createWrapper to use a fully-typed mock for AdminContext, which resolves TSX parsing issues in .ts files by removing the problematic type cast on a partial object.
const createWrapper = (
    adapter: IDataAdapter, 
    sessionContextValue: Partial<SessionContextType>,
    users: User[] = []
) => {
  const fullSessionContextValue: SessionContextType = {
    currentUser: null,
    language: Language.EN,
    setLanguage: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    isJapanese: false,
    isFacilityStaff: false,
    isTenantStaff: false,
    ...sessionContextValue,
  };

  const adminContextValue: AdminContextValue = {
    monthlyReports: [] as MonthlyReport[],
    benchAssignments: [] as BenchAssignment[],
    inventorySnapshots: [] as InventorySnapshot[],
    setInventorySnapshots: vi.fn(),
    auditLogs: [] as AuditLog[],
    setAuditLogs: vi.fn(),
    systemSettings: { labOpeningTime: '', labClosingTime: '', noShowPenalty: 0, surgePricingEnabled: false, surgeMultiplier: 1, surgeStartTime: '', surgeEndTime: '' } as SystemSettings,
    setSystemSettings: vi.fn(),
    plans: [] as Plan[],
    setPlans: vi.fn(),
    equipmentManuals: [] as EquipmentManual[],
  };

  const userContextValue: UserContextValue = { users, loading: false };

  return ({ children }: { children: ReactNode }) => (
    <DataAdapterContext.Provider value={adapter}>
      <SessionContext.Provider value={fullSessionContextValue}>
        <AdminContext.Provider value={adminContextValue}>
            <UserContext.Provider value={userContextValue}>
                {children}
            </UserContext.Provider>
        </AdminContext.Provider>
      </SessionContext.Provider>
    </DataAdapterContext.Provider>
  );
};


describe('useUserActions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const adminSessionContext: Partial<SessionContextType> = {
    currentUser: mockFacilityDirector,
    isJapanese: false,
    isFacilityStaff: true,
    isTenantStaff: false,
  };

  it('should add a user successfully with admin privileges', async () => {
    const newUser: Omit<User, 'id'> = { name: 'New User', email: 'new@test.com', companyId: 'company-a', role: Role.Researcher, roleCategory: RoleCategory.Tenant };
    const createdUser = { ...newUser, id: 'new-id' };
    
    (mockAdapter.createUser as any).mockResolvedValue({ success: true, data: createdUser });
    
    const wrapper = createWrapper(mockAdapter, adminSessionContext);
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
      isJapanese: false,
      isFacilityStaff: false,
      isTenantStaff: true,
    };
    const newUser: Omit<User, 'id'> = { name: 'Another User', email: 'another@test.com', companyId: 'company-a', role: Role.Researcher, roleCategory: RoleCategory.Tenant };

    const wrapper = createWrapper(mockAdapter, researcherSessionContext);
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

    const wrapper = createWrapper(mockAdapter, adminSessionContext, mockUsers);
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
    
    const wrapper = createWrapper(mockAdapter, adminSessionContext, usersWithAdmin);
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

    const wrapper = createWrapper(mockAdapter, adminSessionContext, mockUsers);
    const { result } = renderHook(() => useUserActions(), { wrapper });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.deleteUser(userIdToDelete);
    });

    expect(mockAdapter.deleteUser).toHaveBeenCalledWith(userIdToDelete);
    expect(actionResult).toEqual({ success: true, data: undefined });
  });
});