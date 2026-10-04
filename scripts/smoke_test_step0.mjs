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
      envVars[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
}

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function smokeTest() {
  console.log('=== 0.1 Jobs by Source ===');
  const { data: sources, error: srcErr } = await supabase
    .from('jobs')
    .select('source_name, created_at');
  
  if (srcErr) console.error('Error fetching jobs by source:', srcErr);
  else {
    const counts = {};
    for (const r of sources) {
      const src = r.source_name || 'unknown';
      if (!counts[src]) counts[src] = { jobs: 0, newest: r.created_at };
      counts[src].jobs++;
      if (r.created_at > counts[src].newest) counts[src].newest = r.created_at;
    }
    console.log('Source breakdown:', counts);
  }

  console.log('\n=== 0.2 Jobs with CGPA Cutoffs & Batch Years ===');
  const { count: cgpaCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .not('cgpa_cutoff', 'is', null);

  const { count: skillsCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .not('key_skills', 'is', null);

  console.log(`Jobs with CGPA cutoff: ${cgpaCount}`);
  console.log(`Jobs with key_skills: ${skillsCount}`);

  console.log('\n=== 0.3 Calendar Events Map ===');
  const { data: calEvents, error: calErr } = await supabase
    .from('calendar_events_map')
    .select('*')
    .limit(5);
  console.log(`Calendar events mapped: ${calEvents?.length || 0}`);

  console.log('\n=== 0.4 AI Usage Log (Last 24h) ===');
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: aiLogs } = await supabase
    .from('ai_usage_log')
    .select('provider, feature, created_at')
    .gte('created_at', twentyFourHoursAgo);

  const aiCounts = {};
  for (const r of aiLogs || []) {
    aiCounts[r.provider] = (aiCounts[r.provider] || 0) + 1;
  }
  console.log('AI Usage Counts in last 24h:', aiCounts);

  console.log('\n=== 0.5 Community Tables Count ===');
  const { count: expCount } = await supabase.from('interview_experiences').select('id', { count: 'exact', head: true });
  const { count: oaCount } = await supabase.from('oa_logs').select('id', { count: 'exact', head: true });
  const { count: refCount } = await supabase.from('referral_requests').select('id', { count: 'exact', head: true });
  console.log(`Interview experiences: ${expCount}, OA logs: ${oaCount}, Referral requests: ${refCount}`);
}

smokeTest();
