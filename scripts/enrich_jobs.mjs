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

function extractDomain(url, company) {
  try {
    if (url) {
      const hostname = new URL(url).hostname.replace('www.', '');
      if (!hostname.includes('internshala') && !hostname.includes('linkedin') && !hostname.includes('indeed') && !hostname.includes('unstop')) {
        return hostname;
      }
    }
  } catch (e) {}
  if (company) {
    return `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  }
  return 'techcorp.com';
}

function deriveSkills(title, category) {
  const text = `${title} ${category}`.toLowerCase();
  const matched = [];
  if (text.includes('frontend') || text.includes('react') || text.includes('ui')) {
    matched.push('React', 'TypeScript', 'TailwindCSS', 'JavaScript');
  }
  if (text.includes('backend') || text.includes('node') || text.includes('api')) {
    matched.push('Node.js', 'Python', 'SQL', 'PostgreSQL', 'REST API');
  }
  if (text.includes('data') || text.includes('ml') || text.includes('ai') || text.includes('python')) {
    matched.push('Python', 'SQL', 'Machine Learning', 'Data Analysis');
  }
  if (text.includes('fullstack') || text.includes('full stack')) {
    matched.push('React', 'Node.js', 'TypeScript', 'PostgreSQL');
  }
  if (text.includes('design') || text.includes('ux')) {
    matched.push('Figma', 'UI/UX Design', 'Wireframing');
  }
  if (matched.length === 0) {
    matched.push('JavaScript', 'Python', 'SQL', 'Git');
  }
  return Array.from(new Set(matched));
}

async function enrichAllJobs() {
  console.log('Fetching all jobs...');
  const { data: jobs, error } = await supabase.from('jobs').select('*');

  if (error || !jobs) {
    console.error('Failed to fetch jobs:', error);
    return;
  }

  console.log(`Enriching ${jobs.length} jobs in batches...`);
  const enrichedList = jobs.map((job) => {
    const domain = extractDomain(job.apply_url, job.company);
    const skills = job.key_skills && job.key_skills.length > 0 ? job.key_skills : deriveSkills(job.title, job.role_category);
    const cgpaCutoff = (job.id.charCodeAt(0) % 4 === 0) ? Number((7.0 + (job.id.charCodeAt(1) % 4) * 0.5).toFixed(1)) : null;

    return {
      ...job,
      company_domain: domain,
      key_skills: skills,
      cgpa_cutoff: cgpaCutoff,
      batch_years: [2025, 2026],
      hidden_gem_score: Math.floor(65 + (job.id.charCodeAt(0) % 30)),
      crowding_score: Math.floor(20 + (job.id.charCodeAt(1) % 60)),
      urgency_score: Math.floor(30 + (job.id.charCodeAt(2) % 50)),
      updated_at: new Date().toISOString()
    };
  });

  // Batch upsert in chunks of 200
  const chunkSize = 200;
  for (let i = 0; i < enrichedList.length; i += chunkSize) {
    const chunk = enrichedList.slice(i, i + chunkSize);
    const { error: upsertErr } = await supabase.from('jobs').upsert(chunk);
    if (upsertErr) {
      console.error(`Error upserting chunk ${i}:`, upsertErr.message);
    } else {
      console.log(`Upserted batch ${i / chunkSize + 1}`);
    }
  }

  // Populate skill_demand_daily
  console.log('Populating skill_demand_daily...');
  const skillCounts = {};
  for (const j of enrichedList) {
    for (const s of j.key_skills || []) {
      const category = j.role_category || 'Software';
      const city = j.location?.[0] || 'Bengaluru';
      const key = `${s}||${category}||${city}`;
      skillCounts[key] = (skillCounts[key] || 0) + 1;
    }
  }

  const rowsToInsert = Object.entries(skillCounts).slice(0, 100).map(([key, count]) => {
    const [skill, role_category, city] = key.split('||');
    return {
      skill,
      role_category,
      city,
      count,
      snapshot_date: new Date().toISOString().split('T')[0]
    };
  });

  const { error: skillErr } = await supabase.from('skill_demand_daily').upsert(rowsToInsert);
  if (skillErr) console.error('Skill demand error:', skillErr.message);
  else console.log(`Populated ${rowsToInsert.length} skill_demand_daily rows!`);
}

enrichAllJobs();
