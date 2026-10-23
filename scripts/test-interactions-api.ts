import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

async function testInteractionsEndpoint(url: string) {
  console.log(`\nTesting POST ${url}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        model: 'gemini-3.8-flash',
        input: 'Respond with the single word: "READY"',
      }),
      signal: AbortSignal.timeout(8000),
    });

    console.log('HTTP Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Response body:', JSON.stringify(data).slice(0, 300));
    return res.ok;
  } catch (err: any) {
    console.error('Catch error:', err.name, err.message);
    return false;
  }
}

async function main() {
  await testInteractionsEndpoint('https://generativelanguage.googleapis.com/v1beta/interactions');
  await testInteractionsEndpoint('https://generativelanguage.googleapis.com/v1beta2/interactions');
}

main();
