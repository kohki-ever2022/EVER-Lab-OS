import React from 'react';
import { Invoice } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface InvoiceCardProps {
  invoice: Invoice;
  onViewPDF: () => void;
  onDownload: () => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onViewPDF, onDownload }) => {
  const { t } = useTranslation();
  // Basic placeholder implementation
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="font-bold">{invoice.invoiceNumber}</p>
      <p>{t('total')} ¥{invoice.totalAmount.toLocaleString()}</p>
      <p>{t('issued')} {new Date(invoice.issueDate).toLocaleDateString()}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={onViewPDF} className="text-blue-500">View</button>
        <button onClick={onDownload} className="text-blue-500">Download</button>
      </div>
    </div>
  );
};

export default InvoiceCard;