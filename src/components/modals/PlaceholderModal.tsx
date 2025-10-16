import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { BenchAssignment } from '../../types';
import { useCompanyContext } from '../../contexts/CompanyContext';
import { useModalContext } from '../../contexts/ModalContext';
import { useToast } from '../../contexts/ToastContext';

interface Props {
  title: string;
  onClose: () => void;
}

const PlaceholderModal: React.FC<Props> = ({ title, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md modal-content">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">
          {t('underDevelopment')}
        </p>
        <div className="flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderModal;

// --- Implemented Modal ---

interface BenchDetailsModalProps {
    benchInfo: { id: string; assignment?: BenchAssignment } | null;
    onClose: () => void;
}

export const BenchDetailsModal: React.FC<BenchDetailsModalProps> = ({ benchInfo, onClose }) => {
    const { t, isJapanese } = useTranslation();
    const { companies } = useCompanyContext();
    const { openModal } = useModalContext();
    const { showToast } = useToast();

    const [assignToCompanyId, setAssignToCompanyId] = useState('');

    if (!benchInfo) return null;

    const company = benchInfo.assignment?.companyId ? companies.find(c => c.id === benchInfo.assignment.companyId) : null;
    
    const handleAssign = () => {
        if (!assignToCompanyId) {
            showToast('Please select a tenant.', 'error');
            return;
        }
        openModal({
            type: 'confirmAction',
            props: {
                title: 'Confirm Assignment',
                message: `Assign bench ${benchInfo.id} to ${companies.find(c => c.id === assignToCompanyId)?.nameEN}?`,
                onConfirm: () => {
                    // Placeholder for actual logic
                    showToast(`Bench ${benchInfo.id} assigned. (Demo)`, 'success');
                    onClose();
                }
            }
        })
    };
    
    const handleClear = () => {
         openModal({
            type: 'confirmAction',
            props: {
                title: 'Confirm Clear Assignment',
                message: `Are you sure you want to clear the assignment for bench ${benchInfo.id}?`,
                onConfirm: () => {
                    // Placeholder for actual logic
                    showToast(`Assignment for ${benchInfo.id} cleared. (Demo)`, 'success');
                    onClose();
                }
            }
        })
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md modal-content">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('benchDetails')} - {benchInfo.id}</h3>
            
            {company ? (
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">{t('assignedTo')}</p>
                        <p className="font-semibold">{isJapanese ? company.nameJP : company.nameEN}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">{t('startDate')}</p>
                        <p className="font-semibold">{new Date(benchInfo.assignment!.startDate).toLocaleDateString()}</p>
                    </div>
                    <button onClick={handleClear} className="w-full mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
                        {t('clearAssignment')}
                    </button>
                </div>
            ) : (
                 <div className="space-y-4">
                    <p className="text-center font-semibold text-green-700 bg-green-50 p-3 rounded-md">{t('available')}</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('assignTo')}</label>
                        <select value={assignToCompanyId} onChange={e => setAssignToCompanyId(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option value="">{t('selectTenant')}</option>
                            {companies.filter(c => c.isActive).map(c => (
                                <option key={c.id} value={c.id}>{isJapanese ? c.nameJP : c.nameEN}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleAssign} className="w-full mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        {t('assignBench')}
                    </button>
                </div>
            )}

            <div className="flex justify-end mt-6">
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
    );
};