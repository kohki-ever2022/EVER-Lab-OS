import React, { useState, useEffect } from 'react';
import { 
  RegulationType, 
  SubmissionStatus, 
  RegulatoryRequirement,
  SupportStaffType,
  RegulatorySupport,
} from '../../types';
import { Role } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { usePermissions } from '../../hooks/usePermissions';
import { useToast } from '../../contexts/ToastContext';
import { useComplianceActions } from '../../hooks/useComplianceActions';
import { useTranslation } from '../../hooks/useTranslation';

export const RegulatoryCompliance: React.FC = () => {
  const { currentUser, isFacilityStaff } = useSessionContext();
  const { regulatoryRequirements } = useQmsContext();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const { addRegulatoryRequirement } = useComplianceActions();
  const { t, isJapanese } = useTranslation();
  
  const [requirements, setRequirements] = useState<RegulatoryRequirement[]>(regulatoryRequirements || []);
  const [selectedType, setSelectedType] = useState<RegulationType | 'ALL'>('ALL');
  const [showSupportPanel, setShowSupportPanel] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequirement, setNewRequirement] = useState<Partial<Omit<RegulatoryRequirement, 'id'>>>({});

  useEffect(() => {
    setRequirements(regulatoryRequirements);
  }, [regulatoryRequirements]);

  const canManageSupport = isFacilityStaff || hasPermission('regulatory', 'manage');

  const regulationTypeLabels = {
    [RegulationType.PharmaceuticalLaw]: { key: 'regTypePharma' },
    [RegulationType.CartegenaLaw]: { key: 'regTypeCartegena' },
    [RegulationType.SafetyHealthLaw]: { key: 'regTypeSafetyHealth' },
    [RegulationType.FireServiceLaw]: { key: 'regTypeFireService' },
    [RegulationType.PoisonControlLaw]: { key: 'regTypePoisonControl' },
    [RegulationType.Other]: { key: 'categoryOther' }
  };

  const statusConfig = {
    [SubmissionStatus.NotRequired]: { key: 'statusNotRequired', color: 'bg-gray-200 text-gray-700' },
    [SubmissionStatus.Required]: { key: 'statusRequired', color: 'bg-red-100 text-red-700' },
    [SubmissionStatus.Preparing]: { key: 'statusPreparing', color: 'bg-yellow-100 text-yellow-700' },
    [SubmissionStatus.Submitted]: { key: 'statusSubmitted', color: 'bg-blue-100 text-blue-700' },
    [SubmissionStatus.Approved]: { key: 'statusApproved', color: 'bg-green-100 text-green-700' },
    // FIX: Use a more specific translation key 'submissionStatusRejected' to avoid conflicts.
    [SubmissionStatus.Rejected]: { key: 'submissionStatusRejected', color: 'bg-red-200 text-red-800' },
    [SubmissionStatus.Expired]: { key: 'expired', color: 'bg-gray-300 text-gray-800' }
  };

  const handleOpenModal = () => {
    setNewRequirement({
      tenantId: currentUser?.companyId,
      type: RegulationType.Other,
      submissionStatus: SubmissionStatus.Required,
    });
    setIsModalOpen(true);
  };
  
  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequirement.requirementNameJP || !newRequirement.requirementNameEN || !newRequirement.submissionAuthority) {
        showToast(t('requiredFields'), 'error');
        return;
    }
    const result = await addRegulatoryRequirement(newRequirement as any);
    if (result.success === false) {
        showToast(t('addRequirementFailed'), 'error');
    } else {
        showToast(t('addRequirementSuccess'), 'success');
        setIsModalOpen(false);
    }
  };

  const filteredRequirements = requirements.filter(req => 
    (isFacilityStaff || req.tenantId === currentUser?.companyId) &&
    (selectedType === 'ALL' || req.type === selectedType)
  );

  const getDeadlineWarning = (deadline?: Date) => {
    if (!deadline) return null;
    
    const daysUntilDeadline = Math.floor(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDeadline < 0) {
      return { text: t('overdue'), color: 'text-red-600' };
    } else if (daysUntilDeadline <= 7) {
      return { text: `${t('daysLeft')}${daysUntilDeadline}${t('daysLeftSuffix')}`, color: 'text-orange-600' };
    } else if (daysUntilDeadline <= 30) {
      return { text: `${t('daysLeft')}${daysUntilDeadline}${t('daysLeftSuffix')}`, color: 'text-yellow-600' };
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {t('regComplianceManagement')}
        </h2>
        
        <div className="flex gap-2">
            {canManageSupport && (
              <button
                onClick={() => setShowSupportPanel(!showSupportPanel)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                {t('supportInfo')}
              </button>
            )}
            <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {t('newRequirement')}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium">{t('statusRequired')}</div>
          <div className="text-2xl font-bold text-red-700">{filteredRequirements.filter(r => r.submissionStatus === SubmissionStatus.Required).length}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">{t('statusPreparing')}</div>
          <div className="text-2xl font-bold text-yellow-700">{filteredRequirements.filter(r => r.submissionStatus === SubmissionStatus.Preparing).length}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">{t('statusSubmitted')}</div>
          <div className="text-2xl font-bold text-blue-700">{filteredRequirements.filter(r => r.submissionStatus === SubmissionStatus.Submitted).length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">{t('statusApproved')}</div>
          <div className="text-2xl font-bold text-green-700">{filteredRequirements.filter(r => r.submissionStatus === SubmissionStatus.Approved).length}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium mb-2">{t('filterByRegulation')}</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as RegulationType | 'ALL')}
          className="w-full border rounded p-2"
        >
          <option value="ALL">{t('all')}</option>
          {Object.entries(regulationTypeLabels).map(([key, {key: tKey}]) => (
            <option key={key} value={key as RegulationType}>{t(tKey as any)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('regulation')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('requirementName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('authority')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('deadline')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequirements.map(req => {
              const deadlineWarning = getDeadlineWarning(req.submissionDeadline);
              const status = statusConfig[req.submissionStatus];
              
              return (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{t(regulationTypeLabels[req.type].key as any)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium">{isJapanese ? req.requirementNameJP : req.requirementNameEN}</div>
                    <div className="text-gray-500 text-xs mt-1">{isJapanese ? req.descriptionJP : req.descriptionEN}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{req.submissionAuthority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {req.submissionDeadline ? (
                      <>
                        <div>{new Date(req.submissionDeadline).toLocaleDateString()}</div>
                        {deadlineWarning && (<div className={`text-xs mt-1 font-medium ${deadlineWarning.color}`}>{deadlineWarning.text}</div>)}
                      </>
                    ) : (<span className="text-gray-400">-</span>)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${status.color}`}>{t(status.key as any)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">{t('details')}</button>
                    {req.documentUrl && (<a href={req.documentUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">{t('document')}</a>)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">{t('newRequirement')}</h3>
            <form onSubmit={handleAddRequirement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">{t('requirementNameJP')}</label>
                <input type="text" value={newRequirement.requirementNameJP || ''} onChange={e => setNewRequirement(p => ({...p, requirementNameJP: e.target.value}))} className="w-full border rounded p-2 mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium">{t('requirementNameEN')}</label>
                <input type="text" value={newRequirement.requirementNameEN || ''} onChange={e => setNewRequirement(p => ({...p, requirementNameEN: e.target.value}))} className="w-full border rounded p-2 mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium">{t('authority')}</label>
                <input type="text" value={newRequirement.submissionAuthority || ''} onChange={e => setNewRequirement(p => ({...p, submissionAuthority: e.target.value}))} className="w-full border rounded p-2 mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium">{t('deadline')}</label>
                <input type="date" value={newRequirement.submissionDeadline ? new Date(newRequirement.submissionDeadline).toISOString().split('T')[0] : ''} onChange={e => setNewRequirement(p => ({...p, submissionDeadline: new Date(e.target.value)}))} className="w-full border rounded p-2 mt-1" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t('add')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {canManageSupport && showSupportPanel && (
        <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold mb-4">{t('supportStaffInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-bold text-blue-700 mb-3">{t('socialInsuranceLaborConsultant')}</h4>
              <ul className="space-y-2 text-sm">
                <li>• {t('regTypeSafetyHealth')}</li>
                <li>• {t('laborStandardsAct')}</li>
                <li>• {t('socialInsuranceProcedures')}</li>
                <li>• {t('employmentRegulations')}</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-bold text-green-700 mb-3">{t('administrativeScrivener')}</h4>
              <ul className="space-y-2 text-sm">
                <li>• {t('regTypePharma')}</li>
                <li>• {t('regTypeCartegena')}</li>
                <li>• {t('regTypePoisonControl')}</li>
                <li>• {t('licenseApplications')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
        <p className="text-sm text-yellow-800">{t('regDisclaimer')}</p>
      </div>
    </div>
  );
};