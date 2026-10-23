import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

async function run() {
  console.log('Testing direct HTTP fetch to Google Generative Language API...');
  console.log('API key length:', apiKey.length);
  console.log('Key prefix:', apiKey.substring(0, 3));

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    console.log('HTTP Status:', res.status, res.statusText);
    const data = await res.json();
    if (res.ok) {
      console.log('Success! Models available count:', data.models?.length);
      console.log('Sample model names:', data.models?.slice(0, 3).map((m: any) => m.name));
    } else {
      console.log('API Error response:', JSON.stringify(data));
    }
  } catch (err: any) {
    console.error('Fetch caught error:', err.name, err.message);
  }
}

run();
