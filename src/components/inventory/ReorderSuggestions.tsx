import React from 'react';
import { useConsumables } from '../../contexts/ConsumableContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from '../../hooks/useTranslation';
// FIX: import from barrel file
import { View } from '../../types';

const ReorderSuggestions: React.FC = () => {
  const consumables = useConsumables();
  const { t, isJapanese } = useTranslation();
  const { hasPermission } = usePermissions();

  const suggestedItems = consumables.filter(
    (c) => c.stock <= c.lowStockThreshold && c.stock > 0
  );

  const stockoutItems = consumables.filter((c) => c.stock === 0);

  const canCreateQuotation = hasPermission('quotations', 'manage');

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-3xl font-bold text-ever-black'>
          {t('reorderSuggestions')}
        </h2>
      </div>

      <div className='mb-8'>
        <h3 className='text-xl font-semibold mb-4 text-red-600'>
          {t('stockoutItems')} ({stockoutItems.length})
        </h3>
        {stockoutItems.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {stockoutItems.map((item) => (
              <div
                key={item.id}
                className='bg-red-50 border border-red-200 p-4 rounded-lg'
              >
                <p className='font-bold'>
                  {isJapanese ? item.nameJP : item.nameEN}
                </p>
                <p className='text-sm text-gray-600'>
                  {t('category')}:{' '}
                  {isJapanese ? item.categoryJP : item.categoryEN}
                </p>
                <p className='text-sm text-red-700 font-bold'>
                  {t('currentStock')}: {item.stock}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>{t('noStockoutItems')}</p>
        )}
      </div>

      <div>
        <h3 className='text-xl font-semibold mb-4 text-yellow-600'>
          {t('lowStockItems')} ({suggestedItems.length})
        </h3>
        {suggestedItems.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {suggestedItems.map((item) => (
              <div
                key={item.id}
                className='bg-yellow-50 border border-yellow-200 p-4 rounded-lg'
              >
                <p className='font-bold'>
                  {isJapanese ? item.nameJP : item.nameEN}
                </p>
                <p className='text-sm text-gray-600'>
                  {t('category')}:{' '}
                  {isJapanese ? item.categoryJP : item.categoryEN}
                </p>
                <p className='text-sm text-yellow-700 font-bold'>
                  {t('currentStock')}: {item.stock}
                </p>
                <p className='text-sm text-gray-500'>
                  {t('threshold')}: {item.lowStockThreshold}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>{t('noLowStockItems')}</p>
        )}
      </div>
    </div>
  );
};

export default ReorderSuggestions;
