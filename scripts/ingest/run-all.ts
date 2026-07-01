import { fetchInternshala } from './india/internshala';
import { fetchFreshersworld } from './india/freshersworld';
import { fetchUnstop } from './india/unstop';
import { runJobSpy } from './jobspy_adapter';
import { fetchGreenhouse } from './ats/greenhouse';
import { fetchLever } from './ats/lever';
import { fetchAshby } from './ats/ashby';
import { fetchGithubList } from './github_lists';
import { createClient } from '@supabase/supabase-js';
import { NormalizedJob } from './types';
import * as dotenv from 'dotenv';
import { callAICascade } from '../../lib/ai/cascade';

async function generateIngestSummary(title: string, company: string, description: string): Promise<string> {
  if (!description || description.trim().length < 10) {
    return 'No description available.';
  }
  
  const systemPrompt = `You are an assistant summarizing job listings for Indian students and graduates. 
Provide a concise 2-line summary of the role, highlighting key qualifications, key skills, seniority hint, and any urgent action note if applicable. Keep it under 250 characters. Do not add markdown or titles.`;

  const prompt = `Job Title: ${title} at ${company}
Description: ${description.slice(0, 3000)}`;

  try {
    const res = await callAICascade({
      prompt,
      systemPrompt,
      feature: 'ingest_summary'
    });
    return res.text.trim();
  } catch (err) {
    console.error(`Failed to generate summary for ${title} at ${company}:`, err);
    return 'Summary not available.';
  }
}
import path from 'path';
import WebSocket from 'ws';

// Load .env.local explicitly since we're running in tsx
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    realtime: { transport: WebSocket } as any
  }
);

function classifyRole(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('frontend') || t.includes('react') || t.includes('ui/ux') || t.includes('ui developer')) return 'Frontend';
  if (t.includes('backend') || t.includes('node') || t.includes('java') || t.includes('python')) return 'Backend';
  if (t.includes('fullstack') || t.includes('full stack')) return 'Fullstack';
  if (t.includes('data') || t.includes('machine learning') || t.includes('ai') || t.includes('analyst')) return 'Data';
  if (t.includes('devops') || t.includes('sre') || t.includes('cloud')) return 'DevOps';
  return 'Other';
}

function classifyCtcBucket(ctc: number | null): string {
  if (ctc === null) return 'unknown';
  if (ctc < 5) return '<5';
  if (ctc <= 10) return '5-10';
  if (ctc <= 20) return '10-20';
  return '20+';
}

function parseSalary(salaryStr: string | null): number | null {
  if (!salaryStr) return null;
  // very naive extraction of first number in LPA if possible
  const match = salaryStr.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)/i);
  if (match) return parseFloat(match[1]);
  return null;
}

