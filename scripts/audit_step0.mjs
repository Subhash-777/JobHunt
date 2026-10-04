import { createClient } from '@supabase/supabase-js';
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
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      envVars[key] = val;
    }
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('=== AUDIT 0.2: DB Tables ===');
  const expectedTables = [
    'jobs', 'profiles', 'saved_jobs', 'applications', 'resume_versions', 'fit_scores',
    'watchlists', 'watchlist_events', 'calendar_links', 'calendar_events_map', 'job_sources',
    'source_runs', 'company_pages', 'company_requests', 'skill_demand_daily', 'job_metrics_daily',
    'apply_clicks', 'interview_experiences', 'oa_logs', 'oa_patterns', 'referral_requests',
    'activity_log', 'achievements', 'ai_usage_log', 'resume_leaderboard', 'resume_outcomes',
    'community_conversion_reports', 'college_hires', 'user_submitted_jobs'
  ];

  const results = await Promise.all(
    expectedTables.map(async (table) => {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      return { table, exists: !(error && (error.code === '42P01' || error.message?.includes('does not exist'))) };
    })
  );

  const found = results.filter(r => r.exists).map(r => r.table);
  const missing = results.filter(r => !r.exists).map(r => r.table);
  console.log(`Found ${found.length}/${expectedTables.length} tables.`);
  if (missing.length > 0) {
    console.log('Missing tables:', missing);
  }

  console.log('\n=== AUDIT 0.3: RLS Policy Check ===');
  const userTables = ['profiles', 'saved_jobs', 'applications', 'resume_versions', 'fit_scores', 'watchlists'];
  const anonClient = createClient(supabaseUrl, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await Promise.all(userTables.map(async (t) => {
    const { error } = await anonClient.from(t).select('*').limit(1);
    console.log(`Anon select on '${t}': ${error ? error.message : 'OK / Allowed'}`);
  }));

  console.log('\n=== AUDIT 0.5: AI Cascade Test ===');
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${envVars.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say test' }],
        max_tokens: 5
      })
    });
    console.log('Groq API status:', groqRes.status, groqRes.ok ? 'OK' : await groqRes.text());
  } catch (e) {
    console.error('Groq test failed:', e.message);
  }

  console.log('\n=== AUDIT 0.6: Ingestion Health ===');
  const { data: sourceStats, error: srcErr } = await supabase
    .from('jobs')
    .select('source_name, created_at');

  if (srcErr) {
    console.error('Jobs fetch error:', srcErr.message);
  } else if (sourceStats) {
    const map = {};
    for (const r of sourceStats) {
      const src = r.source_name || 'unknown';
      if (!map[src]) map[src] = { count: 0, latest: r.created_at };
      map[src].count++;
      if (r.created_at > map[src].latest) map[src].latest = r.created_at;
    }
    console.log('Job counts by source:', map);
  }

  console.log('\n=== AUDIT 0.7: Google Calendar Config ===');
  console.log('Client ID set:', !!envVars.GOOGLE_CALENDAR_CLIENT_ID);
  console.log('Client Secret set:', !!envVars.GOOGLE_CALENDAR_CLIENT_SECRET);
}

runAudit();
