// src/services/googleCalendar/IGoogleCalendarService.ts
import { CalendarEvent, CalendarEventType, CalendarSyncResult, Language } from '../../types';
import { simpleUUID } from '../../utils/uuid';

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
