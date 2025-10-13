// src/contexts/ConsumableContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Consumable } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface ConsumableContextValue {
  consumables: Consumable[];
  loading: boolean;
}

const ConsumableContext = createContext<ConsumableContextValue | null>(null);

export const ConsumableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToConsumables((data) => {
      setConsumables(data);
      if (loading) setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter, loading]);

  const value = { consumables, loading };

  return <ConsumableContext.Provider value={value}>{children}</ConsumableContext.Provider>;
};

export const useConsumableContext = () => {
  const context = useContext(ConsumableContext);
  if (!context) throw new Error('useConsumableContext must be used within ConsumableProvider');
  return context;
};
