import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, MessageSquare, X } from 'lucide-react';
import { ChatRoom } from './ChatRoom';
import { CreateChatRoomModal } from './CreateChatRoomModal';
import { useChatRooms } from '../../hooks/useChatRooms';
import { ChatRoomListItem } from './ChatRoomListItem';
import { useAuth } from '../../hooks/useAuth';
import { useDataAdapter } from '../../contexts/DataAdapterContext';

export const ChatInterface: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { chatRooms, isLoading } = useChatRooms();
  const { currentUser } = useAuth();
  const dataAdapter = useDataAdapter();

  useEffect(() => {
    if (selectedRoomId && currentUser) {
      dataAdapter.updateLastRead(selectedRoomId, currentUser.id);
    }
  }, [selectedRoomId, currentUser, dataAdapter]);

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return chatRooms;

    const query = searchQuery.toLowerCase();
    return chatRooms.filter(room =>
      room.name.toLowerCase().includes(query)
    );
  }, [chatRooms, searchQuery]);

  const handleRoomSelect = (roomId: string) => {
      setSelectedRoomId(roomId);
  }

  const handleSuccess = (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <div className="flex h-[calc(100vh-10rem)] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 flex flex-col border-r border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
             <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={20} />
                新しいチャット
              </button>
          </div>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="チャットを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-800">
                      <X size={18} />
                  </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">読み込み中...</div>
            ) : filteredRooms.length > 0 ? (
                filteredRooms.map(room => (
                    <ChatRoomListItem
                        key={room.id}
                        room={room}
                        isSelected={selectedRoomId === room.id}
                        onSelect={() => handleRoomSelect(room.id)}
                    />
                ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2 font-semibold">
                  {searchQuery ? '該当するチャットが見つかりません' : 'チャットルームがありません'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-blue-600 hover:underline"
                  >
                    新しいチャットを作成
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="w-full md:w-2/3 flex flex-col">
          {selectedRoomId ? (
            <ChatRoom roomId={selectedRoomId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-100">
               <MessageSquare className="w-20 h-20 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-1 text-gray-600">チャットへようこそ</h2>
              <p>チャットルームを選択または作成して、</p>
              <p>コミュニケーションを始めましょう。</p>
            </div>
          )}
        </div>
      </div>
      
      <CreateChatRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default ChatInterface;
