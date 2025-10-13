import React from 'react';
import { InventorySnapshot } from '../../types';
import { useModalContext } from '../../contexts/ModalContext';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUserContext } from '../../contexts/UserContext';
import { useConsumableContext } from '../../contexts/ConsumableContext';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useInventorySnapshots } from '../../hooks/useInventorySnapshots';

const InventoryLockManager: React.FC = () => {
  const { isJapanese, currentUser } = useSessionContext();
  const { users } = useUserContext();
  const { consumables } = useConsumableContext();
  const { showToast } = useToast();
  const { hasPermission } = usePermissions();
  const { snapshots: inventorySnapshots, createMonthlySnapshot, unlockAllSnapshots } = useInventorySnapshots();
  const { openModal } = useModalContext();

  const canLock = hasPermission('inventory', 'manage');
  const canUnlock = hasPermission('inventory', 'manage'); // FacilityDirector only check is inside the action

  const handleLock = () => {
    openModal({
      type: 'confirmAction',
      props: {
        title: isJapanese ? '在庫ロックの確認' : 'Confirm Inventory Lock',
        message: isJapanese ? '当月の在庫をロックしますか？この操作後は在庫の変更ができなくなります。' : 'Lock inventory for the current month? Changes will be disabled after this action.',
        confirmText: isJapanese ? 'ロックする' : 'Lock',
        onConfirm: () => {
          if (!currentUser) {
            showToast(isJapanese ? 'ユーザー情報が見つかりません。' : 'User not found.', 'error');
            return;
          }
          try {
            const now = new Date();
            createMonthlySnapshot(
              now.getFullYear(),
              now.getMonth() + 1,
              consumables,
              currentUser.id,
              currentUser.name
            );
            showToast(isJapanese ? '当月の在庫をロックしました。' : 'Inventory for the current month has been locked.', 'success');
          } catch (e) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred';
            showToast(isJapanese ? `ロックに失敗しました: ${message}` : `Failed to lock inventory: ${message}`, 'error');
          }
        }
      }
    });
  };
  
  const handleUnlock = () => {
    openModal({
        type: 'promptAction',
        props: {
            title: isJapanese ? '全在庫ロック解除' : 'Unlock All Inventory',
            message: isJapanese ? 'ロック解除の理由を入力してください（監査ログに記録されます）。' : 'Please enter a reason for unlocking (will be recorded in the audit log).',
            inputLabel: isJapanese ? 'ロック解除の理由' : 'Reason for unlocking',
            confirmText: isJapanese ? 'ロック解除' : 'Unlock',
            onConfirm: (reason) => {
              if (!currentUser) {
                showToast(isJapanese ? 'ユーザー情報が見つかりません。' : 'User not found.', 'error');
                return;
              }
              try {
                unlockAllSnapshots(currentUser.id, currentUser.name, reason);
                showToast(isJapanese ? '全ての在庫ロックを解除しました。' : 'All inventory locks have been removed.', 'success');
              } catch (e) {
                const message = e instanceof Error ? e.message : 'An unknown error occurred';
                showToast(isJapanese ? `ロック解除に失敗しました: ${message}` : `Failed to unlock inventory: ${message}`, 'error');
              }
            }
        }
    });
  };
  
  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || userId;
  }

  const sortedSnapshots = [...inventorySnapshots].sort((a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime());

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-ever-black">
        {isJapanese ? '月次在庫ロック管理' : 'Monthly Inventory Lock Management'}
      </h2>
      
      {canLock && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-bold mb-4">{isJapanese ? '在庫ロック実行' : 'Execute Inventory Lock'}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {isJapanese 
              ? '現在の在庫状況のスナップショットを作成し、当月の在庫をロックします。ロック後は、在庫数の変更やアイテムの追加・削除ができなくなります。' 
              : 'This will create a snapshot of the current inventory and lock it for the month. After locking, inventory counts cannot be changed, and items cannot be added or deleted.'}
          </p>
          <div className="flex gap-4">
              <button onClick={handleLock} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                {isJapanese ? '当月の在庫をロック' : 'Lock Current Month\'s Inventory'}
              </button>
              {canUnlock && (
                <button onClick={handleUnlock} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
                  {isJapanese ? '全在庫のロックを解除' : 'Unlock All Inventory'}
                </button>
              )}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">{isJapanese ? '在庫スナップショット履歴' : 'Inventory Snapshot History'}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '期間' : 'Period'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? 'ロック実行日' : 'Lock Date'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? 'アイテム数' : 'Item Count'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isJapanese ? '実行者' : 'Executed By'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSnapshots.map((snapshot: InventorySnapshot) => (
                <tr key={snapshot.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{snapshot.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(snapshot.snapshotDate).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{snapshot.consumables.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getUserName(snapshot.createdBy)}</td>
                </tr>
              ))}
              {sortedSnapshots.length === 0 && (
                 <tr><td colSpan={4} className="text-center py-8 text-gray-500">{isJapanese ? 'スナップショットはありません。' : 'No snapshots found.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryLockManager;