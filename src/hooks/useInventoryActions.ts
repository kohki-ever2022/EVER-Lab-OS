// src/hooks/useInventoryActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useSessionContext } from '../contexts/SessionContext';
import { useAudit } from './useAudit';
import { useNotifications } from '../hooks/useNotifications';
import { Consumable, Order, OrderStatus } from '../types/inventory';
import { Result, Role } from '../types/core';
import { NotificationType } from '../types/common';
import { useConsumableContext } from '../contexts/ConsumableContext';
import { useUserContext } from '../contexts/UserContext';

export const useInventoryActions = () => {
  const adapter = useDataAdapter();
  const { consumables } = useConsumableContext();
  const { users } = useUserContext();
  const { currentUser, isJapanese } = useSessionContext();
  const { addAuditLog } = useAudit();
  const { addNotification } = useNotifications();


  const updateConsumable = useCallback(async (consumable: Consumable): Promise<Result<Consumable, Error>> => {
    try {
        if (consumable.isLocked) {
            throw new Error(isJapanese ? '在庫がロックされているため、更新できません。' : 'Cannot update item, inventory is locked.');
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
  }, [isJapanese, adapter, consumables, addNotification, users]);
  
  const addConsumable = useCallback(async (consumable: Omit<Consumable, 'id'>): Promise<Result<Consumable, Error>> => {
    try {
        if (consumables.some(c => c.isLocked)) {
            throw new Error(isJapanese ? '在庫がロックされているため、追加できません。' : 'Cannot add item, inventory is locked.');
        }
        return await adapter.createConsumable(consumable);
    } catch (e) {
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [consumables, isJapanese, adapter]);

  const deleteConsumable = useCallback(async (consumableId: string): Promise<Result<void, Error>> => {
    try {
         const item = consumables.find(c => c.id === consumableId);
        if (item?.isLocked) {
             throw new Error(isJapanese ? '在庫がロックされているため、削除できません。' : 'Cannot delete item, inventory is locked.');
        }
        return await adapter.deleteConsumable(consumableId);
    } catch (e) {
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [consumables, isJapanese, adapter]);
  
  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'totalPrice' | 'orderDate' | 'status'>): Promise<Result<Order, Error>> => {
    try {
        const consumableBefore = consumables.find(c => c.id === order.consumableId);
        const newOrderData: Omit<Order, 'id'> = {
            ...order,
            totalPrice: order.unitPrice * order.quantity,
            orderDate: new Date(),
            status: OrderStatus.Delivered, // Simplified for now
        };
        
        const result = await adapter.createOrder(newOrderData);

        if (result.success) {
            addAuditLog('CONSUMABLE_PURCHASE', `${currentUser?.name} purchased ${order.quantity} of ${consumableBefore?.nameEN}`);

            if (consumableBefore && addNotification && users) {
                const newStock = consumableBefore.stock - order.quantity;
                const isNowLow = newStock > 0 && newStock <= consumableBefore.lowStockThreshold;
                const wasPreviouslyOk = consumableBefore.stock > consumableBefore.lowStockThreshold;
                if (isNowLow && wasPreviouslyOk) {
                    const staffToNotify = users.filter(u => u.role === Role.LabManager || u.role === Role.FacilityDirector);
                    staffToNotify.forEach(staff => {
                        addNotification({
                            recipientUserId: staff.id,
                            type: NotificationType.LowStock, priority: 'MEDIUM',
                            titleJP: '低在庫アラート', titleEN: 'Low Stock Alert',
                            messageJP: `消耗品「${consumableBefore.nameJP}」の在庫が閾値を下回りました。`,
                            messageEN: `Stock for "${consumableBefore.nameEN}" is below the threshold.`,
                            actionUrl: `#/reorderSuggestions`,
                        });
                    });
                }
            }
        }

        return result;
    } catch (e) {
        return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [adapter, consumables, addAuditLog, currentUser, addNotification, users]);
  
  return useMemo(() => ({ addConsumable, updateConsumable, deleteConsumable, addOrder }), [addConsumable, updateConsumable, deleteConsumable, addOrder]);
};