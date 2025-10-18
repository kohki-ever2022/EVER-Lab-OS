import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { ChatMessage } from '../types/chat';

export const usePinnedMessages = (roomId: string) => {
  const adapter = useDataAdapter();
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) {
      setPinnedMessages([]);
      setLoading(false);
      return;
    }

    const { unsubscribe, getPinnedMessages } = adapter.subscribeToPinnedMessages(roomId, (result) => {
      if (result.success) {
        setPinnedMessages(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    // Initial fetch
    getPinnedMessages();

    return () => unsubscribe();
  }, [roomId, adapter]);

  return { pinnedMessages, loading, error };
};