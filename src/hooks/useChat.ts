import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { dataAdapter } from '../config/adapterFactory';
import type { ChatMessage } from '../types/chat';
import { escapeHtml } from '../utils/textUtils';

// The payload for sending a message, which can include content and/or file info.
interface SendMessagePayload {
  content: string;
  file?: {
    url: string;
    name: string;
    size: number;
  } | null;
}

export const useChat = (roomId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    const unsubscribe = dataAdapter.subscribeToChatMessages(
      roomId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = useCallback(
    async (payload: SendMessagePayload) => {
      if (!user || (!payload.content.trim() && !payload.file)) return;

      const message: Omit<ChatMessage, 'id' | 'createdAt' | 'updatedAt'> = {
        roomId,
        senderId: user.id,
        senderName: user.name || 'Unknown',
        senderAvatar: user.imageUrl || undefined,
        content: escapeHtml(payload.content.trim()),
        type: payload.file ? 'FILE' : 'TEXT',
        isEdited: false,
        isPinned: false,
        fileUrl: payload.file?.url,
        fileName: payload.file?.name,
        fileSize: payload.file?.size,
      };

      const result = await dataAdapter.sendChatMessage(message);
      if (!result.success) {
        setError(result.error as Error);
      }
    },
    [roomId, user]
  );

  const updateMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!roomId) return;
      const result = await dataAdapter.updateChatMessage(
        roomId,
        messageId,
        escapeHtml(newContent)
      );
      if (!result.success) {
        setError(result.error as Error);
      }
    },
    [roomId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!roomId) return;
      const result = await dataAdapter.deleteChatMessage(roomId, messageId);
      if (!result.success) {
        setError(result.error as Error);
      }
    },
    [roomId]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
};
