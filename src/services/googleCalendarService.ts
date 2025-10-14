// src/services/googleCalendarService.ts

import { CalendarEvent, CalendarEventType, CalendarSyncResult } from '../types';
import { Language } from '../types';
import { simpleUUID } from '../utils/uuid';

/**
 * Googleカレンダー連携サービスのインターフェース
 * モック実装と本番実装を切り替え可能にする
 */
export interface IGoogleCalendarService {
  /**
   * カレンダーイベントをGoogleカレンダーに作成
   */
  createEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult>;
  
  /**
   * Googleカレンダーのイベントを更新
   */
  updateEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult>;

  /**
   * Googleカレンダーのイベントを削除
   */
  deleteEvent(googleCalendarEventId: string): Promise<CalendarSyncResult>;
}

/**
 * スケジュール情報からCalendarEventオブジェクトを生成するヘルパー関数
 */
export const createCalendarEventFromSchedule = (
    eventType: CalendarEventType,
    titles: { jp: string, en: string },
    descriptions: { jp: string, en: string },
    startDate: Date,
    durationMinutes: number,
    assignedTo: string[],
    relatedItemId?: string,
    reminderMinutes: number[] = [60]
): CalendarEvent => {
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return {
        id: simpleUUID(),
        eventType,
        title: titles.en, // Default to EN
        titleJP: titles.jp,
        titleEN: titles.en,
        description: descriptions.en, // Default to EN
        descriptionJP: descriptions.jp,
        descriptionEN: descriptions.en,
        startDateTime: startDate,
        endDateTime: endDate,
        isAllDay: false,
        isSyncedToGoogle: false,
        reminderMinutes,
        relatedItemId,
        assignedTo,
        createdBy: 'system', // Or current user ID if available
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'SCHEDULED',
    };
};

/**
 * GoogleカレンダーAPIの呼び出しを模倣するモックサービス
 */
class MockGoogleCalendarService implements IGoogleCalendarService {
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

/**
 * 本番用のGoogleカレンダーサービス (未実装)
 */
class ProductionGoogleCalendarService implements IGoogleCalendarService {
    // This would contain the actual Google Calendar API logic
    async createEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult> {
        console.warn('Production Google Calendar Service is not implemented. Using mock behavior.');
        return new MockGoogleCalendarService().createEvent(event, language);
    }

    async updateEvent(event: CalendarEvent, language: Language): Promise<CalendarSyncResult> {
        console.warn('Production Google Calendar Service is not implemented. Using mock behavior.');
        return new MockGoogleCalendarService().updateEvent(event, language);
    }

    async deleteEvent(googleCalendarEventId: string): Promise<CalendarSyncResult> {
        console.warn('Production Google Calendar Service is not implemented. Using mock behavior.');
        return new MockGoogleCalendarService().deleteEvent(googleCalendarEventId);
    }
}

/**
 * 環境変数に基づいて適切なサービスインスタンスを提供するファクトリー
 */
class GoogleCalendarServiceFactory {
    private static instance: IGoogleCalendarService | null = null;
    
    static getService(): IGoogleCalendarService {
        if (!this.instance) {
            // In a real app, you might use an environment variable to switch.
            // For now, we'll default to the mock service.
            const useMock = true; // or process.env.VITE_USE_MOCK_GCAL === 'true';

            if (useMock) {
                console.log('🔧 Using Mock Google Calendar Service');
                this.instance = new MockGoogleCalendarService();
            } else {
                console.log('🚀 Using Production Google Calendar Service');
                this.instance = new ProductionGoogleCalendarService();
            }
        }
        return this.instance;
    }
}

/**
 * アプリケーション全体で使用するGoogleカレンダーサービスのシングルトンインスタンス
 */
export const googleCalendarService = GoogleCalendarServiceFactory.getService();
