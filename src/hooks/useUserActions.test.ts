// src/hooks/useUserActions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { useUserActions } from './useUserActions';
import { createWrapper } from '../services/reportAggregator.test'; // Import shared wrapper
import { IDataAdapter } from '../adapters/IDataAdapter';
import { SessionContextType } from '../contexts/SessionContext';

import { Role, RoleCategory, User, Language, Consumable, Reservation, Notification } from '../types';

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
    
    const wrapper = createWrapper({ adapter: mockAdapter, sessionContextValue: adminSessionContext });
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

    const wrapper = createWrapper({ adapter: mockAdapter, sessionContextValue: researcherSessionContext });
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

    const wrapper = createWrapper({ adapter: mockAdapter, sessionContextValue: adminSessionContext, users: mockUsers });
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
    
    const wrapper = createWrapper({ adapter: mockAdapter, sessionContextValue: adminSessionContext, users: usersWithAdmin });
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

    const wrapper = createWrapper({ adapter: mockAdapter, sessionContextValue: adminSessionContext, users: mockUsers });
    const { result } = renderHook(() => useUserActions(), { wrapper });

    let actionResult;
    await act(async () => {
      actionResult = await result.current.deleteUser(userIdToDelete);
    });

    expect(mockAdapter.deleteUser).toHaveBeenCalledWith(userIdToDelete);
    expect(actionResult).toEqual({ success: true, data: undefined });
  });
});