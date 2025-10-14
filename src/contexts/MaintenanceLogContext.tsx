// src/contexts/MaintenanceLogContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { MaintenanceLog } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface MaintenanceLogContextValue {
  maintenanceLogs: MaintenanceLog[];
  loading: boolean;
}

const MaintenanceLogContext = createContext<MaintenanceLogContextValue | null>(null);

export const MaintenanceLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = adapter.subscribeToMaintenanceLogs((data) => {
      setMaintenanceLogs(data);
      if (loading) setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter, loading]);
  
  const value = useMemo(() => ({ maintenanceLogs, loading }), [maintenanceLogs, loading]);

  return <MaintenanceLogContext.Provider value={value}>{children}</MaintenanceLogContext.Provider>;
};

export const useMaintenanceLogContext = () => {
  const context = useContext(MaintenanceLogContext);
  if (!context) throw new Error('useMaintenanceLogContext must be used within a MaintenanceLogProvider');
  return context;
};