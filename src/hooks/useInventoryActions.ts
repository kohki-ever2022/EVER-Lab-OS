// src/hooks/useInventoryActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useSessionContext } from '../contexts/SessionContext';
import { useAudit } from './useAudit';
import { useNotifications } from '../hooks/useNotifications';
// FIX: import from barrel file
import { Consumable, Order, OrderStatus } from '../types';
// FIX: import from barrel file
import { Result, Role } from '../types';
// FIX: import from barrel file
import { NotificationType } from '../types';
import { useConsumableContext } from '../contexts/ConsumableContext';
import { useUserContext } from '../contexts/UserContext';
import { useTranslation } from './useTranslation';

export const useInventoryActions = () => {
  const adapter = useDataAdapter();
  const { consumables } = useConsumableContext();
  const { users } = useUserContext();
  const { currentUser } = useSessionContext();
  const { t } = useTranslation();
  const { addAuditLog } = useAudit();
  const { addNotification } = useNotifications();


  const updateConsumable = useCallback(async (consumable: Consumable): Promise<Result<Consumable, Error>> => {
    try {
        if (consumable.isLocked) {
            // FIX: Use a valid translation key. 'inventoryLockedUpdate' has been added to translations.ts.
            throw new Error(t('inventoryLockedUpdate'));
        }

        const prevConsumable = consumables.find(c => c.id === consumable.id);
        const result = await adapter.updateConsumable(consumable);

        if (result.success && prevConsumable && addNotification && users) {
            const isNowLow = consumable.stock > 0 && consumable.stock <= consumable.lowStockThreshold;
            const wasPreviouslyOk = prevConsumable.stock > prevConsumable.lowStockThreshold;
            if (isNowLow && wasPreviouslyOk) {
                const staffToNotify = users.filter(u => u.role === Role.LabManager || u.role === Role.FacilityDirector);
                staffToNotify.forEach(staff => {
                    addNotification({
                        recipientUserId: staff.id,
                        type: NotificationType.LowStock, priority: 'MEDIUM',
                        titleJP: '低在庫アラート', titleEN: 'Low Stock Alert',
                        messageJP: `消耗品「${consumable.nameJP}」の在庫が閾値を下回りました。`,
                        messageEN: `Stock for "${consumable.nameEN}" is below the threshold.`,
                        actionUrl: `#/reorderSuggestions`,
                    });
                });
            }
        }

        return result;
    } catch (e) {
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [t, adapter, consumables, addNotification, users]);
  
  const addConsumable = useCallback(async (consumable: Omit<Consumable, 'id'>): Promise<Result<Consumable, Error>> => {
    try {
        if (consumables.some(c => c.isLocked)) {
            // FIX: Use a valid translation key. 'inventoryLockedAdd' has been added to translations.ts.
            throw new Error(t('inventoryLockedAdd'));
        }
        return await adapter.createConsumable(consumable);
    } catch (e) {
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [consumables, t, adapter]);

  const deleteConsumable = useCallback(async (consumableId: string): Promise<Result<void, Error>> => {
    try {
         const item = consumables.find(c => c.id === consumableId);
        if (item?.isLocked) {
             // FIX: Use a valid translation key. 'inventoryLockedDelete' has been added to translations.ts.
             throw new Error(t('inventoryLockedDelete'));
        }
        return await adapter.deleteConsumable(consumableId);
    } catch (e) {
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [consumables, t, adapter]);

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'totalPrice' | 'orderDate' | 'status'>): Promise<Result<Order, Error>> => {
    const orderData = {
        ...order,
        totalPrice: order.quantity * order.unitPrice,
        orderDate: new Date(),
        status: OrderStatus.Ordered,
    };

    const result = await adapter.createOrder(orderData);
    if (result.success) {
        addAuditLog('ORDER_CREATE', `User ${order.userId} ordered ${order.quantity} of consumable ${order.consumableId}.`);
    }
    return result;
  }, [adapter, addAuditLog]);

  return useMemo(() => ({
      updateConsumable,
      addConsumable,
      deleteConsumable,
      addOrder,
  }), [updateConsumable, addConsumable, deleteConsumable, addOrder]);
};
