// src/contexts/UsageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usage } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface UsageContextValue {
  usage: Usage[];
  loading: boolean;
}

const UsageContext = createContext<UsageContextValue | null>(null);

export const UsageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [usage, setUsage] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = adapter.subscribeToUsages((data) => {
      setUsage(data);
      if (loading) setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter, loading]);

  return <UsageContext.Provider value={{ usage, loading }}>{children}</UsageContext.Provider>;
};

export const useUsageContext = () => {
  const context = useContext(UsageContext);
  if (!context) throw new Error('useUsageContext must be used within a UsageProvider');
  return context;
};