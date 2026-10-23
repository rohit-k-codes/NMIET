import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

console.log(`Using model: ${model}`);
const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: 'Respond with the single word: "READY"',
    });
    console.log('Gemini generateContent output:', response.text);
  } catch (err: any) {
    console.error('generateContent error:', err.message || err);
  }
}

run();
