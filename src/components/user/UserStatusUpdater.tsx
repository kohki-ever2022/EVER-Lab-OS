import React, { useState } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useUserActions } from '../../hooks/useUserActions';
import { useToast } from '../../contexts/ToastContext';
import { UserAvailabilityStatus, User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface UserStatusUpdaterProps {
  onClose: () => void;
}

const UserStatusUpdater: React.FC<UserStatusUpdaterProps> = ({ onClose }) => {
  const { currentUser } = useSessionContext();
  const { t } = useTranslation();
  const { updateUser } = useUserActions();
  const { showToast } = useToast();

  const [status, setStatus] = useState(
    currentUser?.availabilityStatus || UserAvailabilityStatus.Available
  );
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
      showToast(t('statusUpdated'), 'success');
      onClose();
    } else {
      showToast(t('statusUpdateFailed'), 'error');
    }
    setIsSaving(false);
  };

  const statusOptions = [
    {
      value: UserAvailabilityStatus.Available,
      labelKey: 'statusAvailable',
      color: 'bg-green-500',
    },
    {
      value: UserAvailabilityStatus.Busy,
      labelKey: 'statusBusy',
      color: 'bg-yellow-500',
    },
    {
      value: UserAvailabilityStatus.Away,
      labelKey: 'statusAway',
      color: 'bg-gray-400',
    },
  ] as const;

  return (
    <div className='absolute top-full right-0 mt-2 w-72 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-4 z-10'>
      <p className='font-semibold text-gray-800'>{t('updateStatus')}</p>

      <div className='mt-4 space-y-2'>
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatus(option.value)}
            className={`w-full flex items-center p-2 rounded-md text-left transition-colors ${status === option.value ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <span
              className={`w-3 h-3 rounded-full mr-3 ${option.color}`}
            ></span>
            <span className='text-sm font-medium text-gray-700'>
              {t(option.labelKey)}
            </span>
          </button>
        ))}
      </div>

      <div className='mt-4'>
        <label
          htmlFor='statusMessage'
          className='text-xs font-medium text-gray-500'
        >
          {t('statusMessage')}
        </label>
        <input
          id='statusMessage'
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('optional')}
          className='mt-1 w-full border rounded-md p-2 text-sm'
        />
      </div>

      <div className='mt-4 flex justify-end gap-2'>
        <button
          onClick={onClose}
          className='px-3 py-1 text-sm border rounded-md hover:bg-gray-100'
          disabled={isSaving}
        >
          {t('cancel')}
        </button>
        <button
          onClick={handleSave}
          className='px-3 py-1 text-sm bg-ever-blue text-white rounded-md hover:bg-ever-blue-dark disabled:bg-gray-400'
          disabled={isSaving}
        >
          {isSaving ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
};

export default UserStatusUpdater;
