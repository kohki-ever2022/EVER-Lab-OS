// src/services/googleCalendar/ProductionGoogleCalendarService.ts
import { CalendarEvent, CalendarSyncResult, Language } from '../../types';
import { IGoogleCalendarService } from './IGoogleCalendarService';

/**
 * GoogleカレンダーAPIの本番実装（未実装）
 * NOTE: この実装は、機能が未実装であることを明確に示すためのものです。
 * 実際のGoogle API連携にはOAuth2.0認証などが必要です。
 */
export class ProductionGoogleCalendarService implements IGoogleCalendarService {
    private notImplementedError(): CalendarSyncResult {
        return {
            success: false,
            errorMessage: "Google Calendar integration is not implemented in this environment.",
            syncedAt: new Date(),
        };
    }

    async createEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult> {
        console.warn('[Production Stub] Google Calendar createEvent is not implemented.', event);
        return this.notImplementedError();
    }

    async updateEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult> {
        console.warn('[Production Stub] Google Calendar updateEvent is not implemented.', event);
        return this.notImplementedError();
    }

    async deleteEvent(googleCalendarEventId: string): Promise<CalendarSyncResult> {
        console.warn('[Production Stub] Google Calendar deleteEvent is not implemented.', googleCalendarEventId);
        return this.notImplementedError();
    }
}
