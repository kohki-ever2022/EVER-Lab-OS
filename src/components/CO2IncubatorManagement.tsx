import React, { useState, useEffect, useMemo } from 'react';
import { CO2IncubatorTracking, CalendarEventType } from '../types';
import { Language } from '../types';
import { googleCalendarService, createCalendarEventFromSchedule } from '../services/googleCalendarService';
import { useSessionContext } from '../contexts/SessionContext';
import { useLabStateContext } from '../contexts/AppProviders';
import { useEquipmentContext } from '../contexts/EquipmentContext';
import { useToast } from '../contexts/ToastContext';
import { useEquipmentActions } from '../hooks/useEquipmentActions';

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
          : 'Replacement scheduled (Calendar sync