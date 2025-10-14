// src/hooks/useEquipmentActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useLabStateContext } from '../contexts/AppProviders';
import { useAudit } from './useAudit';
import { useNotifications } from './useNotifications';
import {
  Equipment,
  EquipmentStatus,
  CO2IncubatorTracking,
  MaintenanceLog,
  Result,
} from '../types';
// FIX: import from barrel file
import { NotificationType } from '../types';
// FIX: import from barrel file
import { RoleCategory } from '../types';
import { useEquipmentContext } from '../contexts/EquipmentContext';
import { useUserContext } from '../contexts/UserContext';

export const useEquipmentActions = () => {
    const adapter = useDataAdapter();
    const { setCo2IncubatorTrackingData } = useLabStateContext();
    const { equipment } = useEquipmentContext();
    const { users } = useUserContext();
    const { addAuditLog } = useAudit();
    const { addNotification } = useNotifications();

    const addEquipment = useCallback(async (equipmentItem: Omit<Equipment, 'id'>): Promise<Result<Equipment, Error>> => {
        const result = await adapter.createEquipment(equipmentItem);
        if (result.success) {
            addAuditLog('EQUIPMENT_CREATE', `Created equipment '${result.data.nameEN}'`);
        }
        return result;
    }, [adapter, addAuditLog]);
    
    const updateEquipment = useCallback(async (equipmentItem: Equipment): Promise<Result<Equipment, Error>> => {
        const prevEq = equipment.find(p => p.id === equipmentItem.id);
        const result = await adapter.updateEquipment(equipmentItem);

        if (result.success) {
            addAuditLog('EQUIPMENT_UPDATE', `Updated equipment '${equipmentItem.nameEN}'`);

            if (prevEq && prevEq.status !== EquipmentStatus.Maintenance && equipmentItem.status === EquipmentStatus.Maintenance) {
                const staffToNotify = users.filter(u => u.roleCategory === RoleCategory.Facility);
                staffToNotify.forEach(staff => {
                    addNotification({
                        recipientUserId: staff.id,
                        type: NotificationType.EquipmentMalfunction,
                        priority: 'HIGH',
                        titleJP: '機器の不具合報告', titleEN: 'Equipment Malfunction',
                        messageJP: `${equipmentItem.nameJP}がメンテナンス状態になりました。`,
                        messageEN: `${equipmentItem.nameEN} has been set to maintenance status.`,
                        actionUrl: `#/equipmentManagement`,
                    });
                });
            }
        }
        return result;
    }, [adapter, equipment, users, addAuditLog, addNotification]);
    
    const deleteEquipment = useCallback(async (equipmentId: string): Promise<Result<void, Error>> => {
        const itemToDelete = equipment.find(e => e.id === equipmentId);
        if (!itemToDelete) {
            return { success: false, error: new Error("Equipment not found") };
        }
        const result = await adapter.deleteEquipment(equipmentId);
        if (result.success) {
            addAuditLog('EQUIPMENT_DELETE', `Deleted equipment '${itemToDelete.nameEN}'`);
        }
        return result;
    }, [adapter, equipment, addAuditLog]);
    
    const addMaintenanceLog = useCallback(async (log: Omit<MaintenanceLog, 'id'>): Promise<Result<MaintenanceLog, Error>> => {
        const result = await adapter.createMaintenanceLog(log);
        if(result.success) {
            const eq = equipment.find(e => e.id === log.equipmentId);
            addAuditLog('MAINTENANCE_LOG_CREATE', `Maintenance log created for '${eq?.nameEN}'`);
        }
        return result;
    }, [adapter, equipment, addAuditLog]);
    
    const updateCO2IncubatorTracking = useCallback((data: CO2IncubatorTracking): Result<CO2IncubatorTracking, Error> => {
        try {
            setCo2IncubatorTrackingData(prev => prev.map(d => d.id === data.id ? data : d));
            return { success: true, data: data };
        } catch (e) {
            return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }, [setCo2IncubatorTrackingData]);

    const emergencyStopAllEquipment = useCallback(async (): Promise<Result<void, Error>> => {
        try {
            const equipmentToStop = equipment.filter(e => e.status !== EquipmentStatus.Maintenance);
            const updates = equipmentToStop.map(e => adapter.updateEquipment({ ...e, status: EquipmentStatus.Maintenance }));
            await Promise.all(updates);

            const staffToNotify = users.filter(u => u.roleCategory === RoleCategory.Facility);
            staffToNotify.forEach(staff => {
                addNotification({
                    recipientUserId: staff.id,
                    type: NotificationType.EquipmentMalfunction,
                    priority: 'HIGH',
                    titleJP: '緊急停止発動',
                    titleEN: 'Emergency Stop Activated',
                    messageJP: '全ての機器が緊急停止されました。',
                    messageEN: 'All equipment has been put into emergency maintenance status.',
                    actionUrl: `#/equipmentManagement`,
                });
            });
            addAuditLog('EMERGENCY_STOP', `All equipment stopped.`);
            return { success: true, data: undefined };
        } catch (e) {
            return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }, [equipment, users, adapter, addAuditLog, addNotification]);

    return useMemo(() => ({
        addEquipment,
        updateEquipment,
        deleteEquipment,
        addMaintenanceLog,
        updateCO2IncubatorTracking,
        emergencyStopAllEquipment,
    }), [addEquipment, updateEquipment, deleteEquipment, addMaintenanceLog, updateCO2IncubatorTracking, emergencyStopAllEquipment]);
};