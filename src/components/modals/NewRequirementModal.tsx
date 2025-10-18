// src/components/modals/NewRequirementModal.tsx
import React, { useState } from 'react';
import {
  RegulationType,
  SubmissionStatus,
  RegulatoryRequirement,
} from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useToast } from '../../contexts/ToastContext';
import { useComplianceActions } from '../../hooks/useComplianceActions';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NewRequirementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser } = useSessionContext();
  const { showToast } = useToast();
  const { addRegulatoryRequirement } = useComplianceActions();
  const { t } = useTranslation();
  const [newRequirement, setNewRequirement] = useState<
    Partial<Omit<RegulatoryRequirement, 'id'>>
  >({
    tenantId: currentUser?.companyId,
    type: RegulationType.Other,
    submissionStatus: SubmissionStatus.Required,
  });

  const regulationTypeLabels = {
    [RegulationType.PharmaceuticalLaw]: { key: 'regTypePharma' },
    [RegulationType.CartegenaLaw]: { key: 'regTypeCartegena' },
    [RegulationType.SafetyHealthLaw]: { key: 'regTypeSafetyHealth' },
    [RegulationType.FireServiceLaw]: { key: 'regTypeFireService' },
    [RegulationType.PoisonControlLaw]: { key: 'regTypePoisonControl' },
    [RegulationType.Other]: { key: 'categoryOther' },
  };

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newRequirement.requirementNameJP ||
      !newRequirement.requirementNameEN ||
      !newRequirement.submissionAuthority
    ) {
      showToast(t('requiredFields'), 'error');
      return;
    }
    const result = await addRegulatoryRequirement(newRequirement as any);
    if (result.success === false) {
      showToast(t('addRequirementFailed'), 'error');
    } else {
      showToast(t('addRequirementSuccess'), 'success');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop'>
      <div className='bg-white rounded-lg shadow-xl p-6 w-full max-w-lg modal-content'>
        <h3 className='text-lg font-bold mb-4'>{t('newRequirement')}</h3>
        <form onSubmit={handleAddRequirement} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium'>
              {t('requirementNameJP')}
            </label>
            <input
              type='text'
              value={newRequirement.requirementNameJP || ''}
              onChange={(e) =>
                setNewRequirement((p) => ({
                  ...p,
                  requirementNameJP: e.target.value,
                }))
              }
              className='w-full border rounded p-2 mt-1'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium'>
              {t('requirementNameEN')}
            </label>
            <input
              type='text'
              value={newRequirement.requirementNameEN || ''}
              onChange={(e) =>
                setNewRequirement((p) => ({
                  ...p,
                  requirementNameEN: e.target.value,
                }))
              }
              className='w-full border rounded p-2 mt-1'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium'>
              {t('regulation')}
            </label>
            <select
              value={newRequirement.type}
              onChange={(e) =>
                setNewRequirement((p) => ({
                  ...p,
                  type: e.target.value as RegulationType,
                }))
              }
              className='w-full border rounded p-2 mt-1'
            >
              {Object.entries(regulationTypeLabels).map(
                ([key, { key: tKey }]) => (
                  <option key={key} value={key as RegulationType}>
                    {t(tKey as any)}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium'>
              {t('authority')}
            </label>
            <input
              type='text'
              value={newRequirement.submissionAuthority || ''}
              onChange={(e) =>
                setNewRequirement((p) => ({
                  ...p,
                  submissionAuthority: e.target.value,
                }))
              }
              className='w-full border rounded p-2 mt-1'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium'>{t('deadline')}</label>
            <input
              type='date'
              value={
                newRequirement.submissionDeadline
                  ? new Date(newRequirement.submissionDeadline)
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setNewRequirement((p) => ({
                  ...p,
                  submissionDeadline: new Date(e.target.value),
                }))
              }
              className='w-full border rounded p-2 mt-1'
            />
          </div>
          <div className='flex justify-end gap-2 mt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border rounded hover:bg-gray-50'
            >
              {t('cancel')}
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            >
              {t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequirementModal;
