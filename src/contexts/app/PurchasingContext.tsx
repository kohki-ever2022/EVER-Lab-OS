// src/contexts/app/PurchasingContext.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Quotation } from '../../types';
import { getMockData } from '../../data/mockData';

interface PurchasingContextValue {
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
}
const PurchasingContext = createContext<PurchasingContextValue | null>(null);
export const PurchasingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [quotations, setQuotations] = useState<Quotation[]>(getMockData().quotations);
    const value = useMemo(() => ({ quotations, setQuotations }), [quotations]);
    return <PurchasingContext.Provider value={value}>{children}</PurchasingContext.Provider>;
};
export const usePurchasingContext = () => {
    const c = useContext(PurchasingContext);
    if (!c) throw new Error('usePurchasingContext must be inside PurchasingProvider');
    return c;
};
