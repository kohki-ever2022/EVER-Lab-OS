import React, { useState } from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { useUserActions } from '../hooks/useUserActions';
import { useToast } from '../contexts/ToastContext';
import { UserAvailabilityStatus, User } from '../types';

interface UserStatusUpdaterProps {
  onClose: () => void;
}

const UserStatusUpdater: React.FC<UserStatusUpdaterProps> = ({ onClose }) => {
  const { isJapanese, currentUser } = useSessionContext();
  const { updateUser } = useUserActions();
  const { showToast } = useToast();

  const [status, setStatus] = useState(currentUser?.availabilityStatus || UserAvailabilityStatus.Available);
  const [message, setMessage] = useState(currentUser?.statusMessage || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    const updatedUser = {
      ...currentUser,
      availabilityStatus: status,
      statusMessage: message,
    } as User;

    const result = await updateUser(updatedUser);
    if (result.success) {
      showToast(isJapanese ? 'ステータスを更新しました。' : 'Status updated.', 'success');
      onClose();
    } else {
      showToast(isJapanese ? '更新に失敗しました。' : 'Failed to update status.', 'error');
    }
    setIsSaving(false);
  };

  const statusOptions = [
    { value: UserAvailabilityStatus.Available, labelJP: 'オンライン', labelEN: 'Available', color: 'bg-green-500' },
    { value: UserAvailabilityStatus.Busy, labelJP: '取り込み中', labelEN: 'Busy', color: 'bg-yellow-500' },
    { value: UserAvailabilityStatus.Away, labelJP: '離席中', labelEN: 'Away', color: 'bg-gray-400' },
  ];

  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-4 z-10">
      <p className="font-semibold text-gray-800">{isJapanese ? 'ステータス更新' : 'Update Status'}</p>
      
      <div className="mt-4 space-y-2">
        {statusOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setStatus(option.value)}
            className={`w-full flex items-center p-2 rounded-md text-left transition-colors ${status === option.value ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <span className={`w-3 h-3 rounded-full mr-3 ${option.color}`}></span>
            <span className="text-sm font-medium text-gray-700">{isJapanese ? option.labelJP : option.labelEN}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label htmlFor="statusMessage" className="text-xs font-medium text-gray-500">{isJapanese ? 'ステータスメッセージ' : 'Status Message'}</label>
        <input
          id="statusMessage"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isJapanese ? '（任意）' : '(Optional)'}
          className="mt-1 w-full border rounded-md p-2 text-sm"
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100" disabled={isSaving}>
          {isJapanese ? 'キャンセル' : 'Cancel'}
        </button>
        <button onClick={handleSave} className="px-3 py-1 text-sm bg-ever-blue text-white rounded-md hover:bg-ever-blue-dark disabled:bg-gray-400" disabled={isSaving}>
          {isSaving ? (isJapanese ? '保存中...' : 'Saving...') : (isJapanese ? '保存' : 'Save')}
        </button>
      </div>
    </div>
  );
};

export default UserStatusUpdater;