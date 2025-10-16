// src/services/googleCalendar/MockGoogleCalendarService.ts
import { CalendarEvent, CalendarSyncResult, Language } from '../../types';
import { simpleUUID } from '../../utils/uuid';
import { IGoogleCalendarService } from './IGoogleCalendarService';

/**
 * GoogleカレンダーAPIの呼び出しを模倣するモックサービス
 */
export class MockGoogleCalendarService implements IGoogleCalendarService {
    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async createEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult> {
        await this.delay(300);
        console.log('[Mock] Creating calendar event:', event);
        return {
            success: true,
            googleCalendarEventId: `mock-gcal-${simpleUUID()}`,
            syncedAt: new Date(),
        };
    }

    async updateEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult> {
        await this.delay(300);
        console.log('[Mock] Updating calendar event:', event);
        return {
            success: true,
            googleCalendarEventId: event.googleCalendarEventId,
            syncedAt: new Date(),
        };
    }

    async deleteEvent(googleCalendarEventId: string): Promise<CalendarSyncResult> {
        await this.delay(300);
        console.log('[Mock] Deleting calendar event:', googleCalendarEventId);
        return {
            success: true,
            googleCalendarEventId,
            syncedAt: new Date(),
        };
    }
}
