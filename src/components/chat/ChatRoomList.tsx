import React from 'react';
import { ChatRoom } from '../../types/chat';
import { ChatRoomListItem } from './ChatRoomListItem';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({ rooms, selectedRoomId, onRoomSelect }) => {
  return (
    <div className="divide-y">
      {rooms.map(room => (
        <ChatRoomListItem
          key={room.id}
          room={room}
          isSelected={selectedRoomId === room.id}
          onSelect={() => onRoomSelect(room.id)}
        />
      ))}
    </div>
  );
};