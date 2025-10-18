// src/services/googleCalendarService.ts
import {
  IGoogleCalendarService,
  createCalendarEventFromSchedule,
} from './googleCalendar/IGoogleCalendarService';
import { MockGoogleCalendarService } from './googleCalendar/MockGoogleCalendarService';
import { ProductionGoogleCalendarService } from './googleCalendar/ProductionGoogleCalendarService';

// Re-export for convenience
export { createCalendarEventFromSchedule };

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
export const googleCalendarService: IGoogleCalendarService =
  GoogleCalendarServiceFactory.getService();
