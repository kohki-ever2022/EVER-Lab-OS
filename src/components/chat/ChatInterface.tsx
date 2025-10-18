// src/components/chat/ChatInterface.tsx
import React, { useState, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatRoom } from './ChatRoom';
import { useDataAdapter } from '../../hooks/useDataAdapter'; // Corrected import
import { useAuth } from '../../hooks/useAuth';

const ChatInterface: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const adapter = useDataAdapter();
  const { user } = useAuth();

  useEffect(() => {
    if (selectedRoomId && user) {
      adapter.updateLastRead(selectedRoomId, user.id);
    }
  }, [selectedRoomId, user, adapter]);

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-lg shadow-xl overflow-hidden">
      <ChatSidebar selectedRoomId={selectedRoomId} onRoomSelect={setSelectedRoomId} />
      <div className="w-full md:w-2/3 flex flex-col">
        {selectedRoomId ? (
          <ChatRoom roomId={selectedRoomId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
