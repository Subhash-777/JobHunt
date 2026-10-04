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

async function applyMigration() {
  console.log('Verifying table columns...');
  const { data: fitData, error: fitErr } = await supabase.from('fit_scores').select('id, roadmap_cache').limit(1);
  if (fitErr) {
    console.log('fit_scores check error:', fitErr.message);
  } else {
    console.log('fit_scores table has roadmap_cache column!');
  }

  const { data: jobData, error: jobErr } = await supabase.from('jobs').select('id, hidden_gem_score, crowding_score, urgency_score').limit(1);
  if (jobErr) {
    console.log('jobs score columns check error:', jobErr.message);
  } else {
    console.log('jobs table has score columns!');
  }
}

applyMigration();
