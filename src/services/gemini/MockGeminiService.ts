// src/services/gemini/MockGeminiService.ts
import { Usage, Equipment, Language, SDSSummary } from '../../types';
import { IGeminiService } from './IGeminiService';

/**
 * Gemini APIの呼び出しを模倣するモックサービス。
 * 即座にダミーのレスポンスを返す。
 */
export class MockGeminiService implements IGeminiService {
  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getUsageInsights(
    userUsage: Usage[],
    equipmentList: Equipment[],
    language: Language,
    userId: string
  ): Promise<string> {
    await this.delay(500);
    const isJapanese = language === Language.JA;
    return isJapanese
      ? `### AIによる利用傾向分析 (モック)

*   **利用傾向:** PCR装置の利用が週後半に集中しています。
*   **来月の予測:** 引き続きPCR装置の高頻度利用が見込まれます。
*   **提案:** 夜間や早朝の利用を促すことで、ピークタイムの混雑を緩和できます。`
      : `### AI Usage Analysis (Mock)

*   **Trend:** PCR machine usage is concentrated in the latter half of the week.
*   **Forecast:** Continued high usage of PCR machines is expected next month.
*   **Suggestion:** Encourage off-peak usage (night/early morning) to alleviate congestion.`;
  }

  async getUiUxAnalysis(
    base64ImageData: string,
    mimeType: string,
    language: Language
  ): Promise<string> {
    await this.delay(1200);
    const isJapanese = language === Language.JA;
    const mockResult = {
      overallScore: 85,
      summary: isJapanese
        ? '全体的にクリーンでモダンなデザインですが、一部のインタラクションが直感的ではありません。'
        : "Overall, it's a clean and modern design, but some interactions are not intuitive.",
      issues: [
        {
          severity: 'Major',
          title: isJapanese
            ? 'ボタンのコントラスト比が低い'
            : 'Low Contrast Ratio on Buttons',
          description: isJapanese
            ? '主要なCTAボタンの背景色とテキスト色のコントラストが低く、視認性に問題があります。'
            : 'The contrast between the background and text color on the primary CTA button is low, causing visibility issues.',
          suggestion: isJapanese
            ? 'WCAG AA基準を満たすように、テキスト色をより濃い色に変更してください。'
            : 'Change the text color to a darker shade to meet WCAG AA standards.',
        },
        {
          severity: 'Minor',
          title: isJapanese ? 'フォームのラベルが小さい' : 'Small Form Labels',
          description: isJapanese
            ? '入力フォームのラベルテキストが小さすぎて、モバイルデバイスでの可読性が低いです。'
            : 'The label text for the input forms is too small, reducing readability on mobile devices.',
          suggestion: isJapanese
            ? 'フォントサイズを最低でも14pxに引き上げることを推奨します。'
            : 'It is recommended to increase the font size to at least 14px.',
        },
      ],
    };
    return JSON.stringify(mockResult);
  }

  async summarizeSDSDocument(
    sdsText: string,
    language: Language
  ): Promise<string> {
    await this.delay(800);
    const isJapanese = language === Language.JA;
    const mockSummary: SDSSummary = {
      hazards: [
        isJapanese ? '皮膚刺激' : 'Skin irritation',
        isJapanese ? '強い眼刺激' : 'Serious eye irritation',
      ],
      handling: isJapanese
        ? '保護手袋/保護眼鏡を着用すること。'
        : 'Wear protective gloves/eye protection.',
      storage: isJapanese
        ? '換気の良い場所で保管すること。'
        : 'Store in a well-ventilated place.',
      firstAid: isJapanese
        ? '眼に入った場合: 水で数分間注意深く洗うこと。'
        : 'IF IN EYES: Rinse cautiously with water for several minutes.',
      spillResponse: isJapanese
        ? '漏出物は回収すること。'
        : 'Collect spillage.',
      disposal: isJapanese
        ? '内容物/容器を地域の規制に従って廃棄すること。'
        : 'Dispose of contents/container in accordance with local regulations.',
      ppe: [
        isJapanese ? '保護手袋' : 'Protective gloves',
        isJapanese ? '保護眼鏡' : 'Safety glasses',
      ],
    };
    return JSON.stringify(mockSummary);
  }

  async generateText(prompt: string, language: Language): Promise<string> {
    await this.delay(500);
    const isJapanese = language === Language.JA;
    return isJapanese
      ? `### AIによるテキスト生成 (モック)\n\nこれはモックサーバーからの応答です。プロンプトに基づいて生成されたテキストがここに表示されます。`
      : `### AI Text Generation (Mock)\n\nThis is a mocked response. The text generated based on your prompt would appear here.`;
  }
}
