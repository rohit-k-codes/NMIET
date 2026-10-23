import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

async function testModel(modelName: string) {
  console.log(`\nTesting generateContent for: ${modelName}`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Respond with the single word: "READY"' }],
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    console.log(`HTTP Status [${modelName}]:`, res.status, res.statusText);
    const data = await res.json();
    if (res.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`Response text [${modelName}]:`, text?.trim());
      return true;
    } else {
      console.log(`API Error [${modelName}]:`, JSON.stringify(data));
      return false;
    }
  } catch (err: any) {
    console.error(`Catch [${modelName}]:`, err.name, err.message);
    return false;
  }
}

async function main() {
  await testModel('gemini-3.8-flash');
  await testModel('gemini-2.5-flash');
}

main();
