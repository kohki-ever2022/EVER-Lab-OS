// src/contexts/ReservationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import { Reservation } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface ReservationContextValue {
  reservations: Reservation[];
  loading: boolean;
}

const ReservationsDataContext = createContext<Reservation[]>([]);
const ReservationsLoadingContext = createContext<boolean>(true);

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const adapter = useDataAdapter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToReservations((data) => {
      setReservations(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter]);

  return (
    <ReservationsDataContext.Provider value={reservations}>
      <ReservationsLoadingContext.Provider value={loading}>
        {children}
      </ReservationsLoadingContext.Provider>
    </ReservationsDataContext.Provider>
  );
};

export const useReservations = () => {
  const context = useContext(ReservationsDataContext);
  if (context === undefined) {
    throw new Error(
      'useReservations must be used within a ReservationProvider'
    );
  }
  return context;
};
