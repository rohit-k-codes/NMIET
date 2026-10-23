import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

console.log(`[Diagnostic] API key present: ${Boolean(apiKey && apiKey.length > 5)} (length: ${apiKey?.length || 0})`);
console.log(`[Diagnostic] Model configured: ${model}`);

const ai = new GoogleGenAI({ apiKey });

async function testInteractions() {
  console.log('\n--- Test 1: client.interactions.create ---');
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const interaction = await ai.interactions.create({
      model,
      input: 'Reply with the single word: "READY"',
    });
    clearTimeout(timer);
    console.log('[Test 1 Success] Interaction ID:', interaction.id);
    console.log('[Test 1 Success] Output text:', interaction.output_text);
    return true;
  } catch (err: any) {
    console.log('[Test 1 Failure]:', err.name || 'Error', ':', err.message || String(err));
    if (err.status) console.log('HTTP Status:', err.status);
    return false;
  }
}

async function testGenerateContent() {
  console.log('\n--- Test 2: client.models.generateContent ---');
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const response = await ai.models.generateContent({
      model,
      contents: 'Reply with the single word: "READY"',
    });
    clearTimeout(timer);
    console.log('[Test 2 Success] Text:', response.text);
    return true;
  } catch (err: any) {
    console.log('[Test 2 Failure]:', err.name || 'Error', ':', err.message || String(err));
    if (err.status) console.log('HTTP Status:', err.status);
    return false;
  }
}

async function main() {
  const t1 = await testInteractions();
  const t2 = await testGenerateContent();
  console.log('\n--- Summary ---');
  console.log('Interactions API working:', t1);
  console.log('GenerateContent API working:', t2);
}

main();
