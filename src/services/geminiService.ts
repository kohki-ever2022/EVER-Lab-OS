// src/services/geminiService.ts
import { IGeminiService } from './gemini/IGeminiService';
import { MockGeminiService } from './gemini/MockGeminiService';
import { ProductionGeminiService } from './gemini/ProductionGeminiService';

/**
 * 環境変数に基づいて適切なGeminiサービスインスタンスを提供するファクトリー。
 */
class GeminiServiceFactory {
  private static instance: IGeminiService | null = null;

  static getService(): IGeminiService {
    if (!this.instance) {
      // Vite projects expose env variables on import.meta.env
      const useMock = import.meta.env.VITE_USE_MOCK_GEMINI === 'true';

      if (useMock) {
        console.log('🔧 Using Mock Gemini Service (Development Mode)');
        this.instance = new MockGeminiService();
      } else {
        console.log('✨ Using Production Gemini Service');
        this.instance = new ProductionGeminiService();
      }
    }
    return this.instance;
  }
}

/**
 * アプリケーション全体で使用するGeminiサービスのシングルトンインスタンス。
 */
export const geminiService = GeminiServiceFactory.getService();
