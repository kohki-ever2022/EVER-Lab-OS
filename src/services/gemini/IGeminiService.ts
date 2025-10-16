// src/services/gemini/IGeminiService.ts
import { Usage, Equipment, Language, SDSSummary } from "../../types";

/**
 * Gemini APIとの通信を抽象化するインターフェース。
 * これにより、モックと本番実装を容易に切り替えられる。
 */
export interface IGeminiService {
  getUsageInsights(
    userUsage: Usage[],
    equipmentList: Equipment[],
    language: Language,
    userId: string
  ): Promise<string>;

  getUiUxAnalysis(
    base64ImageData: string,
    mimeType: string,
    language: Language
  ): Promise<string>;

  summarizeSDSDocument(
    sdsText: string,
    language: Language
  ): Promise<string>;

  generateText(prompt: string, language: Language): Promise<string>;
}
