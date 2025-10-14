import React from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { useAnnouncementContext } from '../contexts/AnnouncementContext';
import { useReservationContext } from '../contexts/ReservationContext';
import { useEquipmentContext } from '../contexts/EquipmentContext';
import { Reservation, ReservationStatus, View, Announcement } from '../types';
import { CalendarIcon, PencilIcon, BeakerIcon, ArrowRightIcon } from './common/Icons';

const DashboardCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode, onViewAll?: () => void, viewAllText?: string}> = ({ title, icon, children, onViewAll, viewAllText }) => (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <div className="p-2 bg-ever-blue-light rounded-full mr-3">{icon}</div>
                <h3 className="text-lg font-bold text-ever-black">{title}</h3>
            </div>
            {onViewAll && <button onClick={onViewAll} className="text-sm font-semibold text-ever-blue hover:text-ever-blue-dark">{viewAllText}</button>}
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);

const Dashboard: React.FC = () => {
    const { isJapanese, currentUser } = useSessionContext();
    const { announcements } = useAnnouncementContext();
    const { reservations } = useReservationContext();
    const { equipment } = useEquipmentContext();

    const upcomingReservations = React.useMemo(() => {
        const now = new Date();
        return reservations
            .filter(r => r.userId === currentUser?.id && r.status === ReservationStatus.AwaitingCheckIn && new Date(r.startTime) > now)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 3);
    }, [reservations, currentUser]);

    const latestAnnouncements = React.useMemo(() => {
        return announcements
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .slice(0, 3);
    }, [announcements]);
    
    const handleNavigate = (view: View) => {
        window.location.hash = view;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">
                {isJapanese ? `ようこそ、${currentUser?.name}さん` : `Welcome, ${currentUser?.name}`}
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Reservations */}
                <div className="lg:col-span-2">
                    <DashboardCard 
                        title={isJapanese ? "今後の予約" : "Upcoming Reservations"}
                        icon={<CalendarIcon className="h-6 w-6 text-ever-blue" />}
                        onViewAll={() => handleNavigate('reservations')}
                        viewAllText={isJapanese ? 'すべて表示' : 'View All'}
                    >
                        {upcomingReservations.length > 0 ? (
                            <ul className="space-y-3">
                                {upcomingReservations.map(r => {
                                    const eq = equipment.find(e => e.id === r.equipmentId);
                                    return (
                                        <li key={r.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-800">{isJapanese ? eq?.nameJP : eq?.nameEN}</p>
                                                <p className="text-sm text-gray-600">{new Date(r.startTime).toLocaleString(isJapanese ? 'ja-JP' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                            </div>
                                            <ArrowRightIcon />
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>{isJapanese ? '今後の予約はありません。' : 'No upcoming reservations.'}</p>
                            </div>
                        )}
                    </DashboardCard>
                </div>

                {/* Quick Actions */}
                <div>
                    <DashboardCard 
                        title={isJapanese ? "クイックアクション" : "Quick Actions"}
                        icon={<BeakerIcon className="h-6 w-6 text-ever-blue" />}
                    >
                        <div className="space-y-3">
                            <button onClick={() => handleNavigate('equipment')} className="w-full text-left p-3 bg-ever-blue-light hover:bg-ever-blue-light/80 rounded-md font-semibold text-ever-blue-dark transition-colors">
                                {isJapanese ? '機器を予約する' : 'Book Equipment'}
                            </button>
                            <button onClick={() => handleNavigate('projects')} className="w-full text-left p-3 bg-ever-purple-light hover:bg-ever-purple-light/80 rounded-md font-semibold text-ever-purple-dark transition-colors">
                                {isJapanese ? 'プロジェクトを見る' : 'View Projects'}
                            </button>
                             <button onClick={() => handleNavigate('consumablesStore')} className="w-full text-left p-3 bg-green-100 hover:bg-green-200/80 rounded-md font-semibold text-green-800 transition-colors">
                                {isJapanese ? '消耗品ストア' : 'Consumables Store'}
                            </button>
                        </div>
                    </DashboardCard>
                </div>

                {/* Announcements */}
                <div className="lg:col-span-3">
                    <DashboardCard 
                        title={isJapanese ? "お知らせ" : "Announcements"}
                        icon={<PencilIcon className="h-6 w-6 text-ever-blue" />}
                        onViewAll={() => handleNavigate('announcements')}
                        viewAllText={isJapanese ? 'すべて表示' : 'View All'}
                    >
                        {latestAnnouncements.length > 0 ? (
                             <ul className="space-y-3">
                                {latestAnnouncements.map(a => (
                                     <li key={a.id} className="p-3 bg-gray-50 rounded-md">
                                        <p className="font-semibold text-gray-800">{isJapanese ? a.titleJP : a.titleEN}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(a.startDate).toLocaleDateString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="text-center py-8 text-gray-500">
                                <p>{isJapanese ? '新しいお知らせはありません。' : 'No new announcements.'}</p>
                            </div>
                        )}
                    </DashboardCard>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
