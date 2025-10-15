// src/contexts/ConsumableContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Consumable } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface ConsumableContextValue {
  consumables: Consumable[];
  loading: boolean;
}

const ConsumablesDataContext = createContext<Consumable[]>([]);
const ConsumablesLoadingContext = createContext<boolean>(true);

// Keep original context export for test setup compatibility if needed, though ideally tests should be updated.
export const ConsumableContext = createContext<ConsumableContextValue | null>(null);

export const ConsumableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToConsumables((data) => {
      setConsumables(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter]);

  return (
    <ConsumablesDataContext.Provider value={consumables}>
      <ConsumablesLoadingContext.Provider value={loading}>
        {children}
      </ConsumablesLoadingContext.Provider>
    </ConsumablesDataContext.Provider>
  );
};

export const useConsumables = () => {
  const context = useContext(ConsumablesDataContext);
  if (context === undefined) {
    throw new Error('useConsumables must be used within a ConsumableProvider');
  }
  return context;
};

export const useConsumablesLoading = () => {
  const context = useContext(ConsumablesLoadingContext);
  if (context === undefined) {
    throw new Error('useConsumablesLoading must be used within a ConsumableProvider');
  }
  return context;
};
