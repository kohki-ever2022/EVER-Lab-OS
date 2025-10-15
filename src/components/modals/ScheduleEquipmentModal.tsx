// src/components/modals/ScheduleEquipmentModal.tsx
import React, { useMemo } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useReservations } from '../../contexts/ReservationContext';
import { useUsers } from '../../contexts/UserContext';
import { Equipment, ReservationStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface ScheduleEquipmentModalProps {
    equipment: Equipment;
    onClose: () => void;
}

const ScheduleEquipmentModal: React.FC<ScheduleEquipmentModalProps> = ({ equipment, onClose }) => {
    const { t, isJapanese } = useTranslation();
    const reservations = useReservations();
    const users = useUsers();

    const upcomingReservations = useMemo(() => {
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        return reservations
            .filter(r => 
                r.equipmentId === equipment.id &&
                r.status !== ReservationStatus.Cancelled &&
                new Date(r.startTime) < sevenDaysFromNow &&
                new Date(r.endTime) > now
            )
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [reservations, equipment.id]);

    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl modal-content max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{t('scheduleFor')} {isJapanese ? equipment.nameJP : equipment.nameEN}</h3>
                
                <div className="flex-grow overflow-y-auto pr-2">
                    {upcomingReservations.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingReservations.map(res => (
                                <div key={res.id} className="p-3 bg-gray-50 rounded-md border-l-4 border-ever-blue">
                                    <p className="font-semibold text-gray-800">{getUserName(res.userId)}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(res.startTime).toLocaleString(isJapanese ? 'ja-JP' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
                                        {' - '}
                                        {new Date(res.endTime).toLocaleString(isJapanese ? 'ja-JP' : 'en-US', { timeStyle: 'short' })}
                                    </p>
                                    {res.status === ReservationStatus.CheckedIn && (
                                         <span className="mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                             {t('statusInUse')}
                                         </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>{t('noReservationsNext7Days')}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleEquipmentModal;