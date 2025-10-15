import React from 'react';
// FIX: import from barrel file
import { Invoice } from '../../types';
import InvoiceCard from './InvoiceCard';
import { useSessionContext } from '../../contexts/SessionContext';
import { useBillingContext } from '../../contexts/AppProviders';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from '../../hooks/useTranslation';

const Billing: React.FC = () => {
  const { currentUser } = useSessionContext();
  const { t } = useTranslation();
  const { invoices } = useBillingContext();
  const { hasPermission } = usePermissions();
  
  if (!currentUser) return null;

  if (!hasPermission('billing', 'read')) {
      return (
          <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">{t('permissionDenied')}</h3>
              <p className="mt-1 text-sm text-gray-500">{t('permissionDeniedViewPage')}</p>
          </div>
      );
  }

  const myInvoices = invoices.filter(inv => inv.companyId === currentUser.companyId);
  
  const handleViewPDF = (invoice: Invoice) => {
    if (invoice.mfPdfUrl) {
      window.open(invoice.mfPdfUrl, '_blank');
    } else {
      alert(t('cannotDisplayPdf'));
    }
  };

  const downloadPDF = async (invoice: Invoice) => {
    if (invoice.mfPdfUrl) {
        alert(t('cannotDownloadPdf'));
    } else {
        alert(t('cannotDisplayPdf'));
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('invoices')}</h1>
      
      {myInvoices.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
            {myInvoices.map(invoice => (
            <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onViewPDF={() => handleViewPDF(invoice)}
                onDownload={() => downloadPDF(invoice)}
            />
            ))}
        </div>
      ) : (
        <p>{t('noInvoicesAvailable')}</p>
      )}
    </div>
  );
};

export default Billing;