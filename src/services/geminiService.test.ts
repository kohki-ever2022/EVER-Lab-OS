// src/services/geminiService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService } from './geminiService';
import { Language } from '../types';

// Mock the environment variable
vi.mock('virtual:env', () => ({
  VITE_USE_MOCK_GEMINI: 'true',
  VITE_GEMINI_API_KEY: '', // Ensure production service doesn't initialize
}));

describe('geminiService (Mock Implementation)', () => {
  beforeEach(() => {
    // Since geminiService is a singleton, we can't easily re-initialize it.
    // The test relies on the mock being active from the start due to the vi.mock above.
  });

  it('should return mock usage insights', async () => {
    const insightsJA = await geminiService.getUsageInsights([], [], Language.JA, 'user-1');
    expect(insightsJA).toContain('AIによる利用傾向分析 (モック)');

    const insightsEN = await geminiService.getUsageInsights([], [], Language.EN, 'user-1');
    expect(insightsEN).toContain('AI Usage Analysis (Mock)');
  });

  it('should return mock UI/UX analysis as a JSON string', async () => {
    const analysisJson = await geminiService.getUiUxAnalysis('base64data', 'image/png', Language.EN);
    const analysis = JSON.parse(analysisJson);
    
    expect(analysis.overallScore).toBe(85);
    expect(analysis.summary).toContain('clean and modern design');
    expect(analysis.issues).toHaveLength(2);
    expect(analysis.issues[0].severity).toBe('Major');
  });
  
  it('should return mock SDS summary as a JSON string', async () => {
    const summaryJson = await geminiService.summarizeSDSDocument('sds text', Language.EN);
    const summary = JSON.parse(summaryJson);
    
    expect(summary.hazards).toEqual(["Skin irritation", "Serious eye irritation"]);
    expect(summary.handling).toContain('Wear protective gloves');
    expect(summary.ppe).toHaveLength(2);
  });

  it('should return mock generated text', async () => {
    const textJA = await geminiService.generateText('prompt', Language.JA);
    expect(textJA).toContain('AIによるテキスト生成 (モック)');

    const textEN = await geminiService.generateText('prompt', Language.EN);
    expect(textEN).toContain('AI Text Generation (Mock)');
  });
});
