import React from 'react';
import { InventorySnapshot } from '../../types';
import { useModalContext } from '../../contexts/ModalContext';
import { useUsers } from '../../contexts/UserContext';
import { useConsumables } from '../../contexts/ConsumableContext';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useInventorySnapshots } from '../../hooks/useInventorySnapshots';
import { useSessionContext } from '../../contexts/SessionContext';
import { useTranslation } from '../../hooks/useTranslation';

const InventoryLockManager: React.FC = () => {
  const { currentUser } = useSessionContext();
  const { t } = useTranslation();
  const users = useUsers();
  const consumables = useConsumables();
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
        title: t('confirmLockTitle'),
        message: t('confirmLockMessage'),
        confirmText: t('lock'),
        onConfirm: () => {
          if (!currentUser) {
            showToast(t('userNotFound'), 'error');
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
            showToast(t('lockSuccess'), 'success');
          } catch (e) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred';
            showToast(`${t('lockFailed')}: ${message}`, 'error');
          }
        }
      }
    });
  };
  
  const handleUnlock = () => {
    openModal({
        type: 'promptAction',
        props: {
            title: t('unlockAllTitle'),
            message: t('unlockReasonPrompt'),
            inputLabel: t('unlockReason'),
            confirmText: t('unlock'),
            onConfirm: (reason) => {
              if (!currentUser) {
                showToast(t('userNotFound'), 'error');
                return;
              }
              try {
                unlockAllSnapshots(currentUser.id, currentUser.name, reason);
                showToast(t('unlockSuccess'), 'success');
              } catch (e) {
                const message = e instanceof Error ? e.message : 'An unknown error occurred';
                showToast(`${t('unlockFailed')}: ${message}`, 'error');
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
        {t('inventoryLockManagement')}
      </h2>
      
      {canLock && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-bold mb-4">{t('executeInventoryLock')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('lockDescription')}
          </p>
          <div className="flex gap-4">
              <button onClick={handleLock} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                {t('lockCurrentMonth')}
              </button>
              {canUnlock && (
                <button onClick={handleUnlock} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
                  {t('unlockAll')}
                </button>
              )}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">{t('snapshotHistory')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('period')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lockDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('itemCount')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('executedBy')}</th>
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
                 <tr><td colSpan={4} className="text-center py-8 text-gray-500">{t('noSnapshots')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryLockManager;