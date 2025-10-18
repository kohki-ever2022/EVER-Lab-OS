import React from 'react';
import { X, Pin } from 'lucide-react';
import { usePinnedMessages } from '../../hooks/usePinnedMessages';
import { useDataAdapter } from '../../contexts/DataAdapterContext';
import { ChatMessage } from '../../types/chat';

interface PinnedMessagesBarProps {
  roomId: string;
  onClose: () => void;
}

export const PinnedMessagesBar: React.FC<PinnedMessagesBarProps> = ({ roomId, onClose }) => {
  const { pinnedMessages, loading, error } = usePinnedMessages(roomId);
  const adapter = useDataAdapter();

  const handleUnpin = async (messageId: string) => {
    await adapter.unpinMessage(roomId, messageId);
  };

  return (
    <div className="bg-gray-100 p-3 border-b border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-700 flex items-center">
          <Pin className="mr-2 h-5 w-5" />
          Pinned Messages
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <X size={20} />
        </button>
      </div>
      {loading && <p className="text-sm text-gray-500">Loading pinned messages...</p>}
      {error && <p className="text-sm text-red-500">Error: {error.message}</p>}
      {!loading && pinnedMessages.length === 0 && (
        <p className="text-sm text-gray-500">No messages have been pinned yet.</p>
      )}
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {pinnedMessages.map((msg) => (
          <li key={msg.id} className="text-sm bg-white p-2 rounded-md shadow-sm flex justify-between items-start">
            <div>
              <span className="font-semibold text-gray-800">{msg.senderName}: </span>
              <span className="text-gray-600">{msg.content}</span>
            </div>
            <button 
              onClick={() => handleUnpin(msg.id)}
              className="text-gray-400 hover:text-red-600 ml-2 p-1"
              title="Unpin message"
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};