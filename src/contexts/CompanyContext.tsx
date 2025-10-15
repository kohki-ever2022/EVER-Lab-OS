// src/contexts/CompanyContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Company } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface CompanyContextValue {
  companies: Company[];
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToCompanies((data) => {
      setCompanies(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter]);

  const value = useMemo(() => ({ companies, loading }), [companies, loading]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};

export const useCompanyContext = () => {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompanyContext must be used within CompanyProvider');
  return context;
};
