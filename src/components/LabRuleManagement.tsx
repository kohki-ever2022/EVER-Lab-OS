import React, { useState, useMemo } from 'react';
import { LabRule, LabRuleCategory, RuleImportance, ManualTargetAudience } from '../types/qms';
import { Role } from '../types/core';
import MarkdownRenderer from './common/MarkdownRenderer';
import { useSessionContext } from '../contexts/SessionContext';
import { useQmsContext } from '../contexts/AppProviders';
import { useToast } from '../contexts/ToastContext';
import { useComplianceActions } from '../hooks/useComplianceActions';

export const LabRuleManagement: React.FC = () => {
  const { currentUser, isFacilityStaff, isJapanese } = useSessionContext();
  const { labRules } = useQmsContext();
  const { showToast } = useToast();
  const { acknowledgeRule } = useComplianceActions();

  const [categoryFilter, setCategoryFilter] = useState<LabRuleCategory | 'ALL'>('ALL');
  const [importanceFilter, setImportanceFilter] = useState<RuleImportance | 'ALL'>('ALL');
  const [showUnacknowledgedOnly, setShowUnacknowledgedOnly] = useState(false);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  const categoryLabels = {
    [LabRuleCategory.GeneralConduct]: { jp: '一般的な行動規範', en: 'General Conduct' },
    [LabRuleCategory.SafetyRules]: { jp: '安全規則', en: 'Safety Rules' },
    [LabRuleCategory.EquipmentUsage]: { jp: '機器使用ルール', en: 'Equipment Usage' },
    [LabRuleCategory.ChemicalHandling]: { jp: '薬品取り扱い', en: 'Chemical Handling' },
    [LabRuleCategory.WasteDisposal]: { jp: '廃棄物処理', en: 'Waste Disposal' },
    [LabRuleCategory.AccessControl]: { jp: '入退室管理', en: 'Access Control' },
    [LabRuleCategory.DataSecurity]: { jp: 'データセキュリティ', en: 'Data Security' },
    [LabRuleCategory.Cleanliness]: { jp: '清潔維持', en: 'Cleanliness' },
    [LabRuleCategory.Parking]: { jp: '駐車場利用', en: 'Parking' },
    [LabRuleCategory.CommonArea]: { jp: '共用エリア', en: 'Common Area' },
    [LabRuleCategory.Other]: { jp: 'その他', en: 'Other' },
  };

  const importanceLabels = {
    [RuleImportance.Mandatory]: { jp: '必須遵守', en: 'Mandatory', color: 'bg-red-100 text-red-800' },
    [RuleImportance.Recommended]: { jp: '推奨', en: 'Recommended', color: 'bg-yellow-100 text-yellow-800' },
    [RuleImportance.Optional]: { jp: '任意', en: 'Optional', color: 'bg-blue-100 text-blue-800' },
  };

  const visibleRules = useMemo(() => {
    if (!currentUser) return [];
    return labRules.filter(rule => {
      switch (rule.targetAudience) {
        case ManualTargetAudience.AllUsers: return true;
        case ManualTargetAudience.Tenants: return currentUser.roleCategory === 'TENANT';
        case ManualTargetAudience.FacilityStaff: return currentUser.roleCategory === 'FACILITY';
        case ManualTargetAudience.SpecificRoles: return rule.specificRoles?.includes(currentUser.role) ?? false;
        default: return isFacilityStaff; // Admins see all by default
      }
    });
  }, [labRules, currentUser, isFacilityStaff]);

  const unacknowledgedRules = useMemo(() => 
    visibleRules.filter(rule => 
      rule.importance === RuleImportance.Mandatory &&
      !rule.acknowledgedBy.some(ack => ack.userId === currentUser?.id)
    ), [visibleRules, currentUser]);

  const filteredRules = useMemo(() => {
    return visibleRules.filter(rule => {
      if (categoryFilter !== 'ALL' && rule.category !== categoryFilter) return false;
      if (importanceFilter !== 'ALL' && rule.importance !== importanceFilter) return false;
      if (showUnacknowledgedOnly && !unacknowledgedRules.some(unacked => unacked.id === rule.id)) return false;
      return true;
    }).sort((a, b) => a.ruleNumber.localeCompare(b.ruleNumber));
  }, [visibleRules, categoryFilter, importanceFilter, showUnacknowledgedOnly, unacknowledgedRules]);
  
  const handleAcknowledge = async (ruleId: string) => {
      const result = await acknowledgeRule(ruleId);
      if (result.success === false) {
          showToast(isJapanese ? `確認に失敗しました: ${result.error.message}` : `Acknowledgement failed: ${result.error.message}`, 'error');
      }
  };
  
  const toggleExpand = (ruleId: string) => {
    setExpandedRuleId(prev => (prev === ruleId ? null : ruleId));
  };
  
  if (!currentUser) return null;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{isJapanese ? 'ラボルール' : 'Lab Rules'}</h2>

      {unacknowledgedRules.length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">{isJapanese ? '未確認の必須ルールがあります' : 'Unacknowledged Mandatory Rules'}</p>
          <p>{isJapanese ? `${unacknowledgedRules.length}件の必須ルールを確認してください。` : `You have ${unacknowledgedRules.length} mandatory rules to acknowledge.`}</p>
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as any)} className="border rounded p-2 text-sm">
            <option value="ALL">{isJapanese ? '全カテゴリ' : 'All Categories'}</option>
            {Object.entries(categoryLabels).map(([key, val]) => <option key={key} value={key}>{isJapanese ? val.jp : val.en}</option>)}
          </select>
          <select value={importanceFilter} onChange={e => setImportanceFilter(e.target.value as any)} className="border rounded p-2 text-sm">
            <option value="ALL">{isJapanese ? '全重要度' : 'All Importances'}</option>
            {Object.entries(importanceLabels).map(([key, val]) => <option key={key} value={key}>{isJapanese ? val.jp : val.en}</option>)}
          </select>
          <label className="flex items-center text-sm">
            <input type="checkbox" checked={showUnacknowledgedOnly} onChange={e => setShowUnacknowledgedOnly(e.target.checked)} className="h-4 w-4 mr-2" />
            {isJapanese ? '未確認のみ表示' : 'Show unacknowledged only'}
          </label>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRules.map(rule => {
            const isAcknowledged = rule.acknowledgedBy.some(ack => ack.userId === currentUser.id);
            const isMandatoryUnacked = rule.importance === RuleImportance.Mandatory && !isAcknowledged;
            const importance = importanceLabels[rule.importance];

            return (
                <div key={rule.id} className="border rounded-lg overflow-hidden">
                    <button onClick={() => toggleExpand(rule.id)} className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                {isMandatoryUnacked && <span className="text-red-500" title={isJapanese ? "確認が必要です" : "Acknowledgement required"}>●</span>}
                                <span className="font-bold">{rule.ruleNumber}: {isJapanese ? rule.titleJP : rule.titleEN}</span>
                            </div>
                            <p className="text-sm text-gray-600">{isJapanese ? rule.descriptionJP : rule.descriptionEN}</p>
                        </div>
                        <div className="ml-4 flex items-center gap-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${importance.color}`}>{isJapanese ? importance.jp : importance.en}</span>
                            <svg className={`w-5 h-5 transition-transform ${expandedRuleId === rule.id ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        </div>
                    </button>
                    {expandedRuleId === rule.id && (
                        <div className="p-4 bg-white border-t">
                            <div className="prose max-w-none">
                                <MarkdownRenderer markdown={isJapanese ? rule.detailsJP || '' : rule.detailsEN || ''} />
                            </div>
                            {isMandatoryUnacked && (
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <button onClick={() => handleAcknowledge(rule.id)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                                        {isJapanese ? 'ルールを読み、遵守することに同意します' : 'I have read and agree to comply'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};