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

const CO2IncubatorManagement: React.FC = () => {
  const { language, currentUser } = useSessionContext();
  const { co2IncubatorTrackingData, setCo2IncubatorTrackingData } = useLabStateContext();
  const equipment = useEquipment