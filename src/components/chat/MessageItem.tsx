import React, { useState } from 'react';
import { ChatMessage } from '../../types/chat';
import { useAuth } from '../../hooks/useAuth';
import { Pin, Trash2, MoreHorizontal } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
  onPin: () => void;
  onUnpin: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onPin, onUnpin }) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isSender = user?.uid === message.senderId;

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={`flex items-end gap-2 ${isSender ? 'justify-end' : ''}`}>
        {!isSender && (
          <img src={message.senderAvatar || ''} alt={message.senderName} className="w-8 h-8 rounded-full" />
        )}
        <div 
          className={`relative max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg shadow ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
          {!isSender && <p className="text-sm font-semibold mb-1">{message.senderName}</p>}
          <p>{message.content}</p>
          {message.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
          {message.isPinned && <Pin className="absolute top-1 right-1 h-4 w-4 text-yellow-400" />}

          <div className="absolute top-1 right-1">
            <button onClick={handleToggleMenu} className="focus:outline-none">
                <MoreHorizontal size={16} />
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <ul className="py-1">
                        <li>
                            <button onClick={() => message.isPinned ? onUnpin() : onPin()} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                {message.isPinned ? 'Unpin Message' : 'Pin Message'}
                            </button>
                        </li>
                        {/* Add other options like delete later */}
                    </ul>
                </div>
            )}
        </div>

        </div>
      </div>
  );
};
