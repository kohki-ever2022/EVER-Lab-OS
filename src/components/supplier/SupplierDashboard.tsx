// src/components/supplier/SupplierDashboard.tsx
import React, { useState, useMemo } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { usePurchasingContext } from '../../contexts/AppProviders';
import { useToast } from '../../contexts/ToastContext';
import { usePurchasingActions } from '../../hooks/usePurchasingActions';
// FIX: import from barrel file
import { Quotation } from '../../types';

const SupplierDashboard: React.FC = () => {
    const { isJapanese, currentUser } = useSessionContext();
    const { quotations } = usePurchasingContext();
    const { addQuotationResponseFromSupplier } = usePurchasingActions();
    const { showToast } = useToast();
    
    const [activeTab, setActiveTab] = useState('PENDING');
    const [responseForms, setResponseForms] = useState<Record<string, { price: string; deliveryDate: string; notes: string }>>({});

    const myQuotations = useMemo(() => quotations.filter(q => q.supplierIds.includes(currentUser?.id || '')), [quotations, currentUser]);

    const pendingQuotes = useMemo(() => myQuotations.filter(q => q.status === 'REQUESTED' && !q.responses.some(r => r.supplierId === currentUser?.id)), [myQuotations, currentUser]);
    const quotedQuotes = useMemo(() => myQuotations.filter(q => q.responses.some(r => r.supplierId === currentUser?.id)), [myQuotations, currentUser]);
    const orderedQuotes = useMemo(() => myQuotations.filter(q => q.status === 'ORDERED'), [myQuotations]);

    const handleFormChange = (quoteId: string, field: string, value: string) => {
        setResponseForms(prev => ({
            ...prev,
            [quoteId]: {
                ...prev[quoteId],
                [field]: value,
            }
        }));
    };

    const handleRespond = async (quoteId: string) => {
        const formData = responseForms[quoteId];
        if (!formData || !formData.price || !formData.deliveryDate) {
            showToast(isJapanese ? '価格と納期を入力してください。' : 'Please enter price and delivery date.', 'error');
            return;
        }

        const result = await addQuotationResponseFromSupplier(quoteId, {
            price: parseFloat(formData.price),
            deliveryDate: new Date(formData.deliveryDate),
            notes: formData.notes
        });
        if (result.success === false) {
            showToast(isJapanese ? '回答の送信に失敗しました。' : 'Failed to submit response.', 'error');
        } else {
            showToast(isJapanese ? '回答を送信しました。' : 'Response submitted successfully.', 'success');
        }
    };

    const renderQuotes = (quotes: Quotation[]) => {
        if (quotes.length === 0) {
            return <p className="text-gray-500 py-8 text-center">{isJapanese ? '該当する依頼はありません。' : 'No requests found.'}</p>
        }
        return (
            <div className="space-y-4">
                {quotes.map(q => {
                    const myResponse = q.responses.find(r => r.supplierId === currentUser?.id);
                    return (
                        <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm border">
                            <h4 className="font-bold">{q.productName}</h4>
                            <p className="text-sm text-gray-600">{q.productDetails}</p>
                            <p className="text-sm mt-2">{isJapanese ? '数量:' : 'Quantity:'} {q.quantity}</p>
                            <p className="text-xs text-gray-500 mt-1">{isJapanese ? '依頼日:' : 'Requested on:'} {new Date(q.requestDate).toLocaleDateString()}</p>
                            
                            {activeTab === 'PENDING' && !myResponse && (
                                <div className="mt-4 pt-4 border-t space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium">価格 (円)</label>
                                            <input type="number" value={responseForms[q.id]?.price || ''} onChange={(e) => handleFormChange(q.id, 'price', e.target.value)} className="w-full border rounded p-1 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium">納期</label>
                                            <input type="date" value={responseForms[q.id]?.deliveryDate || ''} onChange={(e) => handleFormChange(q.id, 'deliveryDate', e.target.value)} className="w-full border rounded p-1 text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium">備考</label>
                                        <textarea value={responseForms[q.id]?.notes || ''} onChange={(e) => handleFormChange(q.id, 'notes', e.target.value)} className="w-full border rounded p-1 text-sm" rows={2}></textarea>
                                    </div>
                                    <button onClick={() => handleRespond(q.id)} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">
                                        {isJapanese ? '回答する' : 'Respond'}
                                    </button>
                                </div>
                            )}

                            {myResponse && (
                                <div className="mt-3 pt-3 border-t bg-gray-50 p-3 rounded">
                                    <h5 className="text-sm font-semibold">{isJapanese ? 'あなたの回答' : 'Your Response'}</h5>
                                    <p className="text-sm">価格: ¥{myResponse.price?.toLocaleString()}</p>
                                    <p className="text-sm">納期: {myResponse.deliveryDate ? new Date(myResponse.deliveryDate).toLocaleDateString() : 'N/A'}</p>
                                    {myResponse.notes && <p className="text-sm mt-1 text-gray-600">備考: {myResponse.notes}</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-ever-black">
                {isJapanese ? 'サプライヤーダッシュボード' : 'Supplier Dashboard'}
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">{isJapanese ? '見積もり依頼管理' : 'Quotation Management'}</h3>
                
                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('PENDING')} className={`${activeTab === 'PENDING' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            {isJapanese ? '新規依頼' : 'Pending'} ({pendingQuotes.length})
                        </button>
                        <button onClick={() => setActiveTab('QUOTED')} className={`${activeTab === 'QUOTED' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            {isJapanese ? '回答済み' : 'Quoted'} ({quotedQuotes.length})
                        </button>
                        <button onClick={() => setActiveTab('ORDERED')} className={`${activeTab === 'ORDERED' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            {isJapanese ? '発注済み' : 'Ordered'} ({orderedQuotes.length})
                        </button>
                    </nav>
                </div>
                
                {activeTab === 'PENDING' && renderQuotes(pendingQuotes)}
                {activeTab === 'QUOTED' && renderQuotes(quotedQuotes)}
                {activeTab === 'ORDERED' && renderQuotes(orderedQuotes)}
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                 <h3 className="text-xl font-bold mb-4">{isJapanese ? '納品管理' : 'Delivery Management'}</h3>
                 <p className="text-gray-500">{isJapanese ? '納品予定の品目はありません。' : 'There are no items scheduled for delivery.'}</p>
            </div>
        </div>
    );
};

export default SupplierDashboard;