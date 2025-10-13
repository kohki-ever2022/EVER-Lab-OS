import React from 'react';
import { useSessionContext } from '../contexts/SessionContext';
import { useNotificationsContext } from '../contexts/NotificationContext';
import { useNotifications } from '../hooks/useNotifications';
import { Notification, NotificationType } from '../types';

interface NotificationCenterProps {
    onClose: () => void;
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
    const iconMap: Record<NotificationType, { icon: string, color: string }> = {
        [NotificationType.EquipmentMalfunction]: { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-red-500' },
        [NotificationType.LowStock]: { icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z', color: 'text-orange-500' },
        [NotificationType.CertificateExpiring]: { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-yellow-500' },
        [NotificationType.NewQuotationRequest]: { icon: 'M8.25 18.75a.75.75 0 01.75.75v.008c0 .414.336.75.75.75h4.5a.75.75 0 010 1.5h-4.5a2.25 2.25 0 01-2.25-2.25v-.008a.75.75 0 01.75-.75z M10.5 3.75a2.25 2.25 0 00-2.25 2.25v1.5a.75.75 0 001.5 0v-1.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v1.5a.75.75 0 001.5 0v-1.5a2.25 2.25 0 00-2.25-2.25h-3z', color: 'text-blue-500' },
        [NotificationType.ReservationCancelled]: { icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', color: 'text-purple-500' },
        [NotificationType.General]: { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-gray-500' },
    };
    const { icon, color } = iconMap[type] || iconMap.GENERAL;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
    );
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
    const { isJapanese, currentUser } = useSessionContext();
    const { notifications } = useNotificationsContext();
    const { markNotificationAsRead, markAllNotificationsAsRead } = useNotifications();

    const myNotifications = notifications
        .filter(n => n.recipientUserId === currentUser?.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const unreadCount = myNotifications.filter(n => !n.read).length;

    const handleNotificationClick = (notification: Notification) => {
        markNotificationAsRead(notification.id);
        if (notification.actionUrl) {
            window.location.hash = notification.actionUrl;
        }
        onClose();
    };
    
    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAllNotificationsAsRead();
    };

    return (
        <div className="absolute top-16 right-4 w-full max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 z-30 flex flex-col max-h-[80vh]">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">{isJapanese ? '通知' : 'Notifications'}</h3>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:underline">
                        {isJapanese ? 'すべて既読にする' : 'Mark all as read'}
                    </button>
                )}
            </div>
            <div className="overflow-y-auto">
                {myNotifications.length > 0 ? (
                    myNotifications.map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    <NotificationIcon type={n.type} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{isJapanese ? n.titleJP : n.titleEN}</p>
                                    <p className="text-sm text-gray-600">{isJapanese ? n.messageJP : n.messageEN}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                                {!n.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 self-center"></div>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <p>{isJapanese ? '通知はありません。' : 'No new notifications.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
