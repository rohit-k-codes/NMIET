import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

async function run() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    if (res.ok) {
      const names = data.models?.map((m: any) => m.name.replace('models/', ''));
      console.log('Available models:', names);
    }
  } catch (err: any) {
    console.error(err);
  }
}

run();
