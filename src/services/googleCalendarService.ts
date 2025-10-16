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
 * GoogleカレンダーAPIの本番実装（スタブ）
 * NOTE: これは完全な実装ではありません。実際のGoogle API連携にはOAuth2.0認証などが必要です。
 * この実装は、アプリケーションが本番モードでクラッシュしないようにするための機能的なスタブです。
 */
class ProductionGoogleCalendarService implements IGoogleCalendarService {
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


/**
 * 環境変数に基づいて適切なGoogleカレンダーサービスインスタンスを提供するファクトリー。
 */
class GoogleCalendarServiceFactory {
  private static instance: IGoogleCalendarService | null = null;
  
  static getService(): IGoogleCalendarService {
    if (!this.instance) {
      const useMock = import.meta.env.VITE_USE_MOCK_GOOGLE_CALENDAR === 'true';
      
      if (useMock) {
        console.log('🔧 Using Mock Google Calendar Service');
        this.instance = new MockGoogleCalendarService();
      } else {
        console.log('📅 Using Production Google Calendar Service (Stub)');
        this.instance = new ProductionGoogleCalendarService();
      }
    }
    return this.instance;
  }
}

/**
 * アプリケーション全体で使用するGoogleカレンダーサービスのシングルトンインスタンス。
 */
export const googleCalendarService: IGoogleCalendarService = GoogleCalendarServiceFactory.getService();