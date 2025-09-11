import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[gemini] GEMINI_API_KEY not set; AI endpoints will return 503');
}

export const geminiClient = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

