import React, { useState, FormEvent, useMemo } from 'react';
import { useSessionContext } from '../../contexts/SessionContext';
import { useToast } from '../../contexts/ToastContext';
import { useReservationActions } from '../../hooks/useReservationActions';
import { useReservationContext } from '../../contexts/ReservationContext';
import { useEquipmentContext } from '../../contexts/EquipmentContext';

import { Language, Result } from '../../types/core';
import { Reservation, ReservationStatus, Usage } from '../../types/equipment';
import Waitlist from './Waitlist';

type TabType = 'current' | 'history' | 'waitlist';

const statusMap: Record<string, { textJP: string, textEN: string, color: string }> = {
    [ReservationStatus.AwaitingCheckIn]: { textJP: 'チェックイン待ち', textEN: 'Awaiting Check-in', color: 'text-blue-600' },
    [ReservationStatus.CheckedIn]: { textJP: '利用中', textEN: 'In Use', color: 'text-green-600' },
    [ReservationStatus.Completed]: { textJP: '完了', textEN: 'Completed', color: 'text-gray-600' },
    [ReservationStatus.Cancelled]: { textJP: 'キャンセル済み', textEN: 'Cancelled', color: 'text-orange-600' },
    [ReservationStatus.NoShow]: { textJP: 'No-Show', textEN: 'No-Show', color: 'text-red-600' },
    [ReservationStatus.Upcoming]: { textJP: '今後の予定', textEN: 'Upcoming', color: 'text-gray-600' },
};

const ReservationCard: React.FC<{ reservation: Reservation }> = ({ reservation }) => {
    const { isJapanese } = useSessionContext();
    const { equipment } = useEquipmentContext();
    const { showToast } = useToast();
    const { checkOutReservation, updateReservation } = useReservationActions();
    const eq = equipment.find(e => e.id === reservation.equipmentId);
    const statusInfo = statusMap[reservation.status];

    const handleCheckIn = async () => {
        const result = await updateReservation({ ...reservation, status: ReservationStatus.CheckedIn, actualStartTime: new Date() });
        if (result.success === false) {
            showToast(isJapanese ? `チェックインに失敗: ${result.error.message}` : `Check-in failed: ${result.error.message}`, 'error');
        } else {
            showToast(isJapanese ? 'チェックインしました。' : 'Checked in successfully.', 'success');
        }
    };
    
    const handleCheckOut = async () => {
        const result = await checkOutReservation(reservation.id);
        if (result.success === false) {
            showToast(isJapanese ? `チェックアウトに失敗: ${result.error.message}` : `Check-out failed: ${result.error.message}`, 'error');
        } else {
            showToast(isJapanese ? 'チェックアウトしました。' : 'Checked out successfully.', 'success');
        }
    };
    
    const handleCancel = async () => {
        if (window.confirm(isJapanese ? 'この予約をキャンセルしますか？' : 'Are you sure you want to cancel this reservation?')) {
            const result = await updateReservation({ ...reservation, status: ReservationStatus.Cancelled });
            if (result.success === false) {
                showToast(isJapanese ? `キャンセルに失敗: ${result.error.message}` : `Cancellation failed: ${result.error.message}`, 'error');
            } else {
                showToast(isJapanese ? '予約をキャンセルしました。' : 'Reservation cancelled.', 'success');
            }
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-bold">{isJapanese ? eq?.nameJP : eq?.nameEN}</h4>
            <p className={`text-sm font-semibold ${statusInfo.color}`}>{isJapanese ? statusInfo.textJP : statusInfo.textEN}</p>
            <p className="text-xs text-gray-500">{new Date(reservation.startTime).toLocaleString()} - {new Date(reservation.endTime).toLocaleTimeString()}</p>
            <div className="mt-4 flex gap-2">
                {reservation.status === ReservationStatus.AwaitingCheckIn && (
                    <button onClick={handleCheckIn} className="bg-green-500 text-white px-3 py-1 text-sm rounded">
                        {isJapanese ? 'チェックイン' : 'Check-in'}
                    </button>
                )}
                {reservation.status === ReservationStatus.CheckedIn && (
                    <button onClick={handleCheckOut} className="bg-blue-500 text-white px-3 py-1 text-sm rounded">
                        {isJapanese ? 'チェックアウト' : 'Check-out'}
                    </button>
                )}
                {reservation.status === ReservationStatus.AwaitingCheckIn && (
                     <button onClick={handleCancel} className="bg-red-500 text-white px-3 py-1 text-sm rounded">
                        {isJapanese ? 'キャンセル' : 'Cancel'}
                    </button>
                )}
            </div>
        </div>
    );
};

const Reservations: React.FC = () => {
    const { currentUser, isJapanese } = useSessionContext();
    const { reservations } = useReservationContext();
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
                {isJapanese ? '予約管理' : 'My Reservations'}
            </h2>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('current')} className={`${activeTab === 'current' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        {isJapanese ? '現在の予約' : 'Current Reservations'} ({currentReservations.length})
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`${activeTab === 'history' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        {isJapanese ? '履歴' : 'History'} ({historyReservations.length})
                    </button>
                    <button onClick={() => setActiveTab('waitlist')} className={`${activeTab === 'waitlist' ? 'border-ever-blue text-ever-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        {isJapanese ? '待機リスト' : 'Waitlist'}
                    </button>
                </nav>
            </div>

            {activeTab === 'current' && (
                currentReservations.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {currentReservations.map(r => <ReservationCard key={r.id} reservation={r} />)}
                    </div>
                ) : <p className="text-gray-500">{isJapanese ? '現在の予約はありません。' : 'No current reservations.'}</p>
            )}

            {activeTab === 'history' && (
                 historyReservations.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {historyReservations.map(r => <ReservationCard key={r.id} reservation={r} />)}
                    </div>
                ) : <p className="text-gray-500">{isJapanese ? '予約履歴はありません。' : 'No reservation history.'}</p>
            )}

            {activeTab === 'waitlist' && <Waitlist />}
        </div>
    );
};

export default Reservations;
