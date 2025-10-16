// src/contexts/CompanyContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company } from '../types';
import { useDataAdapter } from './DataAdapterContext';

export const CompaniesDataContext = createContext<Company[]>([]);
export const CompaniesLoadingContext = createContext<boolean>(true);

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

  return (
    <CompaniesDataContext.Provider value={companies}>
      <CompaniesLoadingContext.Provider value={loading}>
        {children}
      </CompaniesLoadingContext.Provider>
    </CompaniesDataContext.Provider>
  );
};

export const useCompanyContext = () => {
  const companies = useContext(CompaniesDataContext);
  const loading = useContext(CompaniesLoadingContext);
  if (companies === undefined || loading === undefined) {
    throw new Error('useCompanyContext must be used within CompanyProvider');
  }
  return { companies, loading };
};