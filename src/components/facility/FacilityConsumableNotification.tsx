import React, { useState, useMemo } from 'react';
import { ConsumableNotification } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useLabStateContext } from '../../contexts/AppProviders';
import { useToast } from '../../contexts/ToastContext';
import { useAdminActions } from '../../hooks/useAdminActions';
import { useTranslation } from '../../hooks/useTranslation';

const FacilityConsumableNotification: React.FC = () => {
  const { currentUser, isFacilityStaff } = useSessionContext();
  const { t, isJapanese } = useTranslation();
  const { consumableNotifications } = useLabStateContext();
  const { showToast } = useToast();
  const { addConsumableNotification, updateConsumableNotificationStatus } = useAdminActions();
  
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    consumableId: '',
    location: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    notes: ''
  });

  // Facility-provided consumables definition
  const facilityConsumables = useMemo(() => [
    { id: 'hypochlorous-acid', nameJP: '次亜塩素酸', nameEN: 'Hypochlorous Acid Solution', locations: ['Lab Area A', 'Lab Area B', 'Common Area'] },
    { id: 'hand-soap', nameJP: '手洗い石鹸', nameEN: 'Hand Soap', locations: ['Washroom 1F', 'Washroom 2F', 'Lab Area A', 'Lab Area B'] },
    { id: 'hand-paper', nameJP: 'ハンドペーパー', nameEN: 'Paper Towels', locations: ['Washroom 1F', 'Washroom 2F', 'Lab Area A', 'Lab Area B'] },
    { id: 'disinfectant-wipes', nameJP: '消毒用ウェットティッシュ', nameEN: 'Disinfectant Wipes', locations: ['Lab Area A', 'Lab Area B', 'Common Area'] },
    { id: 'gloves-disposable', nameJP: '使い捨て手袋', nameEN: 'Disposable Gloves', locations: ['Lab Area A', 'Lab Area B'] }
  ], []);

  // Priority and Status configurations
  const priorityConfig = {
    LOW: { labelKey: 'priorityLow', color: 'bg-gray-100 text-gray-700', icon: '📋' },
    MEDIUM: { labelKey: 'priorityMedium', color: 'bg-blue-100 text-blue-700', icon: '📌' },
    HIGH: { labelKey: 'priorityHigh', color: 'bg-orange-100 text-orange-700', icon: '⚠️' },
    URGENT: { labelKey: 'priorityUrgent', color: 'bg-red-100 text-red-700', icon: '🚨' }
  } as const;
  const statusConfig = {
    REPORTED: { labelKey: 'statusReported', color: 'bg-yellow-100 text-yellow-700' },
    ACKNOWLEDGED: { labelKey: 'statusAcknowledged', color: 'bg-blue-100 text-blue-700' },
    RESTOCKING: { labelKey: 'statusRestocking', color: 'bg-purple-100 text-purple-700' },
    COMPLETED: { labelKey: 'statusCompleted', color: 'bg-green-100 text-green-700' }
  } as const;

  const handleSubmitReport = () => {
    if (!formData.consumableId || !formData.location || !currentUser) {
      showToast(t('selectConsumableAndLocation'), 'error');
      return;
    }
    const consumableInfo = facilityConsumables.find(c => c.id === formData.consumableId);
    if (!consumableInfo) return;

    addConsumableNotification({
      consumableId: formData.consumableId,
      consumableName: consumableInfo.nameEN, // Keep a non-language-specific name
      consumableNameJP: consumableInfo.nameJP,
      consumableNameEN: consumableInfo.nameEN,
      location: formData.location,
      currentStock: 0,
      minimumStock: 0,
      unit: t('unitItems'),
      priority: formData.priority,
      notes: formData.notes,
      reportedBy: currentUser.id,
      reportedDate: new Date(),
      status: 'REPORTED',
    });

    setFormData({ consumableId: '', location: '', priority: 'MEDIUM', notes: '' });
    setShowReportForm(false);
  };

  const activeNotifications = consumableNotifications.filter(n => n.status !== 'COMPLETED');
  const completedNotifications = consumableNotifications.filter(n => n.status === 'COMPLETED');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('facilityConsumablesShortageNotification')}</h2>
        {!isFacilityStaff && (
          <button onClick={() => setShowReportForm(true)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2">
            <span>🚨</span><span>{t('reportShortage')}</span>
          </button>
        )}
      </div>

      {showReportForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border-2 border-red-200">
          <h3 className="text-lg font-bold mb-4 text-red-700">{t('reportConsumableShortage')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('consumable')} *</label>
              <select value={formData.consumableId} onChange={(e) => setFormData({...formData, consumableId: e.target.value, location: ''})} className="w-full border rounded p-2">
                <option value="">{t('select')}</option>
                {facilityConsumables.map(item => <option key={item.id} value={item.id}>{isJapanese ? item.nameJP : item.nameEN}</option>)}
              </select>
            </div>
            {formData.consumableId && (
              <div>
                <label className="block text-sm font-medium mb-2">{t('location')} *</label>
                <select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full border rounded p-2">
                  <option value="">{t('select')}</option>
                  {facilityConsumables.find(c => c.id === formData.consumableId)?.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            )}
            <div>
                <label className="block text-sm font-medium mb-2">{t('priorityLevel')}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.keys(priorityConfig) as Array<keyof typeof priorityConfig>).map(priority => {
                        const config = priorityConfig[priority];
                        return (
                            <button key={priority} type="button" onClick={() => setFormData({...formData, priority})}
                                className={`p-3 rounded border-2 transition-all ${formData.priority === priority ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="text-2xl mb-1">{config.icon}</div>
                                <div className="text-sm font-medium">{t(config.labelKey)}</div>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('notes')}</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full border rounded p-2" rows={2} placeholder={t('notesPlaceholder')}/>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowReportForm(false)} className="px-4 py-2 border rounded hover:bg-gray-50">{t('cancel')}</button>
            <button type="button" onClick={handleSubmitReport} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">{t('submitReport')}</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b bg-gray-50"><h3 className="font-bold">{t('activeNotifications')}</h3></div>
        <div className="divide-y">
          {activeNotifications.length === 0 ? (<div className="p-6 text-center text-gray-500">{t('noActiveNotifications')}</div>) : (
            activeNotifications.map(notif => {
              const priority = priorityConfig[notif.priority];
              const status = statusConfig[notif.status];
              return (
                <div key={notif.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{priority.icon}</span>
                        <span className="font-bold text-lg">{isJapanese ? notif.consumableNameJP : notif.consumableNameEN}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${priority.color}`}>{t(priority.labelKey)}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2"><span className="font-medium">{t('location')}: </span>{notif.location}</div>
                      <div className="text-sm text-gray-600 mb-2"><span className="font-medium">{t('reportDate')}: </span>{new Date(notif.reportedDate).toLocaleString(isJapanese ? 'ja-JP' : 'en-US')}</div>
                      {notif.notes && <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">{notif.notes}</div>}
                    </div>
                    <div className="ml-4"><span className={`px-3 py-1 text-sm font-medium rounded ${status.color}`}>{t(status.labelKey)}</span></div>
                  </div>
                  {isFacilityStaff && (
                    <div className="flex gap-2 mt-3">
                      {notif.status === 'REPORTED' && <button onClick={() => updateConsumableNotificationStatus(notif.id, 'ACKNOWLEDGED')} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">{t('acknowledge')}</button>}
                      {notif.status === 'ACKNOWLEDGED' && <button onClick={() => updateConsumableNotificationStatus(notif.id, 'RESTOCKING')} className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">{t('startRestocking')}</button>}
                      {notif.status === 'RESTOCKING' && <button onClick={() => updateConsumableNotificationStatus(notif.id, 'COMPLETED')} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">{t('complete')}</button>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {completedNotifications.length > 0 && (
        <details className="bg-white rounded-lg shadow">
          <summary className="p-4 cursor-pointer hover:bg-gray-50 font-bold">{t('completedNotificationsHistory')} <span className="ml-2 text-gray-500">({completedNotifications.length})</span></summary>
          <div className="divide-y border-t">
            {completedNotifications.map(notif => (
              <div key={notif.id} className="p-4 text-sm"><div className="flex justify-between"><span className="font-medium">{isJapanese ? notif.consumableNameJP : notif.consumableNameEN}</span><span className="text-gray-500">{notif.restockedDate?.toLocaleDateString()}</span></div><div className="text-gray-600 text-xs mt-1">{notif.location}</div></div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default FacilityConsumableNotification;