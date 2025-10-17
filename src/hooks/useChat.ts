import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { dataAdapter } from '../config/adapterFactory';
import type { ChatMessage } from '../types/chat';
import { escapeHtml } from '../utils/textUtils';

export const useChat = (roomId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    const unsubscribe = dataAdapter.subscribeToChatMessages(roomId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = useCallback(async (content: string, type: ChatMessage['type'] = 'TEXT') => {
    if (!user || !content.trim()) return;

    const message: Omit<ChatMessage, 'id' | 'createdAt' | 'updatedAt'> = {
      roomId,
      senderId: user.id,
      senderName: user.name || 'Unknown',
      senderAvatar: user.imageUrl || undefined,
      content: escapeHtml(content.trim()),
      type,
      isEdited: false,
      isPinned: false,
    };

    const result = await dataAdapter.sendChatMessage(message);
    if (!result.success) {
      setError(result.error as Error);
    }
  }, [roomId, user]);

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
};