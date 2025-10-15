import React from 'react';
import { useConsumables } from '../../contexts/ConsumableContext';
import { useCompanyContext } from '../../contexts/CompanyContext';
import { useQmsContext } from '../../contexts/AppProviders';
import { useModalContext } from '../../contexts/ModalContext';
import { useTranslation } from '../../hooks/useTranslation';

// FIX: import from barrel file
import { View } from '../../types';
// FIX: import from barrel file
import { Consumable } from '../../types';

export const HazardousMaterialsDashboard: React.FC = () => {
  const { t, isJapanese } = useTranslation();
  const consumables = useConsumables();
  const { companies } = useCompanyContext();
  const { sds } = useQmsContext();
  const { openModal } = useModalContext();

  const handleNavigate = (view: View) => {
    window.location.hash = view;
  };

  // Calculate stats for hazardous materials
  const hazardousConsumables = consumables.filter(c => c.isHazardous);

  const calculateMultiple = (item: Consumable): number => {
    if (!item.isHazardous || !item.designatedQuantity || !item.packageSize || item.designatedQuantity === 0) return 0;
    const totalAmount = (item.stock * (item.packageSize || 0));
    return totalAmount / item.designatedQuantity;
  };

  const totalMultiple = hazardousConsumables.reduce((sum, item) => sum + calculateMultiple(item), 0);
  const isOverLimit = totalMultiple >= 1;

  // Define a type for the accumulator to ensure type safety.
  type CompanyItemsMap = Record<string, { items: (Consumable & { multiple: number })[], totalMultiple: number }>;

  const itemsByCompany = hazardousConsumables.reduce((acc: CompanyItemsMap, item) => {
    const companyId = item.ownerCompanyId || 'facility';
    if (!acc[companyId]) {
      acc[companyId] = { items: [], totalMultiple: 0 };
    }
    const multiple = calculateMultiple(item);
    acc[companyId].items.push({ ...item, multiple });
    acc[companyId].totalMultiple += multiple;
    return acc;
  }, {} as CompanyItemsMap);

  const getCompanyName = (id: string) => {
    // FIX: Use a translation key for 'facility'.
    if (id === 'facility') return t('facility');
    const company = companies.find(c => c.id === id);
    return company ? (isJapanese ? company.nameJP : company.nameEN) : 'Unknown';
  };
  
  const handleViewSds = (sdsId?: string) => {
    if (!sdsId) {
        alert(t('noSdsAssociated'));
        return;
    }
    const sdsDoc = sds.find(s => s.id === sdsId);
    if (sdsDoc) {
        openModal({ type: 'sdsDetails', props: { sds: sdsDoc } });
    } else {
        alert(t('sdsNotFound'));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-ever-black">
          {t('hazardousMaterialsDashboard')}
        </h2>
        <button
          onClick={() => handleNavigate('internalConsumablesManagement')}
          className="bg-ever-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-ever-blue-dark"
        >
          {t('goToInventory')}
        </button>
      </div>

      <div className={`p-6 rounded-lg mb-6 ${isOverLimit ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'} border-l-4`}>
        <h3 className="text-lg font-bold">{t('facilityWideMultiple')}</h3>
        <p className="text-4xl font-mono font-bold mt-2">{totalMultiple.toFixed(3)}</p>
        <p className="text-sm mt-1">{t('fireServiceActStandard')}</p>
        {isOverLimit && (
          <p className="font-bold text-red-700 mt-2">{t('fireServiceActWarning')}</p>
        )}
      </div>

      <div className="space-y-6">
        {Object.keys(itemsByCompany).map((companyId) => {
          const data = itemsByCompany[companyId];
          return (
          <div key={companyId} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">{getCompanyName(companyId)} - {t('totalMultiple')}: {data.totalMultiple.toFixed(3)}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('substance')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('stock')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('multiple')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{isJapanese ? item.nameJP : item.nameEN}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.hazardousCategory}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.stock * (item.packageSize || 0)} {item.packageUnit}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">{item.multiple.toFixed(3)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleViewSds(item.sdsId)} className="text-indigo-600 hover:text-indigo-900">
                          {t('sdsDetails')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};
