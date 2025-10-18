
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDataAdapter } from '../../contexts/DataAdapterContext';
import { ChatRoom as ChatRoomType, ChatMessage } from '../../types/chat';
import { getOtherMemberInfo } from '../../utils/chatUtils';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { PinnedMessagesBar } from './PinnedMessagesBar'; // Import PinnedMessagesBar
import { Pin } from 'lucide-react';

interface ChatRoomProps {
  activeRoom: ChatRoomType;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ activeRoom }) => {
  const { user } = useAuth();
  const adapter = useDataAdapter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showPinned, setShowPinned] = useState(false); // State to toggle PinnedMessagesBar

  useEffect(() => {
    if (!activeRoom || !user) return;

    setLoading(true);
    const unsubscribe = adapter.subscribeToChatMessages(activeRoom.id, (newMessages) => {
      setMessages(newMessages);
      setError(null);
      setLoading(false);
    });

    adapter.updateLastRead(activeRoom.id, user.uid);

    return () => unsubscribe();
  }, [activeRoom, user, adapter]);

  const handleSendMessage = async (content: string) => {
    if (!user || !activeRoom) return;
    const newMessage: Omit<ChatMessage, 'id' | 'createdAt' | 'updatedAt'> = {
      roomId: activeRoom.id,
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      senderAvatar: user.photoURL,
      content,
      type: 'TEXT',
      isEdited: false,
      isPinned: false,
    };
    await adapter.sendChatMessage(newMessage);
  };
  
  const handlePinMessage = async (messageId: string) => {
    await adapter.pinMessage(activeRoom.id, messageId);
  };
  
  const handleUnpinMessage = async (messageId: string) => {
    await adapter.unpinMessage(activeRoom.id, messageId);
  };

  if (!activeRoom || !user) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl text-gray-500">Select a chat to start messaging</h2>
        </div>
      </div>
    );
  }

  const otherMember = getOtherMemberInfo(activeRoom, user.uid);
  const chatName = activeRoom.isGroup ? activeRoom.name : otherMember?.name || 'Chat';
  const chatAvatar = activeRoom.isGroup ? undefined : otherMember?.avatar;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <header className="flex items-center p-4 border-b border-gray-200">
        {chatAvatar && <img src={chatAvatar} alt={chatName} className="w-10 h-10 rounded-full mr-4" />}
        {!chatAvatar && <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-4 font-bold text-gray-600">{chatName.charAt(0)}</div>}
        <h2 className="text-xl font-semibold flex-1">{chatName}</h2>
        <button onClick={() => setShowPinned(!showPinned)} className="text-gray-500 hover:text-gray-800 p-2">
          <Pin size={20} />
        </button>
      </header>
      
      {showPinned && <PinnedMessagesBar roomId={activeRoom.id} onClose={() => setShowPinned(false)} />}

      <MessageList 
        messages={messages} 
        loading={loading} 
        error={error}
        onPinMessage={handlePinMessage}
        onUnpinMessage={handleUnpinMessage}
      />
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};
