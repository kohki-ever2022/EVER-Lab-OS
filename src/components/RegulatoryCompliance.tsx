import React, { useState, useEffect } from 'react';
import { 
  RegulationType, 
  SubmissionStatus, 
  RegulatoryRequirement,
  SupportStaffType,
  RegulatorySupport,
} from '@/types';
import { Role } from '@/types';
import { useSessionContext } from '@/contexts/SessionContext';
import { useQmsContext } from '@/contexts/AppProviders';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/contexts/ToastContext';
import { useComplianceActions } from '@/hooks/useComplianceActions';

export const RegulatoryCompliance: React.FC = () => {
  const { currentUser, isFacilityStaff, isJapanese } = useSessionContext();
  const { regulatoryRequirements } = useQmsContext();
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const { addRegulatoryRequirement } = useComplianceActions();
  
  const [requirements, setRequirements] = useState<RegulatoryRequirement[]>(regulatoryRequirements || []);
  const [selectedType, setSelectedType] = useState<RegulationType | 'ALL'>('ALL');
  const [showSupportPanel, setShowSupportPanel] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequirement, setNewRequirement] = useState<Partial<Omit<RegulatoryRequirement, 'id'>>>({});

  useEffect(() => {
    setRequirements(regulatoryRequirements);
  }, [regulatoryRequirements]);

  // 権限チェック
  const canManageSupport = isFacilityStaff || hasPermission('regulatory', 'manage');

  // 法規制タイプのラベル
  const regulationTypeLabels = {
    [RegulationType.PharmaceuticalLaw]: { jp: '薬機法', en: 'Pharmaceutical Affairs Law' },
    [RegulationType.CartegenaLaw]: { jp: 'カルタヘナ法', en: 'Cartagena Protocol' },
    [RegulationType.SafetyHealthLaw]: { jp: '労働安全衛生法', en: 'Industrial Safety and Health Act' },
    [RegulationType.FireServiceLaw]: { jp: '消防法', en: 'Fire Service Act' },
    [RegulationType.PoisonControlLaw]: { jp: '毒物及び劇物取締法', en: 'Poisonous and Deleterious Substances Control Law' },
    [RegulationType.Other]: { jp: 'その他', en: 'Other' }
  };

  // ステータスのラベルと色
  const statusConfig = {
    [SubmissionStatus.NotRequired]: { 
      labelJP: '不要', 
      labelEN: 'Not Required', 
      color: 'bg-gray-200 text-gray-700' 
    },
    [SubmissionStatus.Required]: { 
      labelJP: '提出必要', 
      labelEN: 'Required', 
      color: 'bg-red-100 text-red-700' 
    },
    [SubmissionStatus.Preparing]: { 
      labelJP: '準備中', 
      labelEN: 'Preparing', 
      color: 'bg-yellow-100 text-yellow-700' 
    },
    [SubmissionStatus.Submitted]: { 
      labelJP: '提出済み', 
      labelEN: 'Submitted', 
      color: 'bg-blue-100 text-blue-700' 
    },
    [SubmissionStatus.Approved]: { 
      labelJP: '承認済み', 
      labelEN: 'Approved', 
      color: 'bg-green-100 text-green-700' 
    },
    [SubmissionStatus.Rejected]: { 
      labelJP: '却下', 
      labelEN: 'Rejected', 
      color: 'bg-red-200 text-red-800' 
    },
    [SubmissionStatus.Expired]: { 
      labelJP: '期限切れ', 
      labelEN: 'Expired', 
      color: 'bg-gray-300 text-gray-800' 
    }
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
        showToast(isJapanese ? '必須項目を入力してください。' : 'Please fill in required fields.', 'error');
        return;
    }
    const result = await addRegulatoryRequirement(newRequirement as any);
    if (result.success === false) {
        showToast(isJapanese ? '要件の追加に失敗しました。' : 'Failed to add requirement.', 'error');
    } else {
        showToast(isJapanese ? '新しい法規制要件を追加しました。' : 'Added new regulatory requirement.', 'success');
        setIsModalOpen(false);
    }
  };

  // フィルタリングされた要件
  const filteredRequirements = requirements.filter(req => 
    (isFacilityStaff || req.tenantId === currentUser?.companyId) &&
    (selectedType === 'ALL' || req.type === selectedType)
  );

  // 期限が近い要件の警告
  const getDeadlineWarning = (deadline?: Date) => {
    if (!deadline) return null;
    
    const daysUntilDeadline = Math.floor(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDeadline < 0) {
      return { text: isJapanese ? '期限超過' : 'Overdue', color: 'text-red-600' };
    } else if (daysUntilDeadline <= 7) {
      return { text: isJapanese ? `あと${daysUntilDeadline}日` : `${daysUntilDeadline} days left`, color: 'text-orange-600' };
    } else if (daysUntilDeadline <= 30) {
      return { text: isJapanese ? `あと${daysUntilDeadline}日` : `${daysUntilDeadline} days left`, color: 'text-yellow-600' };
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isJapanese ? '法規制・コンプライアンス管理' : 'Regulatory Compliance Management'}
        </h2>
        
        <div className="flex gap-2">
            {canManageSupport && (
              <button
                onClick={() => setShowSupportPanel(!showSupportPanel)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                {isJapanese ? 'サポート情報' : 'Support Info'}
              </button>
            )}
            <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {isJapanese ? '新規要件追加' : 'New Requirement'}
            </button>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium">
            {isJapanese ? '提出必要' : 'Required'}
          </div>
          <div className="text-2xl font-bold text-red-700">
            {filteredRequirements.filter(r => r.submissionStatus === SubmissionStatus.Required).length}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">
            {isJapanese ? '準備中' : 'Preparing'}
          </div>
          <div className="text-2xl font-bold text-yellow-700">
            {filteredRequirements.filter(r => r.submissionStatus === SubmissionStatus.Preparing).length}
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">
            {isJapanese ? '提出済み' : 'Submitted'}
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {filteredRequirements.filter(r => r.submissionStatus === SubmissionStatus.Submitted).length}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">
            {isJapanese ? '承認済み' : 'Approved'}
          </div>
          <div className="text-2xl font-bold text-green-700">
            {filteredRequirements.filter(r => r.submissionStatus === SubmissionStatus.Approved).length}
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium mb-2">
          {isJapanese ? '法規制タイプでフィルター' : 'Filter by Regulation Type'}
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as RegulationType | 'ALL')}
          className="w-full border rounded p-2"
        >
          <option value="ALL">{isJapanese ? 'すべて' : 'All'}</option>
          {Object.entries(regulationTypeLabels).map(([key, label]) => (
            <option key={key} value={key as RegulationType}>
              {isJapanese ? label.jp : label.en}
            </option>
          ))}
        </select>
      </div>

      {/* 要件一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isJapanese ? '法規制' : 'Regulation'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isJapanese ? '要件名' : 'Requirement'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isJapanese ? '提出先' : 'Authority'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isJapanese ? '期限' : 'Deadline'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isJapanese ? 'ステータス' : 'Status'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isJapanese ? '操作' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequirements.map(req => {
              const deadlineWarning = getDeadlineWarning(req.submissionDeadline);
              const status = statusConfig[req.submissionStatus];
              
              return (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isJapanese 
                      ? regulationTypeLabels[req.type].jp 
                      : regulationTypeLabels[req.type].en
                    }
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium">
                      {isJapanese ? req.requirementNameJP : req.requirementNameEN}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {isJapanese ? req.descriptionJP : req.descriptionEN}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {req.submissionAuthority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {req.submissionDeadline ? (
                      <>
                        <div>{new Date(req.submissionDeadline).toLocaleDateString()}</div>
                        {deadlineWarning && (
                          <div className={`text-xs mt-1 font-medium ${deadlineWarning.color}`}>
                            {deadlineWarning.text}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${status.color}`}>
                      {isJapanese ? status.labelJP : status.labelEN}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                      {isJapanese ? '詳細' : 'Details'}
                    </button>
                    {req.documentUrl && (
                      <a 
                        href={req.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        {isJapanese ? '書類' : 'Document'}
                      </a>
                    )}
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
            <h3 className="text-lg font-bold mb-4">{isJapanese ? '新規法規制要件の追加' : 'Add New Regulatory Requirement'}</h3>
            <form onSubmit={handleAddRequirement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">{isJapanese ? '要件名 (日本語)' : 'Requirement Name (JP)'}</label>
                <input type="text" value={newRequirement.requirementNameJP || ''} onChange={e => setNewRequirement(p => ({...p, requirementNameJP: e.target.value}))} className="w-full border rounded p-2 mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium">{isJapanese ? '要件名 (英語)' : 'Requirement Name (EN)'}</label>
                <input type="text" value={newRequirement.requirementNameEN || ''} onChange={e => setNewRequirement(p => ({...p, requirementNameEN: e.target.value}))} className="w-full border rounded p-2 mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium">{isJapanese ? '提出先' : 'Authority'}</label>
                <input type="text" value={newRequirement.submissionAuthority || ''} onChange={e => setNewRequirement(p => ({...p, submissionAuthority: e.target.value}))} className="w-full border rounded p-2 mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium">{isJapanese ? '提出期限' : 'Submission Deadline'}</label>
                <input type="date" value={newRequirement.submissionDeadline ? new Date(newRequirement.submissionDeadline).toISOString().split('T')[0] : ''} onChange={e => setNewRequirement(p => ({...p, submissionDeadline: new Date(e.target.value)}))} className="w-full border rounded p-2 mt-1" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">{isJapanese ? 'キャンセル' : 'Cancel'}</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{isJapanese ? '追加' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 社労士・行政書士向けサポート情報パネル */}
      {canManageSupport && showSupportPanel && (
        <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold mb-4">
            {isJapanese ? 'サポート担当者向け情報' : 'Support Staff Information'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 社労士向け */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-bold text-blue-700 mb-3">
                {isJapanese ? '社労士担当分野' : 'Social Insurance Labor Consultant'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>• {isJapanese ? '労働安全衛生法関連' : 'Industrial Safety and Health Act'}</li>
                <li>• {isJapanese ? '労働基準法関連' : 'Labor Standards Act'}</li>
                <li>• {isJapanese ? '社会保険手続き' : 'Social Insurance Procedures'}</li>
                <li>• {isJapanese ? '就業規則作成・届出' : 'Employment Regulations'}</li>
              </ul>
            </div>

            {/* 行政書士向け */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-bold text-green-700 mb-3">
                {isJapanese ? '行政書士担当分野' : 'Administrative Scrivener'}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>• {isJapanese ? '薬機法関連届出' : 'Pharmaceutical Affairs Law'}</li>
                <li>• {isJapanese ? 'カルタヘナ法届出' : 'Cartagena Protocol'}</li>
                <li>• {isJapanese ? '毒劇法関連' : 'Poison Control Law'}</li>
                <li>• {isJapanese ? '各種許認可申請' : 'Various License Applications'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
        <p className="text-sm text-yellow-800">
          {isJapanese 
            ? '※ 法規制要件は企業の事業内容により異なります。不明な点は施設管理者または専門家にご相談ください。'
            : '※ Regulatory requirements vary by business type. Please consult facility staff or specialists for clarification.'
          }
        </p>
      </div>
    </div>
  );
};