import React from 'react';
import { ChatRoom } from '../../types/chat';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatRoomListItemProps {
  room: ChatRoom;
  isSelected: boolean;
  onSelect: () => void;
}

export const ChatRoomListItem: React.FC<ChatRoomListItemProps> = ({ room, isSelected, onSelect }) => {
  const { user } = useAuth();
  const { isJapanese } = useTranslation();

  const lastRead = user && room.lastRead ? room.lastRead[user.id] : null;
  const hasUnread = lastRead ? new Date(lastRead) < new Date(room.lastMessageAt) : true;

  return (
    <div
      onClick={onSelect}
      className={`p-4 cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''}`}>
      <div className="flex justify-between items-start">
        <div className={`font-semibold text-gray-800 ${hasUnread && !isSelected ? 'font-bold' : ''}`}>
          {room.name}
        </div>
        {hasUnread && !isSelected && (
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5"></div>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {new Date(room.lastMessageAt).toLocaleString(isJapanese ? 'ja-JP' : 'en-US', {
          dateStyle: 'short',
          timeStyle: 'short',
        })}
      </div>
    </div>
  );
};