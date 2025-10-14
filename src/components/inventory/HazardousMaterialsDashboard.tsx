import React from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useConsumableContext } from '../../contexts/ConsumableContext';
import { useCompanyContext } from '../../contexts/CompanyContext';

import { View } from '../../types/core';
import { Consumable } from '../../types/inventory';

export const HazardousMaterialsDashboard: React.FC = () => {
  const { isJapanese } = useSessionContext();
  const { consumables } = useConsumableContext();
  const { companies } = useCompanyContext();

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
    if (id === 'facility') return isJapanese ? '施設' : 'Facility';
    const company = companies.find(c => c.id === id);
    return company ? (isJapanese ? company.nameJP : company.nameEN) : 'Unknown';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-ever-black">
          {isJapanese ? '危険物管理ダッシュボード' : 'Hazardous Materials Dashboard'}
        </h2>
        <button
          onClick={() => handleNavigate('internalConsumablesManagement')}
          className="bg-ever-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-ever-blue-dark"
        >
          {isJapanese ? '在庫管理へ' : 'Go to Inventory'}
        </button>
      </div>

      <div className={`p-6 rounded-lg mb-6 ${isOverLimit ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'} border-l-4`}>
        <h3 className="text-lg font-bold">{isJapanese ? '施設全体の指定数量倍率' : 'Facility-Wide Designated Quantity Multiple'}</h3>
        <p className="text-4xl font-mono font-bold mt-2">{totalMultiple.toFixed(3)}</p>
        <p className="text-sm mt-1">{isJapanese ? `消防法に基づく届出基準は倍率1.0です。` : `The reporting standard based on the Fire Service Act is a multiple of 1.0.`}</p>
        {isOverLimit && (
          <p className="font-bold text-red-700 mt-2">{isJapanese ? '警告: 指定数量の倍率が1.0を超えています。消防署への届出が必要です。' : 'Warning: The designated quantity multiple exceeds 1.0. Notification to the fire department is required.'}</p>
        )}
      </div>

      <div className="space-y-6">
        {Object.keys(itemsByCompany).map((companyId) => {
          const data = itemsByCompany[companyId];
          return (
          <div key={companyId} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">{getCompanyName(companyId)} - {isJapanese ? '合計倍率' : 'Total Multiple'}: {data.totalMultiple.toFixed(3)}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '物質名' : 'Substance'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '分類' : 'Category'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '在庫量' : 'Stock'}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '倍率' : 'Multiple'}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{isJapanese ? item.nameJP : item.nameEN}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.hazardousCategory}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.stock * (item.packageSize || 0)} {item.packageUnit}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">{item.multiple.toFixed(3)}</td>
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