import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export const isGeminiConfigured = Boolean(apiKey && apiKey.trim().length > 10);

export const geminiClient = isGeminiConfigured ? new GoogleGenAI({ apiKey }) : null;

export const defaultGeminiModel = modelName;
