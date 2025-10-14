import React from 'react';
// FIX: import from barrel file
import { Invoice } from '../../types';
import InvoiceCard from './InvoiceCard';
import { useSessionContext } from '../../contexts/SessionContext';
import { useBillingContext } from '../../contexts/AppProviders';
import { usePermissions } from '../../hooks/usePermissions';

const Billing: React.FC = () => {
  const { currentUser, isJapanese } = useSessionContext();
  const { invoices } = useBillingContext();
  const { hasPermission } = usePermissions();
  
  if (!currentUser) return null;

  if (!hasPermission('billing', 'read')) {
      return (
          <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">{isJapanese ? 'アクセス権がありません' : 'Permission Denied'}</h3>
              <p className="mt-1 text-sm text-gray-500">{isJapanese ? 'このページを閲覧する権限がありません。' : 'You do not have permission to view this page.'}</p>
          </div>
      );
  }

  const myInvoices = invoices.filter(inv => inv.companyId === currentUser.companyId);
  
  const handleViewPDF = (invoice: Invoice) => {
    if (invoice.mfPdfUrl) {
      window.open(invoice.mfPdfUrl, '_blank');
    } else {
      alert(isJapanese ? 'PDFデータを表示できません。この機能は現在利用できません。' : 'Cannot display PDF data. This feature is currently unavailable.');
    }
  };

  const downloadPDF = async (invoice: Invoice) => {
    if (invoice.mfPdfUrl) {
        alert(isJapanese ? 'このPDFは直接ダウンロードできません。「PDF表示」から保存してください。' : 'This PDF cannot be downloaded directly. Please save from "View PDF".');
    } else {
        alert(isJapanese ? 'PDFデータをダウンロードできません。この機能は現在利用できません。' : 'Cannot download PDF data. This feature is currently unavailable.');
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{isJapanese ? '請求書一覧' : 'Invoices'}</h1>
      
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
        <p>{isJapanese ? '利用可能な請求書はありません。' : 'No invoices available.'}</p>
      )}
    </div>
  );
};

export default Billing;