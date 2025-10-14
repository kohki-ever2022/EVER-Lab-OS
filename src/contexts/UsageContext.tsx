// src/contexts/UsageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
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
  
  const value = useMemo(() => ({ usage, loading }), [usage, loading]);

  return <UsageContext.Provider value={value}>{children}</UsageContext.Provider>;
};

export const useUsageContext = () => {
  const context = useContext(UsageContext);
  if (!context) throw new Error('useUsageContext must be used within a UsageProvider');
  return context;
};