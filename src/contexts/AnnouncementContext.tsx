// src/contexts/AnnouncementContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Announcement } from '../types';
import { useDataAdapter } from './DataAdapterContext';

interface AnnouncementContextValue {
  announcements: Announcement[];
  loading: boolean;
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(null);

export const AnnouncementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const adapter = useDataAdapter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adapter.getAnnouncements().then(result => {
        if (result.success) {
            setAnnouncements(result.data);
        }
    }).finally(() => {
        setLoading(false);
    });
  }, [adapter]);
  
  const value = useMemo(() => ({ announcements, loading }), [announcements, loading]);

  return <AnnouncementContext.Provider value={value}>{children}</AnnouncementContext.Provider>;
};

export const useAnnouncementContext = () => {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error('useAnnouncementContext must be used within an AnnouncementProvider');
  return context;
};