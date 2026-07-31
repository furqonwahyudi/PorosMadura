const fetch = require('node-fetch'); // or use global fetch if Node 18+
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using API Key:', apiKey);

const model = 'gemini-1.5-flash'; // Let's test a real known model!

async function test() {
  const requestBody = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Hello, respond with exactly one word: Success' }],
      },
    ],
  });

  try {
    console.log('Sending request to Gemini...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      }
    );

    console.log('Response Status:', response.status);
    const text = await response.text();
    console.log('Response Text:', text.substring(0, 500));
  } catch (err) {
    console.error('Request failed:', err);
  }
}

test();
