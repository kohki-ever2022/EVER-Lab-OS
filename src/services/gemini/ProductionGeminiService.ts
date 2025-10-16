// src/services/gemini/ProductionGeminiService.ts
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Usage, Equipment, Language } from "../../types";
import { logger } from '../logger';
import { translate, TranslationKey } from '../../i18n/translations';
import { 
  GEMINI_FLASH_MODEL, 
  GEMINI_API_RETRY_COUNT, 
  GEMINI_API_INITIAL_DELAY, 
  GEMINI_API_TIMEOUT,
  GEMINI_SDS_MAX_TEXT_LENGTH
} from "../../config/constants";
import { IGeminiService } from "./IGeminiService";

/**
 * 実際のGemini APIを呼び出す本番用サービス。
 */
export class ProductionGeminiService implements IGeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey: apiKey });
    } else {
      logger.warn("Gemini API key not configured. Gemini features will be disabled.");
    }
  }
  
  private getErrorMessage(key: TranslationKey, language: Language): string {
    return translate(key, language);
  }
  
  private getErrorJson(key: TranslationKey, language: Language): string {
    return JSON.stringify({ error: this.getErrorMessage(key, language) });
  }

  private isAvailable(language: Language): { available: boolean; message: string, jsonMessage: string } {
    if (!this.ai) {
      return {
        available: false,
        message: this.getErrorMessage('geminiNotAvailable', language),
        jsonMessage: this.getErrorJson('geminiNotAvailable', language)
      };
    }
    return { available: true, message: '', jsonMessage: '' };
  }

  /**
   * 指数バックオフによるリトライメカニズム
   * @param fn 実行する関数
   * @param maxRetries 最大リトライ回数
   * @param initialDelay 初期遅延時間（ミリ秒）
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = GEMINI_API_RETRY_COUNT,
    initialDelay: number = GEMINI_API_INITIAL_DELAY
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), GEMINI_API_TIMEOUT)
          ),
        ]);
        
        // 成功したら結果を返す
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // 最後の試行の場合はエラーをスロー
        if (attempt === maxRetries - 1) {
          break;
        }

        // 指数バックオフで待機
        const delay = initialDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 1000; // ランダムなジッターを追加
        const totalDelay = delay + jitter;

        logger.warn(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${totalDelay.toFixed(0)}ms`,
          { error: lastError.message }
        );

        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error(`Max retries (${maxRetries}) exceeded. Last error: ${lastError?.message}`);
  }

  async getUsageInsights(
    userUsage: Usage[],
    equipmentList: Equipment[],
    language: Language,
    userId: string
  ): Promise<string> {
    const availability = this.isAvailable(language);
    if (!availability.available) return availability.message;
    
    const isJapanese = language === Language.JA;
    
    // Limit to the most recent 30 usage records to avoid overly large prompts
    const recentUsage = userUsage.slice(-30);

    const usageStrings = recentUsage.map(u => {
        const equipment = equipmentList.find(e => e.id === u.equipmentId);
        const equipmentName = equipment ? (isJapanese ? equipment.nameJP : equipment.nameEN) : 'Unknown Equipment';
        const minutesText = isJapanese ? '分' : 'minutes';
        return `${u.date.toLocaleDateString()}: ${equipmentName}, ${u.durationMinutes} ${minutesText}`;
    }).join('\n');
    
    const prompt = isJapanese ? `
      以下は、ある研究室の機器利用履歴データです。
      このデータに基づき、ユーザーの利用傾向を分析し、来月の利用状況について簡単な予測をしてください。
      また、コスト削減や効率化のための提案を1つ含めてください。
      回答は簡潔なマークダウン形式で、日本語でお願いします。

      利用履歴:
      ${usageStrings}
      ` : `
      The following is the equipment usage history data for a laboratory.
      Based on this data, please analyze the user's usage trends and provide a brief forecast for next month's usage.
      Also, include one suggestion for cost reduction or efficiency improvement.
      Please provide the response in concise Markdown format in English.

      Usage History:
      ${usageStrings}
      `;

    try {
        const response: GenerateContentResponse = await this.retryWithBackoff(() => this.ai!.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
        }));
        return response.text;
    } catch (error) {
        logger.error("Failed to fetch usage insights from Gemini after retries", { error: error instanceof Error ? error.message : String(error) });
        return this.getErrorMessage('geminiUsageAnalysisError', language);
    }
  }

  async getUiUxAnalysis(
    base64ImageData: string,
    mimeType: string,
    language: Language
  ): Promise<string> {
    const availability = this.isAvailable(language);
    if (!availability.available) return availability.jsonMessage;
    
    const isJapanese = language === Language.JA;
    const prompt = isJapanese ? `
    あなたは世界クラスのUI/UXデザイン専門家です。提供されたWebまたはモバイルアプリケーションのスクリーンショットを分析してください。
    - デザイン、使いやすさ、ユーザーエクスペリエンスを評価してください。
    - 0から100までの総合スコアを付けてください（100が最高）。
    - 具体的な問題を特定し、その重要度（'致命的', '重要', '軽微'）を分類し、改善のための実行可能な提案をしてください。
    - 画像がUIのスクリーンショットでない場合（例：猫の写真）、'error'フィールドに適切なエラーメッセージを設定し、他のフィールドは空またはデフォルト値にしてください。
    - 応答は、指定されたJSON形式で、必ず日本語で記述してください。
    ` : `
    You are a world-class UI/UX design expert. Please analyze the provided screenshot of a web or mobile application.
    - Evaluate its design, usability, and user experience.
    - Provide an overall score from 0 to 100, where 100 is the best.
    - Identify specific issues, classify their severity ('Critical', 'Major', 'Minor'), and provide actionable suggestions for improvement.
    - If the image is not a UI screenshot (e.g., a photo of a cat), populate the 'error' field with an appropriate error message and leave other fields blank or with default values.
    - The response must be in the specified JSON format, and written in English.
    `;

    const imagePart = { inlineData: { data: base64ImageData, mimeType: mimeType } };
    const textPart = { text: prompt };

    try {
        const response: GenerateContentResponse = await this.retryWithBackoff(() => this.ai!.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallScore: { type: Type.NUMBER, description: "Overall UI/UX score (0-100)" },
                        summary: { type: Type.STRING, description: "A concise summary of the UI/UX quality." },
                        issues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    severity: { type: Type.STRING },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    suggestion: { type: Type.STRING }
                                },
                                required: ["severity", "title", "description", "suggestion"]
                            }
                        },
                        error: { type: Type.STRING }
                    },
                    required: ["summary", "issues"]
                },
            },
        }));
        return response.text || '';
    } catch (error) {
        logger.error("Failed to fetch UI/UX analysis from Gemini after retries", { error: error instanceof Error ? error.message : String(error) });
        return this.getErrorJson('geminiUiUxAnalysisError', language);
    }
  }

  async summarizeSDSDocument(
    sdsText: string,
    language: Language
  ): Promise<string> {
    const availability = this.isAvailable(language);
    if (!availability.available) return availability.jsonMessage;

    const isJapanese = language === Language.JA;
    const prompt = isJapanese ? `
    あなたは化学物質の安全データシート（SDS）を分析する専門家です。提供されたJIS Z 7253:2019準拠のSDSテキストから、緊急時に必要な重要な安全情報を抽出し、以下の仕様に厳密に従ったJSON形式で要約してください。各項目は簡潔かつ明確に記述してください。
    - hazards: 主要な危険有害性を箇条書きでリストアップした配列。
    - handling: 安全な取り扱い方法と注意事項。
    - storage: 安全な保管条件と混載禁止物質。
    - firstAid: 吸入、皮膚接触、眼、経口摂取した場合の応急措置。
    - spillResponse: 漏洩時の措置。
    - disposal: 廃棄上の注意。
    - ppe: 推奨される個人用保護具（PPE）を箇条書きでリストアップした配列。
    ` : `
    You are an expert at analyzing Safety Data Sheets (SDS). From the provided SDS text (compliant with JIS Z 7253:2019), extract and summarize the key safety information needed in an emergency into a structured JSON format that strictly follows the schema provided. Be concise and clear in each section.
    - hazards: List the main hazards as an array of strings.
    - handling: Safe handling procedures and precautions.
    - storage: Safe storage conditions and materials to avoid.
    - firstAid: First aid measures for inhalation, skin, eye, and ingestion.
    - spillResponse: Actions to take in case of a spill.
    - disposal: Disposal considerations.
    - ppe: List recommended Personal Protective Equipment (PPE) as an array of strings.
    `;

    try {
        const response: GenerateContentResponse = await this.retryWithBackoff(() => this.ai!.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: `${prompt}\n\nSDS TEXT:\n${sdsText.substring(0, GEMINI_SDS_MAX_TEXT_LENGTH)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
                        handling: { type: Type.STRING },
                        storage: { type: Type.STRING },
                        firstAid: { type: Type.STRING },
                        spillResponse: { type: Type.STRING },
                        disposal: { type: Type.STRING },
                        ppe: { type: Type.ARRAY, items: { type: Type.STRING } },
                        error: { type: Type.STRING }
                    },
                    required: ["hazards", "handling", "storage", "firstAid", "spillResponse", "disposal"]
                },
            },
        }));
        return response.text || '';
    } catch (error) {
        logger.error("Failed to fetch SDS summary from Gemini after retries", { error: error instanceof Error ? error.message : String(error) });
        return this.getErrorJson('geminiSdsSummaryError', language);
    }
  }

  async generateText(prompt: string, language: Language): Promise<string> {
    const availability = this.isAvailable(language);
    if (!availability.available) return availability.message;

    try {
      const response: GenerateContentResponse = await this.retryWithBackoff(() => this.ai!.models.generateContent({
        model: GEMINI_FLASH_MODEL,
        contents: prompt,
      }));
      return response.text;
    } catch (error) {
      logger.error("Failed to generate text from Gemini after retries", { error: error instanceof Error ? error.message : String(error) });
      return this.getErrorMessage('geminiTextGenerationError', language);
    }
  }
}
