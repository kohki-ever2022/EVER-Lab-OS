// src/contexts/AnnouncementContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    const unsubscribe = adapter.subscribeToAnnouncements((data) => {
      setAnnouncements(data);
      if (loading) setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter, loading]);

  return <AnnouncementContext.Provider value={{ announcements, loading }}>{children}</AnnouncementContext.Provider>;
};

export const useAnnouncementContext = () => {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error('useAnnouncementContext must be used within an AnnouncementProvider');
  return context;
};