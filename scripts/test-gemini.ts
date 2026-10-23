import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing @google/genai import...');
const apiKey = process.env.GEMINI_API_KEY;
console.log('API key present:', Boolean(apiKey));

const client = new GoogleGenAI({ apiKey });
console.log('GoogleGenAI instance created successfully:', Boolean(client));
