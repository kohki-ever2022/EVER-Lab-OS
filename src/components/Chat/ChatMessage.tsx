import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import type { ChatMessage as ChatMessageType } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwnMessage = user?.id === message.senderId;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* アバター */}
        {!isOwnMessage && (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
            {message.senderAvatar ? (
              <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                {message.senderName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* メッセージ本体 */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {!isOwnMessage && (
            <span className="text-sm text-gray-600 mb-1">{message.senderName}</span>
          )}
          
          <div className={`px-4 py-2 rounded-lg ${
            isOwnMessage 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          
          <span className="text-xs text-gray-500 mt-1">
            {format(new Date(message.createdAt), 'HH:mm', { locale: ja })}
            {message.isEdited && ' (編集済み)'}
          </span>
        </div>
      </div>
    </div>
  );
};