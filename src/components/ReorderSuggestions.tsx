
import React from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { useConsumableContext } from '../contexts/ConsumableContext';
import { usePermissions } from '../hooks/usePermissions';
import { View } from '../types/core';

const ReorderSuggestions: React.FC = () => {
  const { consumables } = useConsumableContext();
  const { isJapanese } = useSessionContext();
  const { hasPermission } = usePermissions();

  const suggestedItems = consumables.filter(
    (c) => c.stock <= c.lowStockThreshold && c.stock > 0
  );

  const stockoutItems = consumables.filter((c) => c.stock === 0);

  const canCreateQuotation = hasPermission('quotations', 'manage');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-ever-black">
          {isJapanese ? '再発注推奨' : 'Reorder Suggestions'}
        </h2>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          {isJapanese ? '在庫切れ' : 'Stockout Items'} ({stockoutItems.length})
        </h3>
        {stockoutItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockoutItems.map((item) => (
              <div key={item.id} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="font-bold">{isJapanese ? item.nameJP : item.nameEN}</p>
                <p className="text-sm text-gray-600">{isJapanese ? 'カテゴリ' : 'Category'}: {isJapanese ? item.categoryJP : item.categoryEN}</p>
                <p className="text-sm text-red-700 font-bold">{isJapanese ? '現在の在庫' : 'Current Stock'}: {item.stock}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{isJapanese ? '在庫切れの商品はありません。' : 'No stockout items.'}</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-yellow-600">
          {isJapanese ? '低在庫' : 'Low Stock Items'} ({suggestedItems.length})
        </h3>
        {suggestedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedItems.map((item) => (
              <div key={item.id} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="font-bold">{isJapanese ? item.nameJP : item.nameEN}</p>
                <p className="text-sm text-gray-600">{isJapanese ? 'カテゴリ' : 'Category'}: {isJapanese ? item.categoryJP : item.categoryEN}</p>
                <p className="text-sm text-yellow-700 font-bold">{isJapanese ? '現在の在庫' : 'Current Stock'}: {item.stock}</p>
                <p className="text-sm text-gray-500">{isJapanese ? '閾値' : 'Threshold'}: {item.lowStockThreshold}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{isJapanese ? '低在庫の商品はありません。' : 'No low stock items.'}</p>
        )}
      </div>
    </div>
  );
};

export default ReorderSuggestions;
