// src/contexts/AnnouncementContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Announcement } from '../types';
import { useDataAdapter } from './DataAdapterContext';

const AnnouncementsDataContext = createContext<Announcement[]>([]);
const AnnouncementsLoadingContext = createContext<boolean>(true);

export const AnnouncementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const adapter = useDataAdapter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adapter.subscribeToAnnouncements((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [adapter]);

  return (
    <AnnouncementsDataContext.Provider value={announcements}>
      <AnnouncementsLoadingContext.Provider value={loading}>
        {children}
      </AnnouncementsLoadingContext.Provider>
    </AnnouncementsDataContext.Provider>
  );
};

export const useAnnouncements = () => {
  const context = useContext(AnnouncementsDataContext);
  if (context === undefined) {
    throw new Error(
      'useAnnouncements must be used within an AnnouncementProvider'
    );
  }
  return context;
};
