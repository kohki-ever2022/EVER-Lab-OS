import React, { useState, useMemo } from 'react';
import {
  LabRule,
  LabRuleCategory,
  RuleImportance,
  ManualTargetAudience,
} from '../../types';
import { Role } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { useSessionContext } from '../../contexts/SessionContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { useToast } from '../../contexts/ToastContext';
import { useComplianceActions } from '../../hooks/useComplianceActions';
import { CaretDownIcon } from '../common/Icons';
import { useTranslation } from '../../hooks/useTranslation';

const LabRuleManagement: React.FC = () => {
  const { currentUser, isFacilityStaff } = useSessionContext();
  const { t, isJapanese } = useTranslation();
  const { labRules } = useQmsContext();
  const { showToast } = useToast();
  const { acknowledgeRule } = useComplianceActions();

  const [categoryFilter, setCategoryFilter] = useState<LabRuleCategory | 'ALL'>(
    'ALL'
  );
  const [importanceFilter, setImportanceFilter] = useState<
    RuleImportance | 'ALL'
  >('ALL');
  const [showUnacknowledgedOnly, setShowUnacknowledgedOnly] = useState(false);
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  const categoryLabels = {
    [LabRuleCategory.GeneralConduct]: {
      jp: '一般的な行動規範',
      en: 'General Conduct',
    },
    [LabRuleCategory.SafetyRules]: { jp: '安全規則', en: 'Safety Rules' },
    [LabRuleCategory.EquipmentUsage]: {
      jp: '機器使用ルール',
      en: 'Equipment Usage',
    },
    [LabRuleCategory.ChemicalHandling]: {
      jp: '薬品取り扱い',
      en: 'Chemical Handling',
    },
    [LabRuleCategory.WasteDisposal]: { jp: '廃棄物処理', en: 'Waste Disposal' },
    [LabRuleCategory.AccessControl]: { jp: '入退室管理', en: 'Access Control' },
    [LabRuleCategory.DataSecurity]: {
      jp: 'データセキュリティ',
      en: 'Data Security',
    },
    [LabRuleCategory.Cleanliness]: { jp: '清潔維持', en: 'Cleanliness' },
    [LabRuleCategory.Parking]: { jp: '駐車場利用', en: 'Parking' },
    [LabRuleCategory.CommonArea]: { jp: '共用エリア', en: 'Common Area' },
    [LabRuleCategory.Other]: { jp: 'その他', en: 'Other' },
  };

  const importanceLabels = {
    [RuleImportance.Mandatory]: {
      key: 'importanceMandatory',
      color: 'bg-red-100 text-red-800',
    },
    [RuleImportance.Recommended]: {
      key: 'importanceRecommended',
      color: 'bg-yellow-100 text-yellow-800',
    },
    [RuleImportance.Optional]: {
      key: 'importanceOptional',
      color: 'bg-blue-100 text-blue-800',
    },
  } as const;

  const visibleRules = useMemo(() => {
    if (!currentUser) return [];
    return labRules.filter((rule) => {
      switch (rule.targetAudience) {
        case ManualTargetAudience.AllUsers:
          return true;
        case ManualTargetAudience.Tenants:
          return currentUser.roleCategory === 'TENANT';
        case ManualTargetAudience.FacilityStaff:
          return currentUser.roleCategory === 'FACILITY';
        case ManualTargetAudience.SpecificRoles:
          return rule.specificRoles?.includes(currentUser.role) ?? false;
        default:
          return isFacilityStaff; // Admins see all by default
      }
    });
  }, [labRules, currentUser, isFacilityStaff]);

  const unacknowledgedRules = useMemo(
    () =>
      visibleRules.filter(
        (rule) =>
          rule.importance === RuleImportance.Mandatory &&
          !rule.acknowledgedBy.some((ack) => ack.userId === currentUser?.id)
      ),
    [visibleRules, currentUser]
  );

  const filteredRules = useMemo(() => {
    return visibleRules
      .filter((rule) => {
        if (categoryFilter !== 'ALL' && rule.category !== categoryFilter)
          return false;
        if (importanceFilter !== 'ALL' && rule.importance !== importanceFilter)
          return false;
        if (
          showUnacknowledgedOnly &&
          !unacknowledgedRules.some((unacked) => unacked.id === rule.id)
        )
          return false;
        return true;
      })
      .sort((a, b) => a.ruleNumber.localeCompare(b.ruleNumber));
  }, [
    visibleRules,
    categoryFilter,
    importanceFilter,
    showUnacknowledgedOnly,
    unacknowledgedRules,
  ]);

  const handleAcknowledge = async (ruleId: string) => {
    const result = await acknowledgeRule(ruleId);
    if (result.success === false) {
      showToast(`${t('ackFailed')}: ${result.error.message}`, 'error');
    }
  };

  const toggleExpand = (ruleId: string) => {
    setExpandedRuleId((prev) => (prev === ruleId ? null : ruleId));
  };

  if (!currentUser) return null;

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-4'>{t('labRules')}</h2>

      {unacknowledgedRules.length > 0 && (
        <div
          className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6'
          role='alert'
        >
          <p className='font-bold'>{t('unacknowledgedMandatory')}</p>
          <p>{`${unacknowledgedRules.length}${t('unacknowledgedCount')}`}</p>
        </div>
      )}

      <div className='bg-white p-4 rounded-lg shadow mb-6 space-y-4'>
        <div className='flex flex-wrap gap-4 items-center'>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className='border rounded p-2 text-sm'
          >
            <option value='ALL'>{t('allCategories')}</option>
            {Object.entries(categoryLabels).map(([key, val]) => (
              <option key={key} value={key}>
                {isJapanese ? val.jp : val.en}
              </option>
            ))}
          </select>
          <select
            value={importanceFilter}
            onChange={(e) => setImportanceFilter(e.target.value as any)}
            className='border rounded p-2 text-sm'
          >
            <option value='ALL'>{t('allImportances')}</option>
            {Object.entries(importanceLabels).map(([key, val]) => (
              <option key={key} value={key as RuleImportance}>
                {t(val.key)}
              </option>
            ))}
          </select>
          <label className='flex items-center text-sm'>
            <input
              type='checkbox'
              checked={showUnacknowledgedOnly}
              onChange={(e) => setShowUnacknowledgedOnly(e.target.checked)}
              className='h-4 w-4 mr-2'
            />
            {t('showUnacknowledgedOnly')}
          </label>
        </div>
      </div>

      <div className='space-y-2'>
        {filteredRules.map((rule) => {
          const isAcknowledged = rule.acknowledgedBy.some(
            (ack) => ack.userId === currentUser.id
          );
          const isMandatoryUnacked =
            rule.importance === RuleImportance.Mandatory && !isAcknowledged;
          const importance = importanceLabels[rule.importance];

          return (
            <div key={rule.id} className='border rounded-lg overflow-hidden'>
              <button
                onClick={() => toggleExpand(rule.id)}
                className='w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100'
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    {isMandatoryUnacked && (
                      <span className='text-red-500' title={t('ackRequired')}>
                        ●
                      </span>
                    )}
                    <span className='font-bold'>
                      {rule.ruleNumber}:{' '}
                      {isJapanese ? rule.titleJP : rule.titleEN}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {isJapanese ? rule.descriptionJP : rule.descriptionEN}
                  </p>
                </div>
                <div className='flex items-center gap-4 ml-4'>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${importance.color}`}
                  >
                    {t(importance.key)}
                  </span>
                  <CaretDownIcon
                    className={
                      expandedRuleId === rule.id ? 'transform rotate-180' : ''
                    }
                  />
                </div>
              </button>
              {expandedRuleId === rule.id && (
                <div className='p-4 bg-white'>
                  <div className='prose max-w-none'>
                    <MarkdownRenderer
                      markdown={
                        isJapanese ? (rule.details ?? '') : (rule.details ?? '')
                      }
                    />
                  </div>
                  {rule.importance === RuleImportance.Mandatory && (
                    <div className='mt-4 pt-4 border-t'>
                      {isAcknowledged ? (
                        <div className='text-green-600 font-medium text-sm'>
                          {t('acknowledged')}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(rule.id)}
                          className='bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700'
                        >
                          {t('acknowledgeRule')}
                        </button>
                      )}
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

export default LabRuleManagement;
