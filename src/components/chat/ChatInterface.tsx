// src/components/chat/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUserContext } from '../../contexts/UserContext';
import { useDataAdapter } from '../../contexts/DataAdapterContext';
import { useToast } from '../../contexts/ToastContext';
import { ChatRoom, ChatMessage } from '../../types/chat';
import { SendIcon } from '../common/Icons';

export const ChatInterface: React.FC = () => {
  const { currentUser, isJapanese } = useSessionContext();
  const { users } = useUserContext();
  const adapter = useDataAdapter();
  const { showToast } = useToast();
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to chat rooms
  useEffect(() => {
    if (!currentUser || !adapter.subscribeToChatRooms) return;
    
    const unsubscribe = adapter.subscribeToChatRooms(currentUser.id, (rooms) => {
      setChatRooms(rooms);
    });
    return () => unsubscribe();
  }, [currentUser, adapter]);

  // Subscribe to messages for the selected room
  useEffect(() => {
    if (!selectedRoomId || !currentUser || !adapter.subscribeToChatMessages) {
        setMessages([]);
        return;
    };
    
    // Mark messages as read when opening a room
    const room = chatRooms.find(r => r.id === selectedRoomId);
    if (room && room.unreadCount[currentUser.id] > 0) {
        adapter.markMessageAsRead(selectedRoomId, currentUser.id);
    }
    
    const unsubscribe = adapter.subscribeToChatMessages(selectedRoomId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [selectedRoomId, adapter, currentUser, chatRooms]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoomId || !currentUser || !adapter.sendChatMessage) return;

    const result = await adapter.sendChatMessage({
      roomId: selectedRoomId,
      senderId: currentUser.id,
      content: newMessage,
      createdAt: new Date(), // Pass client time; Firebase will overwrite with server time
    });

    if (result.success === false) {
        showToast(isJapanese ? `メッセージの送信に失敗しました: ${result.error.message}` : `Failed to send message: ${result.error.message}`, 'error');
    } else {
      setNewMessage('');
    }
  };
  
  const getSenderName = (senderId: string) => users.find(u => u.id === senderId)?.name || 'Unknown User';
  const getSenderAvatar = (senderId: string) => users.find(u => u.id === senderId)?.imageUrl;


  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Left sidebar: Chat room list */}
      <div className="w-full md:w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white flex-shrink-0">
          <h2 className="text-xl font-bold">
            {isJapanese ? 'チャット' : 'Messages'}
          </h2>
        </div>
        <div className="overflow-y-auto">
          <div className="divide-y">
            {chatRooms.map(room => (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`p-4 cursor-pointer hover:bg-gray-100 ${
                  selectedRoomId === room.id ? 'bg-ever-blue-light' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-800">{room.subject}</div>
                  {room.unreadCount[currentUser!.id] > 0 && (
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {room.unreadCount[currentUser!.id]}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 truncate">{room.lastMessage}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(room.lastMessageAt).toLocaleString(isJapanese ? 'ja-JP' : 'en-US', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right panel: Chat messages */}
      <div className="w-full md:w-2/3 flex flex-col">
        {selectedRoomId ? (
          <>
            <div className="p-4 border-b flex-shrink-0">
              <h3 className="font-bold">{chatRooms.find(r => r.id === selectedRoomId)?.subject}</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser.id;
                  const senderName = getSenderName(msg.senderId);
                  const senderAvatar = getSenderAvatar(msg.senderId);

                  return (
                    <div key={msg.id || index} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                       <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
                          {senderAvatar ? <img src={senderAvatar} alt={senderName} className="w-full h-full rounded-full object-cover" /> : senderName.charAt(0)}
                       </div>
                      <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${isMe ? 'bg-ever-blue text-white' : 'bg-gray-200'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <div className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                           {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="p-4 border-t bg-white flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isJapanese ? "メッセージを入力..." : "Type a message..."}
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ever-blue"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-ever-blue text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>{isJapanese ? 'チャットを選択してください' : 'Select a chat to start messaging'}</p>
          </div>
        )}
      </div>
    </div>
  );
};