// src/contexts/app/BillingContext.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Invoice } from '../../types';
import { getMockData } from '../../data/mockData';

interface BillingContextValue { invoices: Invoice[]; }

const BillingContext = createContext<BillingContextValue | null>(null);

export const BillingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // In a real app this would subscribe to invoices. For mock data, it's empty initially.
    const [invoices] = useState<Invoice[]>(getMockData().invoices);
    const value = useMemo(() => ({ invoices }), [invoices]);
    return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
};

export const useBillingContext = () => {
    const c = useContext(BillingContext);
    if (!c) throw new Error('useBillingContext must be inside BillingProvider');
    return c;
};
