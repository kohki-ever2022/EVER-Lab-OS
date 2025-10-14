// src/contexts/OrderContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Order } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface OrderContextValue {
  orders: Order[];
  loading: boolean;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = adapter.subscribeToOrders((data) => {
      setOrders(data);
      if (loading) setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter, loading]);
  
  const value = useMemo(() => ({ orders, loading }), [orders, loading]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrderContext must be used within an OrderProvider');
  return context;
};