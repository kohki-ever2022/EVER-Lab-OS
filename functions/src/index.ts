// functions/src/index.ts

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

export const callGeminiProxy = onCall(
  { secrets: [geminiApiKey], cors: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { prompt, config } = request.data;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey.value()
        },
        body: JSON.stringify({
          contents: prompt,
          generationConfig: config
        })
      });

      if (!response.ok) {
        throw new HttpsError('internal', `Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Gemini proxy error:', error);
      throw new HttpsError('internal', 'Failed to call Gemini API', error);
    }
  }
);
