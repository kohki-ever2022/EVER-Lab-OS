import React from 'react';
import { useChatRooms } from '../../hooks/useChatRooms';
import { ChatRoomList } from './ChatRoomList';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatSidebarProps {
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ selectedRoomId, onRoomSelect }) => {
  const { chatRooms, loading, error } = useChatRooms();
  const { t } = useTranslation();

  return (
    <div className="w-full md:w-1/3 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b bg-white flex-shrink-0">
        <h2 className="text-xl font-bold">{t('messages')}</h2>
      </div>
      <div className="overflow-y-auto">
        {loading && <p className="p-4">Loading rooms...</p>}
        {error && <p className="p-4 text-red-500">{error.message}</p>}
        {!loading && !error && (
          <ChatRoomList
            rooms={chatRooms}
            selectedRoomId={selectedRoomId}
            onRoomSelect={onRoomSelect}
          />
        )}
      </div>
    </div>
  );
};