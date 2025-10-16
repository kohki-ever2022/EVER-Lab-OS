// src/hooks/useInventoryActions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useInventoryActions } from './useInventoryActions';
import { createWrapper, mockAdapter } from '../test-utils'; // Import shared wrapper
import { Role, RoleCategory, User, Language, Consumable, OrderStatus, Notification } from '../types';

// Mock Dependencies
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

describe('useInventoryActions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  const wrapper = createWrapper({
    adapter: mockAdapter,
    sessionContextValue: { currentUser: mockCurrentUser, isFacilityStaff: true },
    // FIX: Moved setAuditLogs to the correct context value.
    auditContextValue: { setAuditLogs: vi.fn() as any },
    notificationContextValue: { addNotification: mockAddNotification as any },
    users: mockUsers,
    consumables: mockConsumables,
  });


  it('should update a consumable successfully', async () => {
    const updatedConsumable = { ...mockConsumables[0], stock: 8 };
    (mockAdapter.updateConsumable as any).mockResolvedValue({ success: true, data: updatedConsumable });
    const { result } = renderHook(() => useInventoryActions(), { wrapper });
    
    await act(async () => {
      const res = await result.current.updateConsumable(updatedConsumable);
      expect(res.success).toBe(true);
    });

    expect(mockAdapter.updateConsumable).toHaveBeenCalledWith(updatedConsumable);
  });

  it('should fail to update a locked consumable', async () => {
    const updatedConsumable = { ...mockConsumables[1], stock: 15 };
    const { result } = renderHook(() => useInventoryActions(), { wrapper });

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
    const { result } = renderHook(() => useInventoryActions(), { wrapper });

    await act(async () => {
        await result.current.updateConsumable(consumableToUpdate);
    });
    
    expect(mockAddNotification).toHaveBeenCalled();
    expect(mockAddNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'LOW_STOCK' }));
  });


  it('should add a consumable successfully', async () => {
    const newConsumable = { nameJP: '試薬D', nameEN: 'Reagent D', stock: 50, lowStockThreshold: 10 } as Omit<Consumable, 'id'>;
    (mockAdapter.createConsumable as any).mockResolvedValue({ success: true, data: { ...newConsumable, id: 'c4' } });
    const { result } = renderHook(() => useInventoryActions(), { wrapper });

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
    const { result } = renderHook(() => useInventoryActions(), { wrapper });
    
    let actionResult: any;
    await act(async () => {
        actionResult = await result.current.addOrder(orderData);
    });

    expect(mockAdapter.createOrder).toHaveBeenCalledWith(expectedOrder);
    expect(mockAddAuditLog).toHaveBeenCalledWith('ORDER_CREATE', expect.stringContaining('ordered 2 of consumable c1'));
    expect(actionResult.success).toBe(true);
  });
});
