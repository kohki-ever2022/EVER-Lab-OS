// src/contexts/OrderContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '../types';
import { useDataAdapter } from './DataAdapterContext';

export const OrdersDataContext = createContext<Order[]>([]);
export const OrdersLoadingContext = createContext<boolean>(true);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

export const useOrders = () => {
  const context = useContext(OrdersDataContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const useOrdersLoading = () => {
  const context = useContext(OrdersLoadingContext);
  if (context === undefined) {
    throw new Error('useOrdersLoading must be used within an OrderProvider');
  }
  return context;
};