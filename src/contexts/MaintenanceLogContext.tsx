// src/contexts/MaintenanceLogContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MaintenanceLog } from '../types';
import { useDataAdapter } from './DataAdapterContext';

const MaintenanceLogsDataContext = createContext<MaintenanceLog[]>([]);
const MaintenanceLogsLoadingContext = createContext<boolean>(true);

export const MaintenanceLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToMaintenanceLogs((data) => {
        setMaintenanceLogs(data);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter]);
  
  return (
    <MaintenanceLogsDataContext.Provider value={maintenanceLogs}>
      <MaintenanceLogsLoadingContext.Provider value={loading}>
        {children}
      </MaintenanceLogsLoadingContext.Provider>
    </MaintenanceLogsDataContext.Provider>
  );
};

export const useMaintenanceLogs = () => {
  const context = useContext(MaintenanceLogsDataContext);
  if (context === undefined) {
    throw new Error('useMaintenanceLogs must be used within a MaintenanceLogProvider');
  }
  return context;
};
