import React, { useState, useMemo } from 'react';
import { Language, Role } from '../../types/core';
import { ReservationStatus, Reservation, MaintenanceLogStatus, EquipmentStatus, MaintenanceLog } from '../../types/equipment';
import { useSessionContext } from '../../contexts/SessionContext';
import { useLabStateContext } from '../../contexts/AppProviders';
import { useReservationContext } from '../../contexts/ReservationContext';
import { useEquipmentContext } from '../../contexts/EquipmentContext';
import { useUserContext } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useEquipmentActions } from '../../hooks/useEquipmentActions';
import { useUsageContext } from '../../contexts/UsageContext';
import { useMaintenanceLogContext } from '../../contexts/MaintenanceLogContext';
import { ClockIcon, CalendarIcon, MailIcon, ExclamationCircleIcon, CogIcon } from '../common/Icons';

interface ResultModalProps {
    title: string;
    results: string[];
    onClose: () => void;
    isJapanese: boolean;
}

const InfoCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-center">
        <div className="p-3 bg-lab-blue-light/20 rounded-full mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-lab-text">{value}</p>
        </div>
    </div>
);


const ResultModal: React.FC<ResultModalProps> = ({ title, results, onClose, isJapanese }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h4 className="text-lg font-bold text-ever-black mb-4">{title}</h4>
            <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md text-sm space-y-2">
                {results.length > 0 ? (
                    results.map((res, i) => <p key={i} className="text-gray-700">{res}</p>)
                ) : (
                    <p className="text-gray-500">{isJapanese ? '処理対象の項目はありませんでした。' : 'No items were processed.'}</p>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="bg-lab-blue text-white font-bold py-2 px-4 rounded-lg">
                    {isJapanese ? '閉じる' : 'Close'}
                </button>
            </div>
        </div>
    </div>
);


export const AdminDashboard: React.FC = () => {
    const { isJapanese, currentUser } = useSessionContext();
    const { memos } = useLabStateContext();
    const { usage } = useUsageContext();
    const { maintenanceLogs } = useMaintenanceLogContext();
    const { reservations } = useReservationContext();
    const { equipment } = useEquipmentContext();
    const { users } = useUserContext();
    const { showToast } = useToast();
    const { hasPermission } = usePermissions();
    const { emergencyStopAllEquipment } = useEquipmentActions();
    
    const [modalContent, setModalContent] = useState<{title: string, results: string[]} | null>(null);

    const maintenanceCount = useMemo(() => equipment.filter(e => e.status === EquipmentStatus.Maintenance).length, [equipment]);
    
    const todayReservations = useMemo(() => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        return reservations.filter(r => {
            const d = new Date(r.startTime);
            return d >= todayStart && d < todayEnd;
        }).length;
    }, [reservations]);

    const unreadMemos = useMemo(() => memos.filter(m => m.recipientId === currentUser?.id && !m.isRead).length, [memos, currentUser]);

    const malfunctionReports = useMemo(() => maintenanceLogs.filter(log => log.status === MaintenanceLogStatus.Reported), [maintenanceLogs]);

    const activeReservations = useMemo(() => reservations.filter(r => r.status === ReservationStatus.CheckedIn), [reservations]);


    const handleProcessNoShows = () => {
        // This is a mock implementation. Real implementation would be more complex.
        showToast(isJapanese ? 'No-Showの処理を実行しました。' : 'Processed No-Shows.', 'success');
    };

    const handleProcessAutoCheckouts = () => {
        // This is a mock implementation.
        showToast(isJapanese ? '自動チェックアウトの処理を実行しました。' : 'Processed Auto Check-outs.', 'success');
    }
    
    const handleSendReminders = () => {
        // This is a mock implementation.
        showToast(isJapanese ? 'リマインダーを送信しました。' : 'Reminders sent.', 'success');
    };

    const handleEmergencyStop = async () => {
        if (window.confirm(isJapanese ? '本当に全機器を緊急停止しますか？この操作は元に戻せません。' : 'Are you sure you want to perform an emergency stop on all equipment? This action cannot be undone.')) {
            if (emergencyStopAllEquipment) {
                const result = await emergencyStopAllEquipment();
                if (result.success === false) {
                    showToast(isJapanese ? `緊急停止に失敗しました: ${result.error.message}` : `Emergency stop failed: ${result.error.message}`, 'error');
                } else {
                    showToast(isJapanese ? '全機器を緊急停止し、ユーザーに通知しました。' : 'All equipment has been stopped and users have been notified.', 'info');
                }
            }
        }
    };

    const usageRanking = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentUsage = usage.filter(u => new Date(u.date).getTime() >= thirtyDaysAgo.getTime());
        
        const usageByEquipment = recentUsage.reduce((acc: Record<string, number>, u) => {
            acc[u.equipmentId] = (acc[u.equipmentId] || 0) + u.durationMinutes;
            return acc;
        }, {});

        return Object.entries(usageByEquipment)
            .sort(([, a], [, b]) => Number(b) - Number(a))
            .slice(0, 5)
            .map(([equipmentId, minutes]) => {
                const eq = equipment.find(e => e.id === equipmentId);
                return {
                    name: eq ? (isJapanese ? eq.nameJP : eq.nameEN) : 'Unknown',
                    hours: (Number(minutes) / 60).toFixed(1),
                };
            });
    }, [usage, equipment, isJapanese]);
    
    const timeFormat: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

    return (
        <div>
            {modalContent && <ResultModal title={modalContent.title} results={modalContent.results} onClose={() => setModalContent(null)} isJapanese={isJapanese} />}
            <h2 className="text-3xl font-bold mb-6 text-ever-black">
                {isJapanese ? '管理ダッシュボード' : 'Admin Dashboard'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <InfoCard title={isJapanese ? "進行中の予約" : "Active Reservations"} value={activeReservations.length} icon={<ClockIcon className="h-6 w-6 text-ever-blue" />} />
                <InfoCard title={isJapanese ? "本日の予約" : "Today's Bookings"} value={todayReservations} icon={<CalendarIcon className="h-6 w-6 text-ever-blue" />} />
                <InfoCard title={isJapanese ? "未読メモ" : "Unread Memos"} value={unreadMemos} icon={<MailIcon className="h-6 w-6 text-ever-blue" />} />
                <InfoCard title={isJapanese ? "不具合報告" : "Malfunction Reports"} value={malfunctionReports.length} icon={<ExclamationCircleIcon className="h-6 w-6 text-ever-blue" />} />
                <InfoCard title={isJapanese ? "メンテナンス中" : "In Maintenance"} value={maintenanceCount} icon={<CogIcon className="h-6 w-6 text-ever-blue" />} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-8">
                <h3 className="text-xl font-bold text-ever-black mb-4">{isJapanese ? '管理アクション' : 'Admin Actions'}</h3>
                <div className="flex flex-wrap gap-4">
                    {hasPermission('system', 'configureSettings') && (
                        <>
                            <button onClick={handleProcessNoShows} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg text-sm">{isJapanese ? 'No-Show処理' : 'Process No-Shows'}</button>
                            <button onClick={handleProcessAutoCheckouts} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">{isJapanese ? '自動チェックアウト処理' : 'Process Auto-Checkouts'}</button>
                            <button onClick={handleSendReminders} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm">{isJapanese ? 'リマインダー送信' : 'Send Reminders'}</button>
                        </>
                    )}
                    {currentUser?.role === Role.FacilityDirector && (
                        <button onClick={handleEmergencyStop} className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 font-bold py-2 px-4 rounded-lg text-sm">{isJapanese ? '全機器 緊急停止' : 'Emergency Stop All'}</button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">{isJapanese ? '利用率ランキング (30日)' : 'Usage Ranking (30d)'}</h3>
                    <ul className="space-y-3">
                        {usageRanking.map((item, index) => (
                            <li key={index} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-800">{item.name}</span>
                                <span className="font-semibold text-gray-600">{item.hours}h</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">{isJapanese ? '対応が必要な不具合報告' : 'Malfunction Reports Requiring Action'}</h3>
                     <ul className="space-y-3">
                        {malfunctionReports.map((log: MaintenanceLog) => {
                            const eq = equipment.find(e => e.id === log.equipmentId);
                            const user = users.find(u => u.id === log.reportedByUserId);
                            return (
                                <li key={log.id} className="p-3 bg-yellow-50 rounded-md">
                                    <p className="font-semibold text-yellow-800">{isJapanese ? eq?.nameJP : eq?.nameEN}</p>
                                    <p className="text-sm text-yellow-700 mt-1">{log.notes}</p>
                                    <p className="text-xs text-yellow-600 mt-2">{isJapanese ? '報告者:' : 'By:'} {user?.name} - {new Date(log.reportDate).toLocaleDateString()}</p>
                                </li>
                            )
                        })}
                        {malfunctionReports.length === 0 && <p className="text-sm text-gray-500">{isJapanese ? '報告はありません。' : 'No reports.'}</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;