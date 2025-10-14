// src/contexts/EquipmentContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Equipment } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface EquipmentContextValue {
  equipment: Equipment[];
  loading: boolean;
}

const EquipmentContext = createContext<EquipmentContextValue | null>(null);

export const EquipmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToEquipment((data) => {
      setEquipment(data);
      if (loading) setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter, loading]);

  const value = useMemo(() => ({ equipment, loading }), [equipment, loading]);

  return <EquipmentContext.Provider value={value}>{children}</EquipmentContext.Provider>;
};

export const useEquipmentContext = () => {
  const context = useContext(EquipmentContext);
  if (!context) throw new Error('useEquipmentContext must be used within EquipmentProvider');
  return context;
};