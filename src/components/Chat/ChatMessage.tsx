import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Download, File as FileIcon, Image as ImageIcon, SmilePlus, Send, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import type { ChatMessage as ChatMessageType } from '../../types/chat';
import { MessageEditOptions } from './MessageEditOptions';
import { unescapeHtml } from '../../utils/textUtils';

interface ChatMessageProps {
  message: ChatMessageType;
}

const QUICK_REACTIONS = ['👍', '😊', '❤️', '😂', '🎉'];

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return <ImageIcon className="w-8 h-8 text-gray-500" />;
  }
  return <FileIcon className="w-8 h-8 text-gray-500" />;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const { updateMessage, deleteMessage, addReaction, removeReaction } = useChat(message.roomId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(unescapeHtml(message.content || ''));
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const isOwnMessage = user?.id === message.senderId;
  const reactions = message.reactions || {};

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.style.height = 'auto';
      editInputRef.current.style.height = `${editInputRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleUpdate = () => {
    if (editedContent.trim() && editedContent.trim() !== message.content) {
      updateMessage(message.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMessage(message.id);
  };

  const handleReactionClick = (emoji: string) => {
    if (!user) return;
    const hasReacted = reactions[emoji]?.includes(user.id);
    if (hasReacted) {
      removeReaction(message.id, emoji, user.id);
    } else {
      addReaction(message.id, emoji, user.id);
    }
    setShowReactionPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedContent(message.content || '');
    }
  };

  const renderFileContent = () => {
    if (!message.fileUrl || !message.fileName || !message.fileSize) return null;
    const isImageFile = message.type === 'FILE' && message.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImageFile) {
      return (
        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block">
          <img src={message.fileUrl} alt={message.fileName} className="max-w-xs max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity" />
        </a>
      );
    }

    return (
      <div className="mt-2 p-3 bg-gray-200/50 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">{getFileIcon(message.fileName)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{message.fileName}</p>
            <p className="text-xs text-gray-600">{`${(message.fileSize / 1024 / 1024).toFixed(2)} MB`}</p>
          </div>
          <a href={message.fileUrl} download={message.fileName} target="_blank" rel="noopener noreferrer" className="ml-3 p-2 text-gray-600 hover:text-blue-700 transition-colors" aria-label={`Download ${message.fileName}`}>
            <Download className="w-5 h-5" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className={`group relative flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwnMessage && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
             {message.senderAvatar ? (
              <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-semibold bg-gray-400">{message.senderName.charAt(0).toUpperCase()}</div>
            )}
          </div>
        )}

        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {!isOwnMessage && <span className="text-sm text-gray-600 mb-1">{message.senderName}</span>}
          
          {isEditing && isOwnMessage ? (
            <div className="w-full">
              <textarea
                ref={editInputRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                rows={1}
              />
              <div className="text-xs text-gray-500 mt-1">
                Press Enter to save, Esc to cancel
              </div>
            </div>
          ) : (
            <div className={`px-4 py-2 rounded-lg ${isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
              {message.type === 'FILE' && renderFileContent()}
            </div>
          )}

          <span className="text-xs text-gray-500 mt-1">
            {format(new Date(message.createdAt), 'HH:mm', { locale: ja })}
            {message.isEdited && !isEditing && ' (edited)'}
          </span>
        </div>
      </div>

      {/* Reactions Display */}
      {Object.keys(reactions).length > 0 && (
        <div className={`flex items-center space-x-1 absolute -bottom-5 ${isOwnMessage ? 'right-2' : 'left-12'}`}>
          {Object.entries(reactions).map(([emoji, userIds]) => (
            <div key={emoji} onClick={() => handleReactionClick(emoji)} className={`flex items-center bg-white border rounded-full px-2 py-0.5 cursor-pointer hover:bg-gray-100 transition-colors text-xs ${userIds.includes(user?.id || '') ? 'border-blue-500 bg-blue-100/50' : 'border-gray-200'}`}>
              <span>{emoji}</span>
              <span className="ml-1 font-semibold text-gray-700">{userIds.length}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons (Reaction & Edit/Delete) */}
      {!isEditing && (
        <div className={`absolute top-0 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwnMessage ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'}`}>
           <div className="relative">
              <button onClick={() => setShowReactionPicker(!showReactionPicker)} className="p-1 bg-white border rounded-full shadow-sm hover:bg-gray-100">
                  <SmilePlus className="w-4 h-4 text-gray-600" />
              </button>
              {showReactionPicker && (
                  <div onMouseLeave={() => setShowReactionPicker(false)} className="absolute bottom-full mb-1 flex space-x-1 bg-white border rounded-full p-1 shadow-lg">
                      {QUICK_REACTIONS.map(emoji => (
                          <button key={emoji} onClick={() => handleReactionClick(emoji)} className="p-1.5 text-lg rounded-full hover:bg-gray-200 transition-colors">
                              {emoji}
                          </button>
                      ))}
                  </div>
              )}
          </div>
          {isOwnMessage && (
              <MessageEditOptions onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
          )}
        </div>
      )}
    </div>
  );
};