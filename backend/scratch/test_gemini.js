const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY exists:', !!apiKey);
if (apiKey) {
  console.log('GEMINI_API_KEY length:', apiKey.length);
  console.log('GEMINI_API_KEY prefix:', apiKey.substring(0, 5));
}

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, respond with a JSON object: {"status": "ok"}' }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });
    console.log('Status:', res.status);
    console.log('OK:', res.ok);
    const text = await res.text();
    console.log('Response text:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
