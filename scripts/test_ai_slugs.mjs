import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      envVars[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
}

async function testGroq(model) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${envVars.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say: OK' }],
        max_tokens: 10
      })
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Groq (${model}): OK ->`, data.choices?.[0]?.message?.content?.trim());
      return true;
    } else {
      console.log(`Groq (${model}): FAIL -> status ${res.status}`, await res.text());
      return false;
    }
  } catch (e) {
    console.log(`Groq (${model}): ERROR ->`, e.message);
    return false;
  }
}

async function testOpenRouter(model) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${envVars.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jobhuntindia.in',
        'X-Title': 'JobHunt India'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say: OK' }],
        max_tokens: 10
      })
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`OpenRouter (${model}): OK ->`, data.choices?.[0]?.message?.content?.trim());
      return true;
    } else {
      console.log(`OpenRouter (${model}): FAIL -> status ${res.status}`, await res.text());
      return false;
    }
  } catch (e) {
    console.log(`OpenRouter (${model}): ERROR ->`, e.message);
    return false;
  }
}

async function testGemini(model) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${envVars.GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say: OK' }] }]
      })
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Gemini (${model}): OK ->`, data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
      return true;
    } else {
      console.log(`Gemini (${model}): FAIL -> status ${res.status}`, await res.text());
      return false;
    }
  } catch (e) {
    console.log(`Gemini (${model}): ERROR ->`, e.message);
    return false;
  }
}

async function runTests() {
  console.log('=== Testing Groq Slugs ===');
  await testGroq('openai/gpt-oss-20b');
  await testGroq('llama-3.3-70b-versatile');
  await testGroq('llama-3.1-8b-instant');

  console.log('\n=== Testing OpenRouter Free Slugs ===');
  await testOpenRouter('qwen/qwen3.8-27b:free');
  await testOpenRouter('meta-llama/llama-3.3-70b-instruct:free');
  await testOpenRouter('deepseek/deepseek-r1:free');

  console.log('\n=== Testing Gemini Slugs ===');
  await testGemini('gemini-3.5-flash');
  await testGemini('gemini-2.5-flash');
  await testGemini('gemini-1.5-flash');
}

runTests();
