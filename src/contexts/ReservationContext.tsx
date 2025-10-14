// src/contexts/ReservationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Reservation } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface ReservationContextValue {
  reservations: Reservation[];
  loading: boolean;
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToReservations((data) => {
      setReservations(data);
      if (loading) setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter, loading]);

  const value = useMemo(() => ({ reservations, loading }), [reservations, loading]);

  return <ReservationContext.Provider value={value}>{children}</ReservationContext.Provider>;
};

export const useReservationContext = () => {
  const context = useContext(ReservationContext);
  if (!context) throw new Error('useReservationContext must be used within ReservationProvider');
  return context;
};