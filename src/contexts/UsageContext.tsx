// src/contexts/UsageContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Usage } from '../types';
import { useDataAdapter } from './DataAdapterContext';

export const UsagesDataContext = createContext<Usage[]>([]);
export const UsagesLoadingContext = createContext<boolean>(true);

export const UsageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const adapter = useDataAdapter();
  const [usages, setUsages] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToUsages((data) => {
      setUsages(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter]);

  return (
    <UsagesDataContext.Provider value={usages}>
      <UsagesLoadingContext.Provider value={loading}>
        {children}
      </UsagesLoadingContext.Provider>
    </UsagesDataContext.Provider>
  );
};

export const useUsages = () => {
  const context = useContext(UsagesDataContext);
  if (context === undefined) {
    throw new Error('useUsages must be used within a UsageProvider');
  }
  return context;
};

export const useUsagesLoading = () => {
  const context = useContext(UsagesLoadingContext);
  if (context === undefined) {
    throw new Error('useUsagesLoading must be used within a UsageProvider');
  }
  return context;
};
