import React from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useLabStateContext } from '../../contexts/AppProviders';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useReservationActions } from '../../hooks/useReservationActions';
import { useTranslation } from '../../hooks/useTranslation';

const Waitlist: React.FC = () => {
  const { currentUser } = useSessionContext();
  const { t, isJapanese } = useTranslation();
  const { waitlist } = useLabStateContext();
  const equipment = useEquipment();
  const { removeFromWaitlist } = useReservationActions();
  const userWaitlistEntries = waitlist.filter(
    (w) => w.userId === currentUser?.id && w.status === 'Pending'
  ); // Simplified

  return (
    <div className='bg-white p-6 rounded-lg shadow'>
      <h3 className='font-bold text-lg mb-4'>{t('waitlist')}</h3>
      {userWaitlistEntries.length === 0 ? (
        <p className='text-gray-500'>{t('noWaitlists')}</p>
      ) : (
        <ul className='space-y-4'>
          {userWaitlistEntries.map((entry) => {
            const eq = equipment.find((e) => e.id === entry.equipmentId);
            return (
              <li key={entry.id} className='border-b pb-2'>
                <p className='font-semibold'>
                  {isJapanese ? eq?.nameJP : eq?.nameEN}
                </p>
                <p className='text-sm text-gray-600'>
                  {t('requestedTime')}{' '}
                  {new Date(entry.requestedStartTime).toLocaleString()}
                </p>
                <button
                  onClick={() => removeFromWaitlist(entry.id)}
                  className='text-red-500 text-xs mt-1'
                >
                  {t('cancel')}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Waitlist;
