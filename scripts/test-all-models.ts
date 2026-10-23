import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

const modelsToTest = [
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemma-4-31b-it',
];

async function testOne(modelName: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }],
      }),
      signal: AbortSignal.timeout(5000),
    });
    console.log(`[${modelName}] Status:`, res.status, res.statusText);
    if (!res.ok) {
      const err = await res.json();
      console.log(`[${modelName}] Error:`, err.error?.message || err);
    } else {
      const data = await res.json();
      console.log(`[${modelName}] Success! Parts:`, data.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 50));
    }
  } catch (err: any) {
    console.log(`[${modelName}] Caught:`, err.name, err.message);
  }
}

async function main() {
  for (const m of modelsToTest) {
    await testOne(m);
  }
}

main();
