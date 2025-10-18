import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { ChatRoom } from '../types/chat';

export const useChatRooms = () => {
  const { user } = useAuth();
  const adapter = useDataAdapter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = adapter.subscribeToChatRooms(user.id, (roomsResult) => {
      if (roomsResult.success) {
        setChatRooms(roomsResult.data);
        setError(null);
      } else {
        setError(roomsResult.error || new Error('Failed to fetch chat rooms.'));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, adapter]);

  return { chatRooms, loading, error };
};
