import { supabaseAdmin } from '@/lib/supabase/server';

interface AICallParams {
  prompt: string;
  systemPrompt?: string;
  jsonMode?: boolean;
  preferQuality?: boolean;
  feature: string;
}

interface AICallResult {
  text: string;
  provider: string;
  tokensUsed?: number;
}

async function getDailyCallCounts(): Promise<Record<string, number>> {
  try {
    const sb = supabaseAdmin();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await sb
      .from('ai_usage_log')
      .select('provider')
      .gte('created_at', twentyFourHoursAgo);
      
    if (error || !data) {
      console.error('Error fetching AI usage log:', error);
      return {};
    }
    
    const counts: Record<string, number> = {};
    for (const row of data) {
      counts[row.provider] = (counts[row.provider] || 0) + 1;
    }
    return counts;
  } catch (err) {
    console.error('Failed to query daily call counts from DB, assuming 0:', err);
    return {};
  }
}

async function logAIUsage(provider: string, feature: string, tokens: number) {
  try {
    const sb = supabaseAdmin();
    await sb.from('ai_usage_log').insert({ provider, feature, tokens });
  } catch (err) {
    console.error('Failed to log AI usage to DB:', err);
  }
}

async function callGroq(params: AICallParams): Promise<{ text: string; tokensUsed: number }> {
  const model = 'llama-3.3-70b-versatile';
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(params.systemPrompt ? [{ role: 'system', content: params.systemPrompt }] : []),
        { role: 'user', content: params.prompt }
      ],
      response_format: params.jsonMode ? { type: 'json_object' } : undefined,
      temperature: 0.2
    })
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }
  
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const tokensUsed = data.usage?.total_tokens || 0;
  return { text, tokensUsed };
}

async function callOpenRouter(params: AICallParams): Promise<{ text: string; tokensUsed: number }> {
  const model = 'qwen/qwen3.8-27b:free';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://jobhuntindia.in',
      'X-Title': 'JobHunt India'
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(params.systemPrompt ? [{ role: 'system', content: params.systemPrompt }] : []),
        { role: 'user', content: params.prompt }
      ],
      response_format: params.jsonMode ? { type: 'json_object' } : undefined,
      temperature: 0.2
    })
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
  }
  
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const tokensUsed = data.usage?.total_tokens || 0;
  return { text, tokensUsed };
}

async function callGemini(params: AICallParams): Promise<{ text: string; tokensUsed: number }> {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
  const reqBody: any = {
    contents: [
      {
        parts: [
          { text: params.prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: params.jsonMode ? 'application/json' : 'text/plain'
    }
  };
  
  if (params.systemPrompt) {
    reqBody.systemInstruction = {
      parts: [{ text: params.systemPrompt }]
    };
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqBody)
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokensUsed = data.usageMetadata?.totalTokenCount || Math.round((params.prompt.length + text.length) / 4);
  return { text, tokensUsed };
}

export async function callAICascade(params: AICallParams): Promise<AICallResult> {
  let callCounts: Record<string, number> = {};
  try {
    callCounts = await getDailyCallCounts();
  } catch (err) {
    console.error('Failed to query daily call counts from DB, assuming 0:', err);
  }
  
  const groqCount = callCounts['groq'] || 0;
  const openRouterCount = callCounts['openrouter'] || 0;
  const geminiCount = callCounts['gemini'] || 0;

  // Define steps based on preference
  const steps = params.preferQuality
    ? [
        {
          name: 'openrouter',
          eligible: openRouterCount < 180 && !!process.env.OPENROUTER_API_KEY,
          fn: () => callOpenRouter(params)
        },
        {
          name: 'gemini',
          eligible: geminiCount < 900 && !!process.env.GEMINI_API_KEY,
          fn: () => callGemini(params)
        },
        {
          name: 'groq',
          eligible: groqCount < 14000 && !!process.env.GROQ_API_KEY,
          fn: () => callGroq(params)
        }
      ]
    : [
        {
          name: 'groq',
          eligible: groqCount < 14000 && !!process.env.GROQ_API_KEY,
          fn: () => callGroq(params)
        },
        {
          name: 'openrouter',
          eligible: openRouterCount < 180 && !!process.env.OPENROUTER_API_KEY,
          fn: () => callOpenRouter(params)
        },
        {
          name: 'gemini',
          eligible: geminiCount < 900 && !!process.env.GEMINI_API_KEY,
          fn: () => callGemini(params)
        }
      ];

  for (const step of steps) {
    if (step.eligible) {
      try {
        const res = await step.fn();
        await logAIUsage(step.name, params.feature, res.tokensUsed);
        return { text: res.text, provider: step.name, tokensUsed: res.tokensUsed };
      } catch (err) {
        console.warn(`${step.name} call failed, falling through:`, err);
      }
    }
  }
  
  throw new Error('All AI providers exhausted or failed.');
}
