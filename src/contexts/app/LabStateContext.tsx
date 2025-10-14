// src/contexts/app/LabStateContext.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { ConsumableNotification, CO2IncubatorTracking, Memo, WaitlistEntry } from '../../types';
import { getMockData } from '../../data/mockData';

interface LabStateContextValue {
  consumableNotifications: ConsumableNotification[];
  setConsumableNotifications: React.Dispatch<React.SetStateAction<ConsumableNotification[]>>;
  co2IncubatorTrackingData: CO2IncubatorTracking[];
  setCo2IncubatorTrackingData: React.Dispatch<React.SetStateAction<CO2IncubatorTracking[]>>;
  memos: Memo[];
  waitlist: WaitlistEntry[];
  setWaitlist: React.Dispatch<React.SetStateAction<WaitlistEntry[]>>;
}

const LabStateContext = createContext<LabStateContextValue | null>(null);

export const LabStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialData = getMockData();
    const [consumableNotifications, setConsumableNotifications] = useState<ConsumableNotification[]>(initialData.consumableNotifications);
    const [co2IncubatorTrackingData, setCo2IncubatorTrackingData] = useState<CO2IncubatorTracking[]>(initialData.co2IncubatorTrackingData);
    const [memos] = useState<Memo[]>(initialData.memos);
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(initialData.waitlist);
    
    const value = useMemo(() => ({
        consumableNotifications, setConsumableNotifications,
        co2IncubatorTrackingData, setCo2IncubatorTrackingData,
        memos, waitlist, setWaitlist
    }), [consumableNotifications, co2IncubatorTrackingData, memos, waitlist]);

    return <LabStateContext.Provider value={value}>{children}</LabStateContext.Provider>;
};

export const useLabStateContext = () => {
    const c = useContext(LabStateContext);
    if (!c) throw new Error('useLabStateContext must be inside LabStateProvider');
    return c;
};
