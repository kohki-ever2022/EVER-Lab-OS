import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../types/chat';
import { MessageItem } from './MessageItem'; // Assuming MessageItem will be created

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
  onPinMessage: (messageId: string) => void;
  onUnpinMessage: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, loading, error, onPinMessage, onUnpinMessage }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><p>Loading messages...</p></div>;
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-red-500">Error: {error.message}</p></div>;
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(msg => (
        <MessageItem 
          key={msg.id} 
          message={msg} 
          onPin={() => onPinMessage(msg.id)}
          onUnpin={() => onUnpinMessage(msg.id)}
        />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
