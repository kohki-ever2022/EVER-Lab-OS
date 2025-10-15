// src/contexts/EquipmentContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Equipment } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface EquipmentContextValue {
  equipment: Equipment[];
  loading: boolean;
}

const EquipmentDataContext = createContext<Equipment[]>([]);
const EquipmentLoadingContext = createContext<boolean>(true);

export const EquipmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToEquipment((data) => {
      setEquipment(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter]);

  return (
    <EquipmentDataContext.Provider value={equipment}>
        <EquipmentLoadingContext.Provider value={loading}>
            {children}
        </EquipmentLoadingContext.Provider>
    </EquipmentDataContext.Provider>
  );
};

export const useEquipment = () => {
    const context = useContext(EquipmentDataContext);
    if (context === undefined) {
        throw new Error('useEquipment must be used within an EquipmentProvider');
    }
    return context;
};

export const useEquipmentLoading = () => {
    const context = useContext(EquipmentLoadingContext);
    if (context === undefined) {
        throw new Error('useEquipmentLoading must be used within an EquipmentProvider');
    }
    return context;
};
