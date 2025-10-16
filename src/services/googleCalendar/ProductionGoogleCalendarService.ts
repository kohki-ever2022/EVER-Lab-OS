// src/services/googleCalendar/ProductionGoogleCalendarService.ts
import { CalendarEvent, CalendarSyncResult, Language } from '../../types';
import { simpleUUID } from '../../utils/uuid';
import { IGoogleCalendarService } from './IGoogleCalendarService';

/**
 * GoogleカレンダーAPIの本番実装（スタブ）
 * NOTE: これは完全な実装ではありません。実際のGoogle API連携にはOAuth2.0認証などが必要です。
 * この実装は、アプリケーションが本番モードでクラッシュしないようにするための機能的なスタブです。
 */
export class ProductionGoogleCalendarService implements IGoogleCalendarService {
    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async createEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult> {
        await this.delay(300);
        console.log('[Production Stub] Creating calendar event:', event);
        return {
            success: true,
            googleCalendarEventId: `prod-stub-gcal-${simpleUUID()}`,
            syncedAt: new Date(),
        };
    }

    async updateEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult> {
        await this.delay(300);
        console.log('[Production Stub] Updating calendar event:', event);
        return {
            success: true,
            googleCalendarEventId: event.googleCalendarEventId,
            syncedAt: new Date(),
        };
    }

    async deleteEvent(googleCalendarEventId: string): Promise<CalendarSyncResult> {
        await this.delay(300);
        console.log('[Production Stub] Deleting calendar event:', googleCalendarEventId);
        return {
            success: true,
            googleCalendarEventId,
            syncedAt: new Date(),
        };
    }
}
