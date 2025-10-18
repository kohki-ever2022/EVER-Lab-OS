// src/contexts/app/AuditContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import { AuditLog } from '../../types';
import { getMockData } from '../../data/mockData';

export interface AuditContextValue {
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
}

export const AuditContext = createContext<AuditContextValue | null>(null);

export const AuditProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const initialData = getMockData();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialData.auditLogs);

  const value = useMemo(() => ({ auditLogs, setAuditLogs }), [auditLogs]);

  return (
    <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
  );
};

export const useAuditContext = () => {
  const c = useContext(AuditContext);
  if (!c) throw new Error('useAuditContext must be inside AuditProvider');
  return c;
};
