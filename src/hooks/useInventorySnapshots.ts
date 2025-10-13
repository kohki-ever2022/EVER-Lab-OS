// src/hooks/useInventorySnapshots.ts
import { useCallback } from 'react';
import { Consumable, InventorySnapshot } from '../types/inventory';
import { AuditLog } from '../types/common';
import { useAdminContext } from '../contexts/AppProviders';

const generateId = (): string => {
  return `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useInventorySnapshots = () => {
  const { inventorySnapshots: snapshots, setInventorySnapshots: setSnapshots, setAuditLogs } = useAdminContext();

  const createMonthlySnapshot = useCallback((
    year: number,
    month: number,
    consumables: Consumable[],
    userId: string,
    userName: string,
    notes?: string
  ): InventorySnapshot => {
    const snapshotId = generateId();
    const period = `${year}-${String(month).padStart(2, '0')}`;
    
    const snapshot: InventorySnapshot = {
      id: snapshotId,
      period: period,
      snapshotDate: new Date(),
      consumables: consumables.map(c => ({
        id: c.id,
        nameJP: c.nameJP,
        nameEN: c.nameEN,
        stock: c.stock,
        unit: c.packageUnit || '',
        categoryJP: c.categoryJP,
        categoryEN: c.categoryEN,
        ownerCompanyId: c.ownerCompanyId,
      })),
      createdBy: userId,
      notes: notes || '',
    };

    setSnapshots(prev => [...prev, snapshot]);
    
    setAuditLogs(prev => [...prev, {
      id: `audit-${Date.now()}`,
      action: 'SNAPSHOT_CREATED',
      details: `Created snapshot for period ${period}`,
      userId,
      userName,
      timestamp: new Date()
    }]);

    return snapshot;
  }, [setSnapshots, setAuditLogs]);

  const unlockAllSnapshots = useCallback((userId: string, userName: string, reason: string) => {
    setSnapshots([]);
    setAuditLogs(prev => [...prev, {
      id: `audit-${Date.now()}`,
      action: 'ALL_UNLOCKED',
      details: `Reason: ${reason}`,
      userId,
      userName,
      timestamp: new Date()
    }]);
  }, [setSnapshots, setAuditLogs]);

  const getLatestSnapshot = useCallback(() => {
    if (snapshots.length === 0) return null;
    return [...snapshots].sort((a, b) => 
      new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime()
    )[0];
  }, [snapshots]);

  return {
    snapshots,
    createMonthlySnapshot,
    unlockAllSnapshots,
    getLatestSnapshot
  };
};

export type InventorySnapshotsValue = ReturnType<typeof useInventorySnapshots>;
