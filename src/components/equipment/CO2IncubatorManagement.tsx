import React, { useState, useEffect, useMemo } from 'react';
import { CO2IncubatorTracking, CalendarEventType } from '../../types';
import { Language } from '../../types';
import { googleCalendarService, createCalendarEventFromSchedule } from '../../services/googleCalendarService';
import { useSessionContext } from '../../contexts/SessionContext';
import { useLabStateContext } from '../../contexts/AppProviders';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useToast } from '../../contexts/ToastContext';
import { useEquipmentActions } from '../../hooks/useEquipmentActions';
import { useTranslation } from '../../hooks/useTranslation';

export const CO2IncubatorManagement: React.FC = () => {
  const { language, currentUser } = useSessionContext();
  const { co2IncubatorTrackingData, setCo2IncubatorTrackingData } = useLabStateContext();
  const equipment = useEquipment();
  const { showToast } = useToast();
  const { updateCO2IncubatorTracking } = useEquipmentActions();
  const { t, isJapanese } = useTranslation();
  
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
          : 'Replacement scheduled (Calendar sync is offline)',
        'info'
      );
    }
  };

  // FIX: Added missing return statement with JSX
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{isJapanese ? 'CO2インキュベーターガス管理' : 'CO2 Incubator Gas Management'}</h2>

      <div className="space-y-4">
        {co2IncubatorTrackingData.map(item => {
          const warningLevel = getWarningLevel(item.currentLevel, item.minimumLevel, item.cylinderSize);
          const gasType = gasTypeLabels[item.gasType] || { jp: item.gasType, en: item.gasType };
          
          return (
            <div key={item.id} className={`p-4 rounded-lg shadow mb-4 border-l-4 ${warningLevel.color.replace('bg-', 'border-').replace('-100', '-400')}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{item.equipmentName}</h3>
                  <p className="text-sm text-gray-600">{isJapanese ? gasType.jp : gasType.en}</p>
                </div>
                <div className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-2 ${warningLevel.color}`}>
                  <span>{warningLevel.icon}</span>
                  <span>{isJapanese ? warningLevel.labelJP : warningLevel.labelEN}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">{isJapanese ? '現在残量' : 'Current Level'}</p>
                  <p className="font-semibold text-xl">{item.currentLevel.toFixed(1)} / {item.cylinderSize} kg</p>
                </div>
                <div>
                  <p className="text-gray-500">{isJapanese ? '最低レベル' : 'Min. Level'}</p>
                  <p className="font-semibold">{item.minimumLevel} kg</p>
                </div>
                <div>
                  <p className="text-gray-500">{isJapanese ? '最終測定日' : 'Last Measured'}</p>
                  <p className="font-semibold">{new Date(item.lastMeasuredDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">{isJapanese ? '推定空日' : 'Est. Empty Date'}</p>
                  <p className="font-semibold">{item.estimatedEmptyDate ? new Date(item.estimatedEmptyDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              {item.replacementScheduled && item.replacementDate && (
                <p className="text-sm mt-2 text-green-700 font-medium">{isJapanese ? `交換予定日: ${new Date(item.replacementDate).toLocaleDateString()}` : `Replacement scheduled for ${new Date(item.replacementDate).toLocaleDateString()}`}</p>
              )}

              <div className="flex gap-2 mt-4">
                <button onClick={() => { setSelectedIncubator(item.equipmentId); setShowRecordForm(true); setFormData({ currentLevel: item.currentLevel, notes: '' }) }} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  {isJapanese ? '残量記録' : 'Record Level'}
                </button>
                {warningLevel.level !== 'normal' && !item.replacementScheduled && (
                  <button onClick={() => scheduleReplacement(item.id, new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    {isJapanese ? '交換をスケジュール' : 'Schedule Replacement'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showRecordForm && selectedIncubator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{isJapanese ? 'ガス残量記録: ' : 'Record Gas Level for '}{co2IncubatorTrackingData.find(d => d.equipmentId === selectedIncubator)?.equipmentName}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">{isJapanese ? '現在残量 (kg)' : 'Current Level (kg)'}</label>
                <input type="number" value={formData.currentLevel} onChange={e => setFormData(p => ({...p, currentLevel: parseFloat(e.target.value)}))} className="w-full border rounded p-2 mt-1" step="0.1" />
              </div>
              <div>
                <label className="block text-sm font-medium">{isJapanese ? '備考' : 'Notes'}</label>
                <textarea value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} className="w-full border rounded p-2 mt-1" rows={3}></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowRecordForm(false)} className="px-4 py-2 border rounded hover:bg-gray-50">{isJapanese ? 'キャンセル' : 'Cancel'}</button>
              <button onClick={handleSubmitRecord} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{isJapanese ? '保存' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
