// src/hooks/usePurchasingActions.ts
import { useCallback, useMemo } from 'react';
import { usePurchasingContext } from '../contexts/AppProviders';
import { useSessionContext } from '../contexts/SessionContext';
import { Result } from '../types';
import { QuotationStatus, QuotationResponse } from '../types';

export const usePurchasingActions = () => {
    const { setQuotations } = usePurchasingContext();
    const { currentUser } = useSessionContext();

    const addQuotationResponseFromSupplier = useCallback(async (quotationId: string, response: Omit<QuotationResponse, 'supplierId' | 'answeredAt'>): Promise<Result<void, Error>> => {
        if (!currentUser) return { success: false, error: new Error('Not logged in')};
        
        // This is mock behavior, in real app this would be an adapter call.
        setQuotations(prev => prev.map(q => {
            if (q.id === quotationId) {
                return {
                    ...q,
                    responses: [...q.responses, { ...response, supplierId: currentUser.id, answeredAt: new Date() }],
                    status: QuotationStatus.Answered,
                }
            }
            return q;
        }));
        return { success: true, data: undefined };
    }, [currentUser, setQuotations]);
    
    return useMemo(() => ({
        addQuotationResponseFromSupplier
    }), [addQuotationResponseFromSupplier]);
};