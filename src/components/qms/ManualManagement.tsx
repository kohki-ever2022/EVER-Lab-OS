import React, { useState, useEffect, useMemo } from 'react';
import { Manual, ManualCategory, ManualTargetAudience } from '../../types';
import { Role, Language } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { useSessionContext } from '../../contexts/SessionContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from '../../hooks/useTranslation';

const ManualManagement: React.FC = () => {
  const { currentUser, isFacilityStaff } = useSessionContext();
  const { t, isJapanese } = useTranslation();
  const { manuals } = useQmsContext();
  const { hasPermission } = usePermissions();

  const [selectedCategory, setSelectedCategory] = useState<
    ManualCategory | 'ALL'
  >('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);

  const canReadManuals = hasPermission('manuals', 'read');

  const visibleManuals = useMemo(() => {
    if (!currentUser) return [];
    return manuals.filter((manual) => {
      if (!manual.isPublished && !isFacilityStaff) return false;
      switch (manual.targetAudience) {
        case ManualTargetAudience.AllUsers:
          return true;
        case ManualTargetAudience.Tenants:
          return currentUser.roleCategory === 'TENANT' || isFacilityStaff;
        case ManualTargetAudience.FacilityStaff:
          return isFacilityStaff;
        case ManualTargetAudience.SpecificRoles:
          return (
            manual.specificRoles?.includes(currentUser.role) || isFacilityStaff
          );
        default:
          return isFacilityStaff;
      }
    });
  }, [manuals, currentUser, isFacilityStaff]);

  const filteredManuals = useMemo(() => {
    return visibleManuals
      .filter((manual) => {
        const categoryMatch =
          selectedCategory === 'ALL' || manual.category === selectedCategory;
        const searchMatch =
          searchTerm === '' ||
          (isJapanese ? manual.titleJP : manual.titleEN)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (isJapanese ? manual.descriptionJP : manual.descriptionEN)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
      })
      .sort((a, b) =>
        isJapanese
          ? a.titleJP.localeCompare(b.titleJP)
          : a.titleEN.localeCompare(b.titleEN)
      );
  }, [visibleManuals, selectedCategory, searchTerm, isJapanese]);

  useEffect(() => {
    if (filteredManuals.length > 0 && !selectedManual) {
      setSelectedManual(filteredManuals[0]);
    } else if (
      selectedManual &&
      !filteredManuals.find((m) => m.id === selectedManual.id)
    ) {
      setSelectedManual(filteredManuals.length > 0 ? filteredManuals[0] : null);
    }
  }, [filteredManuals, selectedManual]);

  if (!canReadManuals) {
    return <div>{t('permissionDenied')}</div>;
  }

  const categoryLabels = {
    [ManualCategory.GettingStarted]: { key: 'categoryGettingStarted' },
    [ManualCategory.EquipmentOperation]: { key: 'categoryEquipment' },
    [ManualCategory.SafetyProcedures]: { key: 'categorySafety' },
    [ManualCategory.EmergencyResponse]: { key: 'categoryEmergency' },
    [ManualCategory.Compliance]: { key: 'categoryCompliance' },
    [ManualCategory.DataManagement]: { key: 'categoryData' },
    [ManualCategory.Maintenance]: { key: 'categoryMaintenance' },
    [ManualCategory.TenantGuide]: { key: 'categoryTenant' },
    [ManualCategory.FacilityStaffGuide]: { key: 'categoryFacility' },
    [ManualCategory.FAQ]: { key: 'categoryFAQ' },
    [ManualCategory.Other]: { key: 'categoryOther' },
  };

  return (
    <div>
      <h2 className='text-3xl font-bold mb-6 text-ever-black'>
        {t('manuals')}
      </h2>
      <div className='flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]'>
        {/* Left Panel */}
        <div className='w-full md:w-1/3 bg-white rounded-lg shadow-md flex flex-col'>
          <div className='p-4 border-b'>
            <input
              type='text'
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full border rounded-md p-2 text-sm mb-2'
            />
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as ManualCategory | 'ALL')
              }
              className='w-full border rounded-md p-2 text-sm'
            >
              <option value='ALL'>{t('allCategories')}</option>
              {Object.entries(categoryLabels).map(([key, { key: tKey }]) => (
                <option key={key} value={key as ManualCategory}>
                  {t(tKey as any)}
                </option>
              ))}
            </select>
          </div>
          <div className='overflow-y-auto'>
            {filteredManuals.map((manual) => (
              <div
                key={manual.id}
                onClick={() => setSelectedManual(manual)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedManual?.id === manual.id ? 'bg-ever-blue-light' : ''}`}
              >
                <h4 className='font-semibold truncate'>
                  {isJapanese ? manual.titleJP : manual.titleEN}
                </h4>
                <p className='text-sm text-gray-500'>
                  {t(categoryLabels[manual.category].key as any)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className='w-full md:w-2/3 bg-white rounded-lg shadow-md overflow-y-auto'>
          {selectedManual ? (
            <div className='p-6'>
              <h3 className='text-2xl font-bold mb-2'>
                {isJapanese ? selectedManual.titleJP : selectedManual.titleEN}
              </h3>
              <p className='text-sm text-gray-500 mb-4'>
                {t('lastUpdated')}{' '}
                {new Date(selectedManual.updatedAt).toLocaleDateString()}
              </p>
              <div className='prose max-w-none'>
                <MarkdownRenderer
                  markdown={
                    isJapanese
                      ? selectedManual.contentJP
                      : selectedManual.contentEN
                  }
                />
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-center h-full text-gray-500'>
              <p>{t('selectManual')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualManagement;
