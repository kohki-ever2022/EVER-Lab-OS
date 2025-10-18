// src/hooks/useInventoryActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useAudit } from './useAudit';
import { useNotifications } from '../hooks/useNotifications';
import { Consumable, Order, OrderStatus } from '../types';
import { Result, Role } from '../types';
import { NotificationType } from '../types';
import { useConsumables } from '../contexts/ConsumableContext';
import { useUsers } from '../contexts/UserContext';
import { useTranslation } from './useTranslation';
import { sanitizeObject } from '../utils/sanitization';

export const useInventoryActions = () => {
  const adapter = useDataAdapter();
  const consumables = useConsumables();
  const users = useUsers();
  const { t } = useTranslation();
  const { addAuditLog } = useAudit();
  const { addNotification } = useNotifications();


  const updateConsumable = useCallback(async (consumable: Consumable): Promise<Result<Consumable, Error>> => {
    try {
        if (consumable.isLocked) {
            throw new Error(t('inventoryLockedUpdate'));
        }

        const prevConsumable = consumables.find(c => c.id === consumable.id);
        const result = await adapter.updateConsumable(sanitizeObject(consumable));

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
            throw new Error(t('inventoryLockedAdd'));
        }
        return await adapter.createConsumable(sanitizeObject(consumable));
    } catch (e) {
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [consumables, t, adapter]);

  const deleteConsumable = useCallback(async (consumableId: string): Promise<Result<void, Error>> => {
    try {
         const item = consumables.find(c => c.id === consumableId);
        if (item?.isLocked) {
             throw new Error(t('inventoryLockedDelete'));
        }
        return await adapter.deleteConsumable(consumableId);
    } catch (e) {
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [consumables, t, adapter]);

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'totalPrice' | 'orderDate' | 'status'>): Promise<Result<Order, Error>> => {
    const consumable = consumables.find(c => c.id === order.consumableId);
    if (!consumable) return { success: false, error: new Error("Consumable not found.") };
    if (consumable.stock < order.quantity) return { success: false, error: new Error("Insufficient stock.") };
    if (consumable.isLocked) return { success: false, error: new Error("Inventory is locked.") };

    const orderData = {
        ...order,
        totalPrice: order.quantity * order.unitPrice,
        orderDate: new Date(),
        status: OrderStatus.Ordered,
    };

    const result = await adapter.createOrder(sanitizeObject(orderData));
    if (result.success) {
        addAuditLog('ORDER_CREATE', `User ${order.userId} ordered ${order.quantity} of consumable ${order.consumableId}.`);
    }
    return result;
  }, [adapter, addAuditLog, consumables]);

  return useMemo(() => ({
      updateConsumable,
      addConsumable,
      deleteConsumable,
      addOrder,
  }), [updateConsumable, addConsumable, deleteConsumable, addOrder]);
};