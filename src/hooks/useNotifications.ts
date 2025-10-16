// src/hooks/useNotifications.ts
import { useCallback } from 'react';
import { useNotificationsContext } from '../contexts/NotificationContext';
import { useSessionContext } from '../contexts/SessionContext';
// FIX: import from barrel file
import { Notification } from '../types';
// FIX: import from barrel file
import { Result } from '../types';

export const useNotifications = () => {
    const { addNotification: contextAddNotification, markAsRead, markAllAsReadForUser } = useNotificationsContext();
    const { currentUser } = useSessionContext();

    const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        contextAddNotification(notificationData);
    }, [contextAddNotification]);

    const markNotificationAsRead = useCallback(async (notificationId: string): Promise<Result<void, Error>> => {
        try {
            markAsRead(notificationId);
            return { success: true, data: undefined };
        } catch (e) {
            return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }, [markAsRead]);

    const markAllNotificationsAsRead = useCallback(async (): Promise<Result<void, Error>> => {
        try {
            if (!currentUser) throw new Error("User not logged in.");
            markAllAsReadForUser(currentUser.id);
            return { success: true, data: undefined };
        } catch (e) {
            return { success: false, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }, [currentUser, markAllAsReadForUser]);

    return { addNotification, markNotificationAsRead, markAllNotificationsAsRead };
};