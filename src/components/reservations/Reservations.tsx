import React, { useState, FormEvent, useMemo } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useToast } from '../../contexts/ToastContext';
import { useReservationActions } from '../../hooks/useReservationActions';
import { useReservations } from '../../contexts/ReservationContext';
import { useEquipment } from '../../contexts/EquipmentContext';
// FIX: import from barrel file
import { Language, Result, Reservation, ReservationStatus, Usage } from '../../types';
import Waitlist from './Waitlist';
import { useTranslation } from '../../hooks/useTranslation';

type TabType = 'current' | 'history' | 'waitlist';

const ReservationCard: React.FC<{ reservation: Reservation }> = ({ reservation }) => {
    const equipment = useEquipment();
    const { showToast } = useToast();
    const { checkOutReservation, updateReservation } = useReservationActions();
    const { t, isJapanese } = useTranslation();
    const eq = equipment.find(e => e.id === reservation.equipmentId);

    const statusMap: Record<string, { text: string, color: string }> = {
      [ReservationStatus.AwaitingCheckIn]: { text: t('statusAwaitingCheckIn'), color: 'text-blue-600' },
      [ReservationStatus.CheckedIn]: { text: t('statusInUse'), color: 'text-green-600' },
      [ReservationStatus.Completed]: { text: t('statusCompleted'), color: 'text-gray-600' },
      [ReservationStatus.Cancelled]: { text: t('statusCancelled'), color: 'text-orange-600' },
      [ReservationStatus.NoShow]: { text: t('statusNoShow'), color: 'text-red-600' },
      [ReservationStatus.Upcoming]: { text: t('statusUpcoming'), color: 'text-gray-600' },
    };
    const statusInfo = statusMap[reservation.status];

    const handleCheckIn = async () => {
        const result = await updateReservation({ ...reservation, status: ReservationStatus.CheckedIn, actualStartTime: new Date() });
        if (result.success === false) {
            showToast(`${t('checkInFailed')}: ${result.error.message}`, 'error');
        } else {
            showToast(t('checkInSuccess'), 'success');
        }
    };
    
    const handleCheckOut = async () => {
        const result = await checkOutReservation(reservation.id);
        if (result.success === false) {
            showToast(`${t('checkOutFailed')}: ${result.error.message}`, 'error');
        } else {
            showToast(t('checkOutSuccess'), 'success');
        }
    };
    
    const handleCancel = async () => {
        if (window.confirm(t('cancelReservationConfirm'))) {
            const result = await updateReservation({ ...reservation, status: ReservationStatus.Cancelled });
            if (result.success === false) {
                showToast(`${t('cancelFailed')}: ${result.error.message}`, 'error');
            } else {
                showToast(t('cancelSuccess'), 'success');
            }
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-bold">{isJapanese ? eq?.nameJP : eq?.nameEN}</h4>
            <p className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>
            <p className="text-xs text-gray-500">{new Date(reservation.startTime).toLocaleString()} - {new Date(reservation.endTime).toLocaleTimeString()}</p>
            <div className="mt-4 flex gap-2">
                {reservation.status === ReservationStatus.AwaitingCheckIn && (
                    <button onClick={handleCheckIn} className="bg-green-500 text-white px-3 py-1 text-sm rounded">
                        {t('checkIn')}
                    </button>
                )}
                {reservation.status === ReservationStatus.CheckedIn && (
                    <button onClick={handleCheckOut} className="bg-blue-500 text-white px-3 py-1 text-sm rounded">
                        {t('checkOut')}
                    </button>
                )}
                {reservation.status === ReservationStatus.AwaitingCheckIn && (
                     <button onClick={handleCancel} className="bg-red-500 text-white px-3 py-1 text-sm rounded">
                        {t('cancel')}
                    </button>
                )}
            </div>
        </div>
    );
};

const Reservations: React.FC = () => {
    const { currentUser } = useSessionContext();
    const { t } = useTranslation();
    const reservations = useReservations();
    const [activeTab, setActiveTab] = useState<TabType>('current');

    const myReservations = reservations.filter(r => r.userId === currentUser?.id);
    
    const currentReservations = myReservations.filter(r => 
        r.status === ReservationStatus.AwaitingCheckIn || 
        r.status === ReservationStatus.CheckedIn
    );
    const historyReservations = myReservations.filter(r => 
        r.status === ReservationStatus.Completed || 
        r.status === ReservationStatus.Cancelled || 
        r.status === ReservationStatus.NoShow
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-ever-black">
                {t('myReservations')}
            </h2>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('current')} className={`${activeTab === 'current' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        {t('currentReservations')} ({currentReservations.length})
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`${activeTab === 'history' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        {t('history')} ({historyReservations.length})
                    </button>
                    <button onClick={() => setActiveTab('waitlist')} className={`${activeTab === 'waitlist' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        {t('waitlist')}
                    </button>
                </nav>
            </div>

            {activeTab === 'current' && (
                currentReservations.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentReservations.map(r => <ReservationCard key={r.id} reservation={r} />)}
                    </div>
                ) : <p className="text-gray-500">{t('noCurrentReservations')}</p>
            )}

            {activeTab === 'history' && (
                 historyReservations.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {historyReservations.map(r => <ReservationCard key={r.id} reservation={r} />)}
                    </div>
                ) : <p className="text-gray-500">{t('noReservationHistory')}</p>
            )}

            {activeTab === 'waitlist' && <Waitlist />}
        </div>
    );
};

export default Reservations;
