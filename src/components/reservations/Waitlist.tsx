import React from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useLabStateContext } from '../../contexts/AppProviders';
import { useEquipmentContext } from '../../contexts/EquipmentContext';
import { useReservationActions } from '../../hooks/useReservationActions';

const Waitlist: React.FC = () => {
  const { isJapanese, currentUser } = useSessionContext();
  const { waitlist } = useLabStateContext();
  const { equipment } = useEquipmentContext();
  const { removeFromWaitlist } = useReservationActions();
  const userWaitlistEntries = waitlist.filter(w => w.userId === currentUser?.id && w.status === 'Pending'); // Simplified

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-4">{isJapanese ? '待機リスト' : 'Waitlist'}</h3>
      {userWaitlistEntries.length === 0 ? (
        <p className="text-gray-500">{isJapanese ? '待機中の予約はありません。' : 'You are not on any waitlists.'}</p>
      ) : (
        <ul className="space-y-4">
          {userWaitlistEntries.map(entry => {
            const eq = equipment.find(e => e.id === entry.equipmentId);
            return (
              <li key={entry.id} className="border-b pb-2">
                <p className="font-semibold">{isJapanese ? eq?.nameJP : eq?.nameEN}</p>
                <p className="text-sm text-gray-600">
                  {isJapanese ? '希望時間:' : 'Requested:'} {new Date(entry.requestedStartTime).toLocaleString()}
                </p>
                <button 
                  onClick={() => removeFromWaitlist(entry.id)} 
                  className="text-red-500 text-xs mt-1"
                >
                  {isJapanese ? 'キャンセル' : 'Cancel'}
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