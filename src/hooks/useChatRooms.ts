import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useDataAdapter } from '../contexts/DataAdapterContext';
import { ChatRoom } from '../types/chat';
import { Result } from '../types';

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
  
  const createRoom = useCallback(async (
      data: Omit<ChatRoom, 'id' | 'lastMessageAt' | 'createdAt' | 'updatedAt' | 'memberInfo' | 'createdBy'>
  ): Promise<string> => {
    if (!user) {
        throw new Error("User not authenticated.");
    }
    
    const result = await adapter.createChatRoom({
      ...data,
      createdBy: user.id,
      memberInfo: {}, // Should be populated by backend or trigger
    });

    if (result.success && result.data) {
        return result.data.id;
    } else {
        throw result.error || new Error("Failed to create chat room.");
    }
  }, [user, adapter]);


  return { chatRooms, loading, error, createRoom };
};
