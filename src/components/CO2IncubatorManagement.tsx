import React, { useState, useEffect, useMemo } from 'react';
import { CO2IncubatorTracking, CalendarEventType } from '@/types';
import { Language } from '@/types';
import { googleCalendarService, createCalendarEventFromSchedule } from '@/services/googleCalendarService';
import { useSessionContext } from '@/contexts/SessionContext';
import { useLabStateContext } from '@/contexts/AppProviders';
import { useEquipmentContext } from '@/contexts/EquipmentContext';
import { useToast } from '@/contexts/ToastContext';
import { useEquipmentActions } from '@/hooks/useEquipmentActions';

export const CO2IncubatorManagement: React.FC = () => {
  const { language, currentUser } = useSessionContext();
  const { co2IncubatorTrackingData, setCo2IncubatorTrackingData } = useLabStateContext();
  const { equipment } = useEquipmentContext();
  const { showToast } = useToast();
  const { updateCO2IncubatorTracking } = useEquipmentActions();
  const isJapanese = language === Language.JA;
  
  const [selectedIncubator, setSelectedIncubator] = useState<string | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [formData, setFormData] = useState({
    currentLevel: 0,
    notes: ''
  });

  const co2Incubators = useMemo(() => equipment.filter(e => e.nameEN.includes('CO2 Incubator')), [equipment]);

  useEffect(() => {
    const trackedIds = new Set(co2IncubatorTrackingData.map(d => d.equipmentId));
    const newTrackingData: CO2IncubatorTracking[] = [];
    let changed = false;
    co2Incubators.forEach(inc => {
        if (!trackedIds.has(inc.id)) {
            changed = true;
            newTrackingData.push({
                id: `co2-track-${inc.id}`,
                equipmentId: inc.id,
                equipmentName: isJapanese ? inc.nameJP : inc.nameEN,
                gasType: 'CO2',
                cylinderSize: 40, // kg - default
                currentLevel: 40, // kg - full
                minimumLevel: 5, // kg
                lastMeasuredDate: new Date(),
                lastMeasuredBy: 'system',
                estimatedEmptyDate: null,
                alertTriggered: false,
                notes: 'Initial data.',
                replacementScheduled: false,
            });
        }
    });
    if (changed) {
        setCo2IncubatorTrackingData(prev => [...prev, ...newTrackingData]);
    }
  }, [co2Incubators, co2IncubatorTrackingData, setCo2IncubatorTrackingData, isJapanese]);
  

  const gasTypeLabels = {
    CO2: { jp: '炭酸ガス (CO2)', en: 'Carbon Dioxide (CO2)' },
    N2: { jp: '窒素ガス (N2)', en: 'Nitrogen (N2)' },
    O2: { jp: '酸素ガス (O2)', en: 'Oxygen (O2)' }
  };

  const calculateEstimatedEmptyDate = (
    currentLevel: number,
    cylinderSize: number,
    lastMeasuredDate: Date,
    previousLevel?: number,
    previousDate?: Date
  ): Date | null => {
    if (previousLevel === undefined || !previousDate || currentLevel >= previousLevel) return null;

    const daysDiff = Math.max(1, (lastMeasuredDate.getTime() - new Date(previousDate).getTime()) / (1000 * 60 * 60 * 24));
    const usagePerDay = (previousLevel - currentLevel) / daysDiff;

    if (usagePerDay <= 0) return null;

    const daysRemaining = currentLevel / usagePerDay;
    const emptyDate = new Date(lastMeasuredDate);
    emptyDate.setDate(emptyDate.getDate() + Math.floor(daysRemaining));

    return emptyDate;
  };

  const getWarningLevel = (currentLevel: number, minimumLevel: number, cylinderSize: number) => {
    const percentage = (currentLevel / cylinderSize) * 100;

    if (currentLevel <= minimumLevel) {
      return { level: 'critical' as const, labelJP: '緊急交換必要', labelEN: 'Critical - Replace Now', color: 'bg-red-100 text-red-700 border-red-300', icon: '🚨' };
    } else if (percentage <= 20) {
      return { level: 'warning' as const, labelJP: '交換推奨', labelEN: 'Warning - Replace Soon', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '⚠️' };
    } else if (percentage <= 40) {
      return { level: 'caution' as const, labelJP: '要注意', labelEN: 'Caution', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⚡' };
    }
    return { level: 'normal' as const, labelJP: '正常', labelEN: 'Normal', color: 'bg-green-100 text-green-700 border-green-300', icon: '✓' };
  };

  const handleSubmitRecord = () => {
    if (!selectedIncubator || formData.currentLevel < 0 || !currentUser) {
      showToast(isJapanese ? '入力内容を確認してください' : 'Please check input values', 'error');
      return;
    }

    const existingData = co2IncubatorTrackingData.find(t => t.equipmentId === selectedIncubator);
    
    if (existingData) {
      if (formData.currentLevel > existingData.cylinderSize) {
        showToast(isJapanese ? '残量がシリンダー容量を超えています。' : 'Level cannot exceed cylinder size.', 'error');
        return;
      }

      const estimatedEmptyDate = calculateEstimatedEmptyDate(
        formData.currentLevel,
        existingData.cylinderSize,
        new Date(),
        existingData.currentLevel,
        new Date(existingData.lastMeasuredDate)
      );
      const warningLevel = getWarningLevel(formData.currentLevel, existingData.minimumLevel, existingData.cylinderSize);
      const updatedData: CO2IncubatorTracking = {
        ...existingData,
        previousLevel: existingData.currentLevel,
        previousDate: existingData.lastMeasuredDate,
        currentLevel: formData.currentLevel,
        lastMeasuredDate: new Date(),
        lastMeasuredBy: currentUser.id,
        estimatedEmptyDate,
        alertTriggered: (warningLevel.level === 'critical' || warningLevel.level === 'warning'),
        alertDate: (warningLevel.level === 'critical' || warningLevel.level === 'warning') && !existingData.alertTriggered ? new Date() : existingData.alertDate,
        notes: formData.notes
      };

      updateCO2IncubatorTracking(updatedData);
      showToast(isJapanese ? 'ガス残量を記録しました' : 'Gas level recorded', 'success');
      if (warningLevel.level === 'critical') {
        showToast(isJapanese ? '⚠️ ガス残量が危険レベルです！至急交換してください' : '⚠️ Gas level critical! Replace immediately', 'error');
      }
    }
    setFormData({ currentLevel: 0, notes: '' });
    setShowRecordForm(false);
  };

  const scheduleReplacement = async (id: string, date: Date) => {
    const item = co2IncubatorTrackingData.find(t => t.id === id);
    if (!item) return;

    const calendarEvent = createCalendarEventFromSchedule(
      CalendarEventType.CO2Replacement,
      {
        jp: `CO2ボンベ交換: ${item.equipmentName}`,
        en: `CO2 Cylinder Replacement: ${item.equipmentName}`
      },
      {
        jp: `${item.equipmentName}のCO2ボンベを交換してください。現在残量: ${item.currentLevel}kg`,
        en: `Replace CO2 cylinder for ${item.equipmentName}. Current level: ${item.currentLevel}kg`
      },
      date,
      60, // 交換作業は1時間を想定
      ['user-lab-manager'], // 施設スタッフに割り当て
      item.id,
      [4320, 1440, 60] // 3日前、1日前、1時間前にリマインダー
    );
  
    try {
      const syncResult = await googleCalendarService.createEvent(calendarEvent, language);
      
      const updatedItem = {
        ...item,
        replacementScheduled: true,
        replacementDate: date,
        googleCalendarEventId: syncResult.success ? syncResult.googleCalendarEventId : undefined,
      };
      updateCO2IncubatorTracking(updatedItem);
      
      if (syncResult.success) {
        showToast(
          isJapanese 
            ? '✅ 交換スケジュールを設定し、Googleカレンダーに登録しました' 
            : '✅ Replacement scheduled and added to Google Calendar',
          'success'
        );
      } else {
        showToast(
          isJapanese 
            ? '⚠️ 交換スケジュールを設定しましたが、Googleカレンダーへの同期に失敗しました' 
            : '⚠️ Replacement scheduled, but failed to sync with Google Calendar',
          'warning'
        );
      }
    } catch (error) {
      console.error('Calendar sync error:', error);
      updateCO2IncubatorTracking({ ...item, replacementScheduled: true, replacementDate: date });
      showToast(
        isJapanese 
          ? '交換スケジュールを設定しました（カレンダー同期はオフライン）' 
          : 'Replacement scheduled (Calendar sync offline)',
        'info'
      );
    }
  };

  const overviewCounts = useMemo(() => {
    const counts = { normal: 0, caution: 0, warning: 0, critical: 0 };
    co2IncubatorTrackingData.forEach(t => {
      const warning = getWarningLevel(t.currentLevel, t.minimumLevel, t.cylinderSize);
      counts[warning.level]++;
    });
    return counts;
  }, [co2IncubatorTrackingData]);


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{isJapanese ? 'CO2インキュベーター ガス管理' : 'CO2 Incubator Gas Management'}</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">{isJapanese ? '正常' : 'Normal'}</div>
          <div className="text-2xl font-bold text-green-700">{overviewCounts.normal}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">{isJapanese ? '要注意' : 'Caution'}</div>
          <div className="text-2xl font-bold text-yellow-700">{overviewCounts.caution}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">{isJapanese ? '交換推奨' : 'Warning'}</div>
          <div className="text-2xl font-bold text-orange-700">{overviewCounts.warning}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-600 font-medium">{isJapanese ? '緊急' : 'Critical'}</div>
          <div className="text-2xl font-bold text-red-700">{overviewCounts.critical}</div>
        </div>
      </div>

      {showRecordForm && selectedIncubator && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold mb-4">{isJapanese ? `ガス残量記録 (${co2IncubatorTrackingData.find(d => d.equipmentId === selectedIncubator)?.equipmentName})` : `Record Gas Level (${co2IncubatorTrackingData.find(d => d.equipmentId === selectedIncubator)?.equipmentName})`}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{isJapanese ? '現在の残量（kg）' : 'Current Level (kg)'} *</label>
              <input type="number" min="0" step="0.1" value={formData.currentLevel} onChange={(e) => setFormData({...formData, currentLevel: parseFloat(e.target.value) || 0})} className="w-full border rounded p-2" placeholder="0.0" />
              <p className="text-xs text-gray-500 mt-1">{isJapanese ? 'ボンベに表示されている残量を入力してください' : 'Enter the level shown on the cylinder'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{isJapanese ? '備考' : 'Notes'}</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full border rounded p-2" rows={2} placeholder={isJapanese ? '気づいた点があれば記入' : 'Optional notes'} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setShowRecordForm(false); setSelectedIncubator(null); }} className="px-4 py-2 border rounded hover:bg-gray-50">{isJapanese ? 'キャンセル' : 'Cancel'}</button>
            <button onClick={handleSubmitRecord} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{isJapanese ? '記録する' : 'Record'}</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {co2IncubatorTrackingData.map(item => {
          const warningStatus = getWarningLevel(item.currentLevel, item.minimumLevel, item.cylinderSize);
          const percentage = (item.currentLevel / item.cylinderSize) * 100;

          return (
            <div key={item.id} className={`bg-white rounded-lg shadow border-l-4 ${warningStatus.color.replace('bg-', 'border-').replace('-100', '-300')}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{warningStatus.icon}</span>
                      <h3 className="text-xl font-bold">{item.equipmentName}</h3>
                    </div>
                    <div className="text-sm text-gray-600">{isJapanese ? gasTypeLabels[item.gasType].jp : gasTypeLabels[item.gasType].en}</div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded ${warningStatus.color}`}>{isJapanese ? warningStatus.labelJP : warningStatus.labelEN}</span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{isJapanese ? '残量' : 'Current Level'}</span>
                    <span className="font-bold">{item.currentLevel.toFixed(1)} kg / {item.cylinderSize} kg ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden"><div className={`h-full transition-all duration-500 ${percentage <= 10 ? 'bg-red-500' : percentage <= 20 ? 'bg-orange-500' : percentage <= 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${percentage}%` }} /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded"><div className="text-xs text-gray-600 mb-1">{isJapanese ? '最終記録' : 'Last Measured'}</div><div className="text-sm font-medium">{new Date(item.lastMeasuredDate).toLocaleString(isJapanese ? 'ja-JP' : 'en-US')}</div></div>
                  {item.estimatedEmptyDate && (<div className="bg-gray-50 p-3 rounded"><div className="text-xs text-gray-600 mb-1">{isJapanese ? '予測空き日' : 'Estimated Empty'}</div><div className="text-sm font-medium">{new Date(item.estimatedEmptyDate).toLocaleDateString(isJapanese ? 'ja-JP' : 'en-US')}</div></div>)}
                  {item.replacementScheduled && item.replacementDate && (
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-xs text-blue-600 mb-1 flex items-center justify-between">
                        <span>{isJapanese ? '交換予定日' : 'Replacement Scheduled'}</span>
                        {item.googleCalendarEventId && (
                          <span className="flex items-center gap-1 text-green-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {isJapanese ? 'カレンダー同期済み' : 'Synced'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-blue-700">
                        {new Date(item.replacementDate).toLocaleDateString(isJapanese ? 'ja-JP' : 'en-US')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setSelectedIncubator(item.equipmentId); setShowRecordForm(true); setFormData({ currentLevel: item.currentLevel, notes: '' }); }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{isJapanese ? '残量を記録' : 'Record Level'}</button>
                  {!item.replacementScheduled && (warningStatus.level === 'warning' || warningStatus.level === 'critical') && (<button onClick={() => { const scheduledDate = new Date(); scheduledDate.setDate(scheduledDate.getDate() + 7); scheduleReplacement(item.id, scheduledDate); }} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">{isJapanese ? '交換予約' : 'Schedule Replacement'}</button>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <p className="text-sm text-blue-800 mb-2">{isJapanese ? '※ CO2インキュベーターのガスボンベ残量を定期的に記録してください。残量が少なくなると自動的に警告が表示され、空き日の予測が行われます。' : '※ Please record the gas cylinder levels regularly. Warnings will be displayed automatically when levels are low, and empty dates will be estimated.'}</p>
        <p className="text-sm text-blue-800">{isJapanese ? '緊急レベルに達した場合は、速やかにボンベの交換を行ってください。' : 'When critical level is reached, please replace the cylinder immediately.'}</p>
      </div>
    </div>
  );
};

export default CO2IncubatorManagement;