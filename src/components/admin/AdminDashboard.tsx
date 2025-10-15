import React, { useState, useMemo } from 'react';
// FIX: import from barrel file
import { Language, Role } from '../../types';
// FIX: import from barrel file
import { ReservationStatus, Reservation, MaintenanceLogStatus, EquipmentStatus, MaintenanceLog } from '../../types';
import { useSessionContext } from '../../contexts/SessionContext';
import { useLabStateContext } from '../../contexts/AppProviders';
import { useReservations } from '../../contexts/ReservationContext';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useUsers } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useEquipmentActions } from '../../hooks/useEquipmentActions';
import { useUsageContext } from '../../contexts/UsageContext';
import { useMaintenanceLogContext } from '../../contexts/MaintenanceLogContext';
import { ClockIcon, CalendarIcon, MailIcon, ExclamationCircleIcon, CogIcon } from '../common/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface ResultModalProps {
    title: string;
    results: string[];
    onClose: () => void;
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


const ResultModal: React.FC<ResultModalProps> = ({ title, results, onClose }) => {
    const { t } = useTranslation();
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h4 className="text-lg font-bold text-ever-black mb-4">{title}</h4>
            <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md text-sm space-y-2">
                {results.length > 0 ? (
                    results.map((res, i) => <p key={i} className="text-gray-700">{res}</p>)
                ) : (
                    <p className="text-gray-500">{t('noItemsToProcess')}</p>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="bg-lab-blue text-white font-bold py-2 px-4 rounded-lg">
                    {t('close')}
                </button>
            </div>
        </div>
    </div>
)};


export const AdminDashboard: React.FC = () => {
    const { currentUser } = useSessionContext();
    const { t, isJapanese } = useTranslation();
    const { memos } = useLabStateContext();
    const { usage } = useUsageContext();
    const { maintenanceLogs } = useMaintenanceLogContext();
    const reservations = useReservations();
    const equipment = useEquipment();
    const users = useUsers();
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
        showToast(t('noShowProcessed'), 'success');
    };

    const handleProcessAutoCheckouts = () => {
        // This is a mock implementation.
        showToast(t('autoCheckoutProcessed'), 'success');
    }
    
    const handleSendReminders = () => {
        // This is a mock implementation.
        showToast(t('remindersSent'), 'success');
    };

    const handleEmergencyStop = async () => {
        if (window.confirm(t('emergencyStopConfirm'))) {
            if (emergencyStopAllEquipment) {
                const result = await emergencyStopAllEquipment();
                if (result.success === false) {
                    showToast(t('emergencyStopFailed') + `: ${result.error.message}`, 'error');
                } else {
                    showToast(t('emergencyStopSuccess'), 'info');
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
    
    return (
        <div>
            {modalContent && <ResultModal title={modalContent.title} results={modalContent.results} onClose={() => setModalContent(null)} />}
            <h2 className="text-3xl font-bold mb-6 text-ever-black">
                {t('adminDashboard')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <InfoCard title={t('activeReservations')} value={activeReservations.length} icon={<ClockIcon className="h-6 w-6 text-ever-blue" />} />
                <InfoCard title={t('todaysBookings')} value={todayReservations} icon={<CalendarIcon className="h-6 w-6 text-ever-blue" />} />
                <InfoCard title={t('unreadMemos')} value={unreadMemos} icon={<MailIcon className="h-6 w-6 text-ever-blue" />} />
                <InfoCard title={t('malfunctionReports')} value={malfunctionReports.length} icon={<ExclamationCircleIcon className="h-6 w-6 text-ever-blue" />} />
                <InfoCard title={t('inMaintenance')} value={maintenanceCount} icon={<CogIcon className="h-6 w-6 text-ever-blue" />} />
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-8">
                <h3 className="text-xl font-bold text-ever-black mb-4">{t('adminActions')}</h3>
                <div className="flex flex-wrap gap-4">
                    {hasPermission('system', 'configureSettings') && (
                        <>
                            <button onClick={handleProcessNoShows} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg text-sm">{t('processNoShows')}</button>
                            <button onClick={handleProcessAutoCheckouts} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">{t('processAutoCheckouts')}</button>
                            <button onClick={handleSendReminders} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg text-sm">{t('sendReminders')}</button>
                        </>
                    )}
                    {currentUser?.role === Role.FacilityDirector && (
                        <button onClick={handleEmergencyStop} className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 font-bold py-2 px-4 rounded-lg text-sm">{t('emergencyStopAll')}</button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">{t('usageRanking30d')}</h3>
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
                    <h3 className="text-xl font-bold mb-4">{t('reportsRequiringAction')}</h3>
                     <ul className="space-y-3">
                        {malfunctionReports.map((log: MaintenanceLog) => {
                            const eq = equipment.find(e => e.id === log.equipmentId);
                            const user = users.find(u => u.id === log.reportedByUserId);
                            return (
                                <li key={log.id} className="p-3 bg-yellow-50 rounded-md">
                                    <p className="font-semibold text-yellow-800">{isJapanese ? eq?.nameJP : eq?.nameEN}</p>
                                    <p className="text-sm text-yellow-700 mt-1">{log.notes}</p>
                                    <p className="text-xs text-yellow-600 mt-2">{t('by')} {user?.name} - {new Date(log.reportDate).toLocaleDateString()}</p>
                                </li>
                            )
                        })}
                        {malfunctionReports.length === 0 && <p className="text-sm text-gray-500">{t('noReports')}</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;
