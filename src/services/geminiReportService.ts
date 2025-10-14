// src/services/geminiReportService.ts
import { Language } from '../types';
import { MonthlyReportData } from './reportAggregator';
import { geminiService } from './geminiService';

/**
 * 月次レポートを生成（Gemini API）
 */
export const generateMonthlyReport = async (
  data: MonthlyReportData,
  language: Language
): Promise<string> => {
  const isJapanese = language === Language.JA;
  const lang = isJapanese ? '日本語' : '英語';
  const errorMsg = isJapanese 
      ? 'レポートの生成に失敗しました。時間をおいて再度お試しください。' 
      : 'Failed to generate the report. Please try again later.';
  
  const prompt = `
あなたはBSL-2対応の共同利用型研究施設の運営コンサルタントです。
以下のJSONデータから、施設運営者（施設責任者、ラボマネージャー）向けの包括的な月次レポートを${lang}で生成してください。

【レポート構成】
1.  **エグゼクティブサマリー:** 当月の最も重要なハイライトと注意点を3〜5行で簡潔にまとめてください。
2.  **機器利用状況の分析:** 全体的な稼働率、予約のキャンセル・No-Show率について分析し、特に利用率が高い・低い機器トップ3を挙げてください。傾向から読み取れることを考察してください。
3.  **在庫管理状況:** 危険物比率の安全性評価、在庫切れ・低在庫品目の影響について言及してください。
4.  **コンプライアンス状況:** 未レビューのSDS、期限切れ証明書、発生したインシデントの数を示し、潜在的なリスクを指摘してください。
5.  **財務サマリー:** 総請求額と前月比の増減について分析し、テナント別の請求額も示してください。
6.  **改善提案:** 上記の分析に基づき、コスト削減、運営効率化、安全性向上のための具体的なアクションアイテムを3〜5項目提案してください。

【データ】
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

【出力形式】
Markdown形式で、見出し、太字、箇条書きを効果的に使用して、プロフェッショナルで読みやすいレポートを作成してください。各セクションで具体的な数値を引用し、専門的な洞察を加えてください。
  `;
  
  const reportText = await geminiService.generateText(prompt, language);

  if (!reportText || reportText.includes("Error:") || reportText.includes("エラー:")) {
      console.error('Failed to generate monthly report:', reportText);
      return errorMsg;
  }
  
  return reportText;
};
