// src/hooks/useInventoryActions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { useInventoryActions } from './useInventoryActions';
import { IDataAdapter } from '../adapters/IDataAdapter';
import { SessionContext, SessionContextType } from '../contexts/SessionContext';
import { DataAdapterContext } from '../contexts/DataAdapterContext';
import { ConsumableContext as OldConsumableContext } from '../contexts/ConsumableContext';
import { UserContext as OldUserContext } from '../contexts/UserContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { AdminContext, AdminContextValue } from '../contexts/app/AdminContext';

import { Role, RoleCategory, User, Language, Consumable, OrderStatus, Notification } from '../types';

// Mock Dependencies
const mockAdapter: IDataAdapter = {
  updateConsumable: vi.fn(),
  createConsumable: vi.fn(),
  deleteConsumable: vi.fn(),
  createOrder: vi.fn(),
} as any;

const mockAddAuditLog = vi.fn();
const mockAddNotification = vi.fn();

vi.mock('./useAudit', () => ({
  useAudit: () => ({ addAuditLog: mockAddAuditLog }),
}));

vi.mock('../hooks/useNotifications', () => ({
    useNotifications: () => ({ addNotification: mockAddNotification }),
}));

const mockConsumables: Consumable[] = [
    { id: 'c1', nameJP: '試薬A', nameEN: 'Reagent A', stock: 10, lowStockThreshold: 5, isLocked: false } as Consumable,
    { id: 'c2', nameJP: '試薬B', nameEN: 'Reagent B', stock: 20, lowStockThreshold: 10, isLocked: true } as Consumable,
    { id: 'c3', nameJP: '試薬C', nameEN: 'Reagent C', stock: 6, lowStockThreshold: 5, isLocked: false } as Consumable,
];
const mockUsers: User[] = [
    { id: 'user-1', name: 'Test User', email: 'test@test.com', companyId: 'company-a', role: Role.LabManager, roleCategory: RoleCategory.Facility },
];
const mockCurrentUser = mockUsers[0];

// This is a dynamic import because the context file itself is being modified.
let ConsumablesDataContext: React.Context<Consumable[]>;
let ConsumablesLoadingContext: React.Context<boolean>;
let UsersDataContext: React.Context<User[]>;
let UsersLoadingContext: React.Context<boolean>;

beforeEach(async () => {
  const consumableContextModule = await import('../contexts/ConsumableContext');
  // @ts-ignore - we are accessing a non-exported context for testing
  ConsumablesDataContext = consumableContextModule.ConsumablesDataContext;
  // @ts-ignore
  ConsumablesLoadingContext = consumableContextModule.ConsumablesLoadingContext;

  const userContextModule = await import('../contexts/UserContext');
  // @ts-ignore
  UsersDataContext = userContextModule.UsersDataContext;
  // @ts-ignore
  UsersLoadingContext = userContextModule.UsersLoadingContext;
});

const createWrapper = () => {
  const sessionContextValue: SessionContextType = {
    currentUser: mockCurrentUser,
    language: Language.EN,
    setLanguage: vi.fn(), login: vi.fn(), logout: vi.fn(), isFacilityStaff: true, isTenantStaff: false,
  };
  
  return ({ children }: { children: ReactNode }) => React.createElement(
    DataAdapterContext.Provider,
    { value: mockAdapter },
    React.createElement(
      SessionContext.Provider,
      { value: sessionContextValue },
      React.createElement(
        AdminContext.Provider,
        { value: { setAuditLogs: vi.fn() } as any },
        React.createElement(
            NotificationContext.Provider,
            { value: { notifications: [], addNotification: mockAddNotification, removeNotification: vi.fn(), clearNotifications: vi.fn() } },
            React.createElement(
                UsersDataContext.Provider,
                { value: mockUsers },
                React.createElement(
                  UsersLoadingContext.Provider,
                  { value: false },
                  React.createElement(
                    ConsumablesDataContext.Provider,
                    { value: mockConsumables },
                    React.createElement(
                      ConsumablesLoadingContext.Provider,
                      { value: false },
                      children
                    )
                  )
                )
            )
        )
      )
    )
  );
};


describe('useInventoryActions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should update a consumable successfully', async () => {
    const updatedConsumable = { ...mockConsumables[0], stock: 8 };
    (mockAdapter.updateConsumable as any).mockResolvedValue({ success: true, data: updatedConsumable });
    const { result } = renderHook(() => useInventoryActions(), { wrapper: createWrapper() });
    
    await act(async () => {
      const res = await result.current.updateConsumable(updatedConsumable);
      expect(res.success).toBe(true);
    });

    expect(mockAdapter.updateConsumable).toHaveBeenCalledWith(updatedConsumable);
  });

  it('should fail to update a locked consumable', async () => {
    const updatedConsumable = { ...mockConsumables[1], stock: 15 };
    const { result } = renderHook(() => useInventoryActions(), { wrapper: createWrapper() });

    let actionResult: any;
    await act(async () => {
      actionResult = await result.current.updateConsumable(updatedConsumable);
    });

    expect(mockAdapter.updateConsumable).not.toHaveBeenCalled();
    expect(actionResult.success).toBe(false);
    expect(actionResult.error.message).toContain('inventoryLockedUpdate');
  });
  
   it('should send a notification when stock becomes low', async () => {
    const consumableToUpdate = { ...mockConsumables[2], stock: 4 }; // From 6 to 4, threshold is 5
    (mockAdapter.updateConsumable as any).mockResolvedValue({ success: true, data: consumableToUpdate });
    const { result } = renderHook(() => useInventoryActions(), { wrapper: createWrapper() });

    await act(async () => {
        await result.current.updateConsumable(consumableToUpdate);
    });
    
    expect(mockAddNotification).toHaveBeenCalled();
    expect(mockAddNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'LOW_STOCK' }));
  });


  it('should add a consumable successfully', async () => {
    const newConsumable = { nameJP: '試薬D', nameEN: 'Reagent D', stock: 50, lowStockThreshold: 10 } as Omit<Consumable, 'id'>;
    (mockAdapter.createConsumable as any).mockResolvedValue({ success: true, data: { ...newConsumable, id: 'c4' } });
    const { result } = renderHook(() => useInventoryActions(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.addConsumable(newConsumable);
    });

    expect(mockAdapter.createConsumable).toHaveBeenCalledWith(newConsumable);
  });

  it('should successfully create an order and log audit', async () => {
    const orderData = {
        userId: 'user-1',
        companyId: 'company-a',
        consumableId: 'c1',
        quantity: 2,
        unitPrice: 100,
    };
    const expectedOrder = expect.objectContaining({
      ...orderData,
      totalPrice: 200,
      status: OrderStatus.Ordered,
    });
    (mockAdapter.createOrder as any).mockResolvedValue({ success: true, data: expectedOrder });
    const { result } = renderHook(() => useInventoryActions(), { wrapper: createWrapper() });
    
    let actionResult: any;
    await act(async () => {
        actionResult = await result.current.addOrder(orderData);
    });

    expect(mockAdapter.createOrder).toHaveBeenCalledWith(expectedOrder);
    expect(mockAddAuditLog).toHaveBeenCalledWith('ORDER_CREATE', expect.stringContaining('ordered 2 of consumable c1'));
    expect(actionResult.success).toBe(true);
  });
});