import React, { useState, useEffect, useMemo } from 'react';
import { 
  Manual, 
  ManualCategory, 
  ManualTargetAudience
} from '../../types';
import { 
  Role,
  Language 
} from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { useSessionContext } from '../../contexts/SessionContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { usePermissions } from '../../hooks/usePermissions';

export const ManualManagement: React.FC = () => {
  const { currentUser, isFacilityStaff, isJapanese } = useSessionContext();
  const { manuals } = useQmsContext();
  const { hasPermission } = usePermissions();

  const [selectedCategory, setSelectedCategory] = useState<ManualCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);

  const canReadManuals = hasPermission('manuals', 'read');

  const visibleManuals = useMemo(() => {
    if (!currentUser) return [];
    return manuals.filter(manual => {
      if (!manual.isPublished && !isFacilityStaff) return false;
      switch (manual.targetAudience) {
        case ManualTargetAudience.AllUsers:
          return true;
        case ManualTargetAudience.Tenants:
          return currentUser.roleCategory === 'TENANT' || isFacilityStaff;
        case ManualTargetAudience.FacilityStaff:
          return isFacilityStaff;
        case ManualTargetAudience.SpecificRoles:
          return manual.specificRoles?.includes(currentUser.role) || isFacilityStaff;
        default:
          return isFacilityStaff;
      }
    });
  }, [manuals, currentUser, isFacilityStaff]);

  const filteredManuals = useMemo(() => {
    return visibleManuals.filter(manual => {
      const categoryMatch = selectedCategory === 'ALL' || manual.category === selectedCategory;
      const searchMatch = searchTerm === '' ||
        (isJapanese ? manual.titleJP : manual.titleEN).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (isJapanese ? manual.descriptionJP : manual.descriptionEN).toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    }).sort((a, b) => (isJapanese ? a.titleJP.localeCompare(b.titleJP) : a.titleEN.localeCompare(b.titleEN)));
  }, [visibleManuals, selectedCategory, searchTerm, isJapanese]);
  
  useEffect(() => {
    if (filteredManuals.length > 0 && !selectedManual) {
        setSelectedManual(filteredManuals[0]);
    } else if (selectedManual && !filteredManuals.find(m => m.id === selectedManual.id)) {
        setSelectedManual(filteredManuals.length > 0 ? filteredManuals[0] : null);
    }
  }, [filteredManuals, selectedManual]);


  if (!canReadManuals) {
    return <div>{isJapanese ? 'アクセス権がありません。' : 'Permission Denied.'}</div>;
  }
  
  const categoryLabels: Record<ManualCategory, { jp: string, en: string }> = {
    [ManualCategory.GettingStarted]: { jp: 'はじめに', en: 'Getting Started' },
    [ManualCategory.EquipmentOperation]: { jp: '機器操作', en: 'Equipment Operation' },
    [ManualCategory.SafetyProcedures]: { jp: '安全手順', en: 'Safety Procedures' },
    [ManualCategory.EmergencyResponse]: { jp: '緊急時対応', en: 'Emergency Response' },
    [ManualCategory.Compliance]: { jp: 'コンプライアンス', en: 'Compliance' },
    [ManualCategory.DataManagement]: { jp: 'データ管理', en: 'Data Management' },
    [ManualCategory.Maintenance]: { jp: 'メンテナンス', en: 'Maintenance' },
    [ManualCategory.TenantGuide]: { jp: 'テナントガイド', en: 'Tenant Guide' },
    [ManualCategory.FacilityStaffGuide]: { jp: '施設スタッフガイド', en: 'Facility Staff Guide' },
    [ManualCategory.FAQ]: { jp: 'FAQ', en: 'FAQ' },
    [ManualCategory.Other]: { jp: 'その他', en: 'Other' },
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-ever-black">{isJapanese ? 'マニュアル' : 'Manuals'}</h2>
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]">
        {/* Left Panel */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md flex flex-col">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder={isJapanese ? "検索..." : "Search..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border rounded-md p-2 text-sm mb-2"
            />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as ManualCategory | 'ALL')}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="ALL">{isJapanese ? '全カテゴリ' : 'All Categories'}</option>
              {Object.entries(categoryLabels).map(([key, labels]) => (
                <option key={key} value={key as ManualCategory}>{isJapanese ? labels.jp : labels.en}</option>
              ))}
            </select>
          </div>
          <div className="overflow-y-auto">
            {filteredManuals.map(manual => (
              <div
                key={manual.id}
                onClick={() => setSelectedManual(manual)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedManual?.id === manual.id ? 'bg-ever-blue-light' : ''}`}
              >
                <h4 className="font-semibold truncate">{isJapanese ? manual.titleJP : manual.titleEN}</h4>
                <p className="text-sm text-gray-500">{isJapanese ? categoryLabels[manual.category].jp : categoryLabels[manual.category].en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md overflow-y-auto">
          {selectedManual ? (
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{isJapanese ? selectedManual.titleJP : selectedManual.titleEN}</h3>
              <p className="text-sm text-gray-500 mb-4">{isJapanese ? '最終更新日:' : 'Last Updated:'} {new Date(selectedManual.updatedAt).toLocaleDateString()}</p>
              <div className="prose max-w-none">
                <MarkdownRenderer markdown={isJapanese ? selectedManual.contentJP : selectedManual.contentEN} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>{isJapanese ? 'マニュアルを選択してください。' : 'Please select a manual.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualManagement;