export async function runIngestion(tier: number) {
  console.log(`Starting ingestion pipeline for Tier ${tier}...`);
  
  const promises: Promise<NormalizedJob[]>[] = [];

  if (tier === 1 || tier === 0) {
    promises.push(
      fetchGreenhouse('stripe'),
      fetchLever('cred'),
      fetchAshby('linear'),
      fetchGithubList('https://github.com/SimplifyJobs/Summer2026-Internships', 'dev')
    );
  }

  if (tier === 2 || tier === 0) {
    promises.push(
      fetchInternshala('software-development', 'bangalore'),
      fetchFreshersworld('software engineer', '')
    );
  }

  if (tier === 3 || tier === 0) {
    promises.push(
      fetchUnstop('software engineer', ''),
      runJobSpy('software engineer')
    );
  }

  const results = await Promise.allSettled(promises);

  const allJobs: NormalizedJob[] = [];
  
  results.forEach((res, i) => {
    if (res.status === 'fulfilled') {
      console.log(`Source ${i} returned ${res.value.length} jobs.`);
      allJobs.push(...res.value);
    } else {
      console.error(`Source ${i} failed:`, res.reason);
    }
  });

  console.log(`Total jobs fetched: ${allJobs.length}`);

  // Deduplicate on canonical source_url
  const uniqueJobsMap = new Map<string, NormalizedJob>();
  for (const job of allJobs) {
    if (!uniqueJobsMap.has(job.source_url)) {
      uniqueJobsMap.set(job.source_url, job);
    }
  }

  const dedupedJobs = Array.from(uniqueJobsMap.values());
  console.log(`Unique jobs after deduplication: ${dedupedJobs.length}`);

  // Normalise and Map to DB schema
  const dbRows = dedupedJobs.map(job => {
    const parsedCtc = parseSalary(job.salary_raw);
    const roleCat = classifyRole(job.title);
    
    let stipend_min: number | null = null;
    let stipend_max: number | null = null;
    if (job.stipend_raw) {
      const nums = job.stipend_raw.match(/\d+/g);
      if (nums && nums.length > 0) {
        stipend_min = parseInt(nums[0], 10);
        stipend_max = nums.length > 1 ? parseInt(nums[1], 10) : stipend_min;
      }
    }
    
    return {
      title: job.title,
      company: job.company,
      company_domain: job.company_domain,
      role_category: roleCat,
      location: [job.location_raw].filter(Boolean) as string[],
      work_mode: job.work_mode,
      employment_type: job.employment_type,
      ctc_min: parsedCtc,
      ctc_max: parsedCtc,
      ctc_bucket: classifyCtcBucket(parsedCtc),
      stipend_min,
      stipend_max,
      description: job.description_raw,
      source_type: job.source_type,
      source_name: job.source_name,
      source_url: job.source_url,
      canonical_apply_url: job.source_url,
      apply_url: job.apply_url,
      is_early_applicant: job.is_early_applicant ?? false,
      is_ppo_likely: job.is_ppo_mentioned ?? false,
    };
  });

  if (dbRows.length === 0) {
    console.log("No jobs to upsert.");
    return;
  }

  // Fetch existing jobs' summaries to avoid redundant AI calls
  const canonicalUrls = dbRows.map(r => r.canonical_apply_url);
  const existingSummaries = new Map<string, string>();
  try {
    const { data: existingJobs } = await supabase
      .from('jobs')
      .select('canonical_apply_url, description_summary')
      .in('canonical_apply_url', canonicalUrls);

    if (existingJobs) {
      for (const j of existingJobs) {
        if (j.description_summary) {
          existingSummaries.set(j.canonical_apply_url, j.description_summary);
        }
      }
    }
  } catch (err) {
    console.error('Failed to query existing summaries:', err);
  }

  console.log('Generating AI summaries for new jobs...');
  let summaryCallsCount = 0;
  const maxSummaryCalls = 20; // safe rate limiting cap per ingestion run
  
  const finalDbRows = [];
  for (const row of dbRows) {
    let description_summary = existingSummaries.get(row.canonical_apply_url) || null;
    
    if (!description_summary && summaryCallsCount < maxSummaryCalls) {
      summaryCallsCount++;
      console.log(`[AI Summary ${summaryCallsCount}/${maxSummaryCalls}] Generating for: ${row.title} @ ${row.company}...`);
      description_summary = await generateIngestSummary(row.title, row.company, row.description || '');
    }
    
    finalDbRows.push({
      ...row,
      description_summary: description_summary || 'Summary not available.'
    });
  }

  // Upsert to DB
  console.log('Upserting to database...');
  const chunkSize = 100;
  let successCount = 0;
  for (let i = 0; i < finalDbRows.length; i += chunkSize) {
    const chunk = finalDbRows.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from('jobs')
      .upsert(chunk, { onConflict: 'canonical_apply_url', ignoreDuplicates: false });
      
    if (error) {
      console.error('Error upserting chunk:', error);
    } else {
      successCount += chunk.length;
    }
  }

  console.log(`Upserted ${successCount} jobs successfully.`);

  // Watchlist delta detection
  console.log('Running watchlist delta detection...');
  try {
    const { data: activeWatchlists } = await supabase
      .from('watchlists')
      .select('*')
      .eq('active', true);

    if (activeWatchlists && activeWatchlists.length > 0) {
      const { syncWatchlistDeltaToCalendar } = await import('../../lib/calendar/watchlist-sync');
      
      for (const wl of activeWatchlists) {
        let matchedJobs = finalDbRows;
        
        // 1. Filter by keywords if specified
        if (wl.keywords && wl.keywords.length > 0) {
          const kwPatterns = wl.keywords.map((k: string) => k.toLowerCase());
          matchedJobs = matchedJobs.filter(job => {
            const title = (job.title || '').toLowerCase();
            const desc = (job.description || '').toLowerCase();
            return kwPatterns.some((pat: string) => title.includes(pat) || desc.includes(pat));
          });
        }
        
        // 2. Filter by locations
        if (wl.locations && wl.locations.length > 0) {
          const locs = wl.locations.map((l: string) => l.toLowerCase());
          matchedJobs = matchedJobs.filter(job => {
            const jobLocs = (job.location || []).map((l: string) => l.toLowerCase());
            return jobLocs.some((jl: string) => locs.some((wlLoc: string) => jl.includes(wlLoc) || wlLoc.includes(jl)));
          });
        }
        
        // 3. Filter by employment type
        if (wl.employment_type && wl.employment_type !== 'any' && wl.employment_type !== '') {
          matchedJobs = matchedJobs.filter(job => job.employment_type === wl.employment_type);
        }
        
        // 4. For any matched jobs, record event & sync
        if (matchedJobs.length > 0) {
          console.log(`Watchlist "${wl.name}" matched ${matchedJobs.length} new jobs.`);
          for (const job of matchedJobs) {
            const { data: dbJob } = await supabase
              .from('jobs')
              .select('id')
              .eq('canonical_apply_url', job.canonical_apply_url)
              .maybeSingle();
              
            if (dbJob) {
              // Create event
              const { error: eventErr } = await supabase
                .from('watchlist_events')
                .insert({
                  watchlist_id: wl.id,
                  event_type: 'new_match',
                  job_id: dbJob.id,
                  synced_to_calendar: false
                });
                
              if (!eventErr) {
                // Sync to calendar
                await syncWatchlistDeltaToCalendar(wl.user_id, wl, 1);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Watchlist delta check failed:', err);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const tierArg = args.find(a => a.startsWith('--tier='));
  const tier = tierArg ? parseInt(tierArg.split('=')[1], 10) : 0;
  runIngestion(tier).catch(console.error);
}
