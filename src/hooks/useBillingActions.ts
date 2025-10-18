// src/hooks/useBillingActions.ts
import { useCallback, useMemo } from 'react';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { useAdminContext } from '../contexts/AppProviders';
import { Result, Invoice, Usage, Equipment } from '../types';

export const useBillingActions = () => {
  const adapter = useDataAdapter();
  const { systemSettings } = useAdminContext();

  const addInvoice = useCallback(
    async (
      invoiceItem: Omit<Invoice, 'id'>
    ): Promise<Result<Invoice, Error>> => {
      return await adapter.createInvoice(invoiceItem);
    },
    [adapter]
  );

  const updateInvoice = useCallback(
    async (invoiceItem: Invoice): Promise<Result<Invoice, Error>> => {
      return await adapter.updateInvoice(invoiceItem);
    },
    [adapter]
  );

  const calculateCostForUsage = useCallback(
    (usage: Usage, eq: Equipment): number => {
      if (!eq) return 0;

      let cost = 0;
      if (eq.rateUnitEN.toLowerCase().includes('cycle')) {
        cost = (usage.cycles || 0) * eq.rate;
      } else if (eq.rateUnitEN.toLowerCase().includes('hour')) {
        let billableMinutes = usage.durationMinutes || 0;
        const granularityMatch =
          eq.granularity.match(/(\d+)分単位・(切上げ|四捨入)/);

        if (granularityMatch) {
          const unit = parseInt(granularityMatch[1], 10);
          const roundingType = granularityMatch[2];
          if (unit > 0) {
            if (roundingType === '切上げ') {
              billableMinutes = Math.ceil(billableMinutes / unit) * unit;
            } else if (roundingType === '四捨入') {
              billableMinutes = Math.round(billableMinutes / unit) * unit;
            }
          }
        }
        cost = (billableMinutes / 60) * eq.rate;
      }

      if (cost > 0 && systemSettings.surgePricingEnabled) {
        const usageHour = usage.date.getHours();
        const surgeStartHour = parseInt(
          systemSettings.surgeStartTime.split(':')[0]
        );
        const surgeEndHour = parseInt(
          systemSettings.surgeEndTime.split(':')[0]
        );
        if (usageHour >= surgeStartHour && usageHour < surgeEndHour) {
          return cost * systemSettings.surgeMultiplier;
        }
      }
      return cost;
    },
    [systemSettings]
  );

  return useMemo(
    () => ({
      addInvoice,
      updateInvoice,
      calculateCostForUsage,
    }),
    [addInvoice, updateInvoice, calculateCostForUsage]
  );
};
