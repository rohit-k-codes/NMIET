import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

async function run() {
  console.log('Calling ai.models.generateContent with gemini-3.8-flash...');
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Respond with the single word: "READY"',
    });
    console.log('Result text:', res.text);
    console.log('Success!');
  } catch (err: any) {
    console.error('Error in ai.models.generateContent:', err.message || err);
  }
}

run();
