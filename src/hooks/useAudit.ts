// src/hooks/useAudit.ts
import { useCallback } from 'react';
import { useAdminContext } from '../contexts/AppProviders';
import { useSessionContext } from '../contexts/SessionContext';
// FIX: import from barrel file
import { AuditLog } from '../types';

const simpleUUID = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAudit = () => {
    const { setAuditLogs } = useAdminContext();
    const { currentUser } = useSessionContext();

    const addAuditLog = useCallback((action: string, details: string) => {
        if (!currentUser) return;
        const newLog: AuditLog = {
            id: simpleUUID(),
            timestamp: new Date(),
            userId: currentUser.id,
            userName: currentUser.name,
            action,
            details,
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, [currentUser, setAuditLogs]);

    return { addAuditLog };
};