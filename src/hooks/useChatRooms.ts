import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { dataAdapter } from '../config/adapterFactory';
import type { ChatRoom } from '../types/chat';
import { ChatRoomType } from '../types/chat';

export const useChatRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = dataAdapter.subscribeToChatRooms(user.id, (newRooms) => {
      setRooms(newRooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createRoom = useCallback(async (
    type: ChatRoomType,
    name: string,
    memberIds: string[],
    metadata?: ChatRoom['metadata']
  ) => {
    if (!user) return;

    const roomData: Omit<ChatRoom, 'id'> = {
      type,
      name,
      memberIds: [user.id, ...memberIds],
      createdBy: user.id,
      createdAt: new Date(),
      lastMessageAt: new Date(),
      metadata: metadata || {},
    };

    return await dataAdapter.createChatRoom(roomData);
  }, [user]);

  return {
    rooms,
    loading,
    createRoom,
  };
};