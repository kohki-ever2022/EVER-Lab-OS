import React from 'react';
// FIX: import from barrel file
import { Invoice } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';

interface InvoiceCardProps {
  invoice: Invoice;
  onViewPDF: () => void;
  onDownload: () => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onViewPDF, onDownload }) => {
  const { isJapanese } = useSessionContext();
  // Basic placeholder implementation
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="font-bold">{invoice.invoiceNumber}</p>
      <p>{isJapanese ? '合計:' : 'Total:'} ¥{invoice.totalAmount.toLocaleString()}</p>
      <p>{isJapanese ? '発行日:' : 'Issued:'} {new Date(invoice.issueDate).toLocaleDateString()}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={onViewPDF} className="text-blue-500">View</button>
        <button onClick={onDownload} className="text-blue-500">Download</button>
      </div>
    </div>
  );
};

export default InvoiceCard;