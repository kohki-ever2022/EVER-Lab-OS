// src/contexts/OrderContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Order } from '../types';
import { useDataAdapter } from './DataAdapterContext';

const OrdersDataContext = createContext<Order[]>([]);
const OrdersLoadingContext = createContext<boolean>(true);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const adapter = useDataAdapter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter]);

  return (
    <OrdersDataContext.Provider value={orders}>
      <OrdersLoadingContext.Provider value={loading}>
        {children}
      </OrdersLoadingContext.Provider>
    </OrdersDataContext.Provider>
  );
};
