
# PART VI — BACKEND & DATA MODEL

---

## 29. Architecture

Unchanged at the top level from the prior plan iterations — this remains the right shape, validated independently by `billyweinberger/job-scraping-app` and `job-radar`'s structurally similar designs found in research: **Next.js + React + Tailwind** frontend, **Next.js route handlers** as the BFF (no separate server), **Supabase Postgres + Auth + Storage + Realtime** for data, **GitHub Actions** for all scheduled ingestion (no dedicated scraping server), **Python workers invoked as GitHub Actions subprocess steps** for JobSpy and Playwright-heavy scraping where Python's ecosystem is stronger than Node's, and **Postgres-first search/analytics** (pg_trgm + pgvector), explicitly avoiding a dedicated search service like Typesense despite Geezap and Jobseek both using it — the added infrastructure and learning surface isn't justified at this project's scale and budget, and Postgres full-text + trigram search comfortably covers the need.

**One addition to the architecture for this version: a Google OAuth token store and a calendar-sync worker**, both detailed in Section 32.

## 30. Complete Database Schema v3

This schema is the union of every table introduced across all prior plan iterations plus the new tables required for ATS source tracking, watchlists, company discovery, Google Calendar sync, and the crowding/trust/urgency scoring system.

```sql
-- ═══════════════════════════════════════════════════════════
-- CORE: JOBS (extended with all v3 intelligence fields)
-- ═══════════════════════════════════════════════════════════
create table jobs (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  company               text not null,
  company_domain        text,
  role_category         text,
  location              text[],
  work_mode             text,                -- 'onsite'|'hybrid'|'remote'|'unknown'
  employment_type       text,                -- 'internship'|'full_time'|'contract'|'part_time'|'unknown'
  ctc_min               numeric,
  ctc_max               numeric,
  ctc_bucket            text,                -- dropdown bucket, NOT a slider value
  stipend_min           numeric,
  stipend_max           numeric,
  stipend_bucket        text,
  experience_min        int,
  experience_max        int,
  batch_years           int[],
  cgpa_cutoff           numeric,
  degree_required       text[],
  branch_required       text[],
  key_skills            text[],
  description           text,
  description_summary   text,                -- AI TL;DR, generated once at ingest
  description_embedding vector(384),
  source_type           text not null,       -- 'ats'|'board'|'india_platform'|'github_list'|'community'|'discovery'
  source_name           text not null,       -- 'greenhouse'|'naukri'|'internshala'|etc.
  source_url            text not null,
  canonical_apply_url   text not null unique,-- dedup key, stripped of tracking params
  external_id           text,
  apply_url             text,
  posted_at             timestamptz,
  deadline              timestamptz,
  deadline_confidence   text default 'unknown', -- 'explicit'|'inferred'|'unknown'
  has_bond              boolean default false,
  is_ppo_likely         boolean default false,
  is_early_applicant    boolean,
  is_off_campus         boolean default false,
  is_recruiter_posted   boolean default false,

  -- ── v3 Intelligence fields ──
  eligibility_json      jsonb,               -- cached eligibility reasons structure
  reliability_score     int,                 -- 0-100
  reliability_badge     text,                -- 'official'|'cross_verified'|'community_verified'|'low_confidence'
  cross_verified_count  int default 1,       -- how many independent sources confirm this listing
  crowding_score        int,                 -- 0-100
  hidden_gem_score       int,                -- 0-100
  urgency_score          int,                -- 0-100
  is_trending            boolean default false, -- velocity signal (Section 10.9)
  quality_score          int,                -- listing completeness/moderation score

  tags                  text[],
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index on jobs (role_category);
create index on jobs (deadline);
create index on jobs (posted_at desc);
create index on jobs (ctc_bucket);
create index on jobs (stipend_bucket);
create index on jobs (reliability_badge);
create index on jobs (hidden_gem_score desc);
create index on jobs (crowding_score);
create index on jobs using gin (key_skills);
create index on jobs using gin (location);
create index on jobs using gin (batch_years);
create index on jobs using ivfflat (description_embedding vector_cosine_ops) with (lists = 100);
create index on jobs using gin (to_tsvector('english', title || ' ' || company)); -- fast keyword search

-- ═══════════════════════════════════════════════════════════
-- SOURCE REGISTRY & HEALTH
-- ═══════════════════════════════════════════════════════════
create table job_sources (
  id                 uuid primary key default gen_random_uuid(),
  source_name        text unique not null,
  source_type        text not null,           -- 'ats'|'board'|'india_platform'|'github_list'
  cadence_tier       int default 2,           -- 1=2h, 2=4h, 3=6h
  reliability_score  int,
  last_health_check  timestamptz,
  active             boolean default true,
  config_json        jsonb,                   -- adapter-specific config (board tokens, etc.)
  created_at         timestamptz default now()
);

create table source_runs (
  id               uuid primary key default gen_random_uuid(),
  source_name      text not null,
  last_commit_hash text,                      -- for GitHub list delta detection
  last_run_at      timestamptz,
  jobs_found       int,
  jobs_inserted    int,
  jobs_updated     int,
  error_log        text
);

-- ═══════════════════════════════════════════════════════════
-- ATS COMPANY REGISTRY (curated, ~500 Indian companies + global)
-- ═══════════════════════════════════════════════════════════
create table company_pages (
  id              uuid primary key default gen_random_uuid(),
  name            text unique not null,
  slug            text unique not null,
  ats_type        text,                       -- 'greenhouse'|'lever'|'ashby'|'workday'|'custom'|null
  ats_token       text,                       -- board token/org slug for the ATS adapter
  careers_url     text,
  logo_url        text,
  industry        text,
  hq_location     text,
  employee_count  text,
  description     text,
  ppo_rate        numeric,
  ppo_reports     int default 0,
  interview_tags  text[],
  posting_history jsonb,                      -- [{month, count}] for hiring-recency chart
  updated_at      timestamptz default now()
);

create table job_duplicates (
  id              uuid primary key default gen_random_uuid(),
  primary_job_id  uuid references jobs(id) on delete cascade,
  duplicate_url   text not null,
  duplicate_source text,
  match_type      text,                       -- 'exact_url'|'external_id'|'fuzzy_match'
  created_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- COMPANY DISCOVERY
-- ═══════════════════════════════════════════════════════════
create table company_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id),
  submitted_url   text not null,
  detected_ats    text,                       -- auto-detected during validation, null if unmatched
  status          text default 'pending',     -- 'pending'|'queued'|'scraping'|'live'|'rejected'
  request_count   int default 1,              -- increments if multiple users request the same domain
  created_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- PROFILES (extended)
-- ═══════════════════════════════════════════════════════════
create table profiles (
  id                    uuid primary key references auth.users on delete cascade,
  full_name             text,
  email                 text,
  phone                 text,
  college               text,
  degree                text,
  branch                text,
  graduation_year       int,
  cgpa                  numeric,
  skills                text[],
  certifications        text[],
  github_url            text,
  linkedin_url          text,
  portfolio_url         text,
  resume_path           text,
  resume_text           text,
  experience            jsonb,
  preferred_roles       text[],
  preferred_locations   text[],
  open_to_work          boolean default true,
  public_profile        boolean default false,
  public_slug           text unique,
  weekly_goal           int default 5,
  current_streak        int default 0,
  longest_streak        int default 0,
  last_active_date      date,
  profile_complete_pct  int default 0,
  rss_feed_token        text unique,          -- for the private RSS feed (Section 10.7)
  user_type             text default 'student',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- GOOGLE CALENDAR INTEGRATION (the only reminder system)
-- ═══════════════════════════════════════════════════════════
create table calendar_links (
  user_id           uuid primary key references profiles(id) on delete cascade,
  google_email      text,
  access_token      text,                     -- encrypted at rest via Supabase Vault
  refresh_token     text,                     -- encrypted at rest via Supabase Vault
  token_expiry      timestamptz,
  sync_mode         text default 'full',      -- 'full'|'quick_add_only'
  calendar_id       text default 'primary',
  connected_at      timestamptz default now(),
  last_synced_at    timestamptz
);

create table calendar_events_map (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  google_event_id text not null,
  internal_type   text not null,              -- 'deadline'|'interview'|'oa_reminder'|'prep_reminder'|'watchlist_delta'
  internal_ref_id uuid,                       -- job_id, application_id, or watchlist_id depending on type
  created_at      timestamptz default now(),
  unique (user_id, internal_type, internal_ref_id)
);

-- ═══════════════════════════════════════════════════════════
-- WATCHLISTS
-- ═══════════════════════════════════════════════════════════
create table watchlists (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  name              text not null,
  keywords          text[],
  categories        text[],
  locations         text[],
  employment_type   text,
  batch_years       int[],
  min_fit_score     int,
  max_crowding      text,                     -- 'any'|'low'|'medium'
  official_only     boolean default false,
  active            boolean default true,
  created_at        timestamptz default now()
);

create table watchlist_events (
  id            uuid primary key default gen_random_uuid(),
  watchlist_id  uuid references watchlists(id) on delete cascade,
  event_type    text not null,                -- 'new_match'|'comp_updated'|'mode_changed'|'deadline_shortened'|'removed'
  job_id        uuid references jobs(id),
  detail        jsonb,
  synced_to_calendar boolean default false,
  created_at    timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- SAVED JOBS / TRACKER / RESUME (largely unchanged from prior iterations)
-- ═══════════════════════════════════════════════════════════
create table saved_jobs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  job_id      uuid references jobs(id) on delete cascade,
  folder      text default 'shortlisted',     -- 'shortlisted'|'applied'|'oa'|'interview'|'offer'|'rejected'
  notes       text,
  ignored     boolean default false,          -- permanent mute (Section 10.5)
  saved_at    timestamptz default now(),
  unique (user_id, job_id)
);

create table ignored_companies (
  user_id    uuid references profiles(id) on delete cascade,
  company    text not null,
  created_at timestamptz default now(),
  primary key (user_id, company)
);

create table resume_versions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  version_name text not null,
  role_tags    text[],
  storage_path text not null,
  resume_text  text,
  ats_score    int,
  is_default   boolean default false,
  created_at   timestamptz default now()
);

create table applications (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references profiles(id) on delete cascade,
  job_id            uuid references jobs(id),
  resume_version_id uuid references resume_versions(id),
  status            text default 'applied',
  applied_at        timestamptz,
  oa_date           timestamptz,
  interview_date    timestamptz,
  offer_ctc         numeric,
  notes             text,
  cover_letter      text,
  position          int,
  updated_at        timestamptz default now()
);

create table resume_outcomes (
  resume_version_id uuid references resume_versions(id) on delete cascade,
  role_category     text,
  applications_sent int default 0,
  oa_count          int default 0,
  interview_count   int default 0,
  offer_count       int default 0,
  updated_at        timestamptz default now(),
  primary key (resume_version_id, role_category)
);

create table fit_scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  job_id      uuid references jobs(id) on delete cascade,
  score       int,
  components  jsonb,
  reason      text,
  missing     text[],
  provider    text,
  computed_at timestamptz default now(),
  unique (user_id, job_id)
);

-- ═══════════════════════════════════════════════════════════
-- MARKET INTELLIGENCE (precomputed daily, Section 27.1 / 10.3)
-- ═══════════════════════════════════════════════════════════
create table skill_demand_daily (
  id                       uuid primary key default gen_random_uuid(),
  skill                    text not null,
  role_category            text,
  city                     text,
  count                    int,
  week_over_week_change    numeric,
  snapshot_date            date default current_date,
  unique (skill, role_category, city, snapshot_date)
);

create table job_metrics_daily (
  job_id      uuid references jobs(id) on delete cascade,
  date        date default current_date,
  views       int default 0,
  saves       int default 0,
  apply_clicks int default 0,
  primary key (job_id, date)
);

create table crowding_snapshots (
  job_id          uuid references jobs(id) on delete cascade,
  snapshot_date   date default current_date,
  crowding_score  int,
  primary key (job_id, snapshot_date)
);

create table apply_clicks (
  job_id     uuid references jobs(id) on delete cascade,
  clicked_at timestamptz default now()
  -- anonymous by design — no user_id
);

create table resume_leaderboard (
  job_id   uuid references jobs(id) on delete cascade,
  score    int,
  added_at timestamptz default now()
  -- anonymous by design — no user_id
);

-- ═══════════════════════════════════════════════════════════
-- COMMUNITY
-- ═══════════════════════════════════════════════════════════
create table interview_experiences (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id),
  company    text not null,
  role       text not null,
  year       int,
  rounds     jsonb,
  outcome    text,
  difficulty text,
  tags       text[],
  anonymous  boolean default false,
  upvotes    int default 0,
  created_at timestamptz default now()
);

create table oa_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  company      text not null,
  role         text,
  platform     text,
  test_date    date,
  topics       text[],
  difficulty   text,
  duration_min int,
  outcome      text,
  notes        text,
  anonymous    boolean default false,
  created_at   timestamptz default now()
);

create table oa_patterns (
  id           uuid primary key default gen_random_uuid(),
  company      text not null,
  platform     text,
  sections     jsonb,
  report_count int default 1,
  updated_at   timestamptz default now(),
  unique (company, platform)
);

create table referral_requests (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  company    text not null,
  role       text,
  message    text,
  fulfilled  boolean default false,
  created_at timestamptz default now()
);

create table community_conversion_reports (
  id              uuid primary key default gen_random_uuid(),
  company         text not null,
  role_category   text,
  got_oa          int default 0,
  got_interview   int default 0,
  got_shortlisted int default 0,
  median_response_days numeric,
  report_count    int default 0,
  updated_at      timestamptz default now(),
  unique (company, role_category)
);

create table college_hires (
  id         uuid primary key default gen_random_uuid(),
  company    text not null,
  college    text not null,
  year       int,
  role       text,
  anonymous  boolean default true,
  created_at timestamptz default now(),
  unique (company, college, year, role)
);

create table user_submitted_jobs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id),
  title           text not null,
  company         text not null,
  apply_url       text not null,
  location        text,
  work_mode       text,
  ctc_text        text,
  deadline        timestamptz,
  description     text,
  flags           int default 0,
  approved        boolean default false,
  auto_approve_at timestamptz default now() + interval '24 hours',
  created_at      timestamptz default now()
);

create table recruiters (
  id                 uuid primary key references auth.users on delete cascade,
  company_name       text,
  company_email      text unique,
  verified           boolean default false,
  dms_sent_this_week int default 0,
  created_at         timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- GAMIFICATION
-- ═══════════════════════════════════════════════════════════
create table activity_log (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references profiles(id) on delete cascade,
  action    text not null,
  job_id    uuid references jobs(id),
  logged_at date default current_date
);

create table achievements (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references profiles(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique (user_id, badge_key)
);

-- ═══════════════════════════════════════════════════════════
-- AI USAGE TRACKING
-- ═══════════════════════════════════════════════════════════
create table ai_usage_log (
  id         uuid primary key default gen_random_uuid(),
  provider   text not null,
  feature    text not null,
  tokens     int,
  created_at timestamptz default now()
);

create view ai_daily_usage as
  select provider, count(*) as calls, sum(tokens) as total_tokens
  from ai_usage_log where created_at >= now() - interval '24 hours'
  group by provider;

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════
alter table profiles enable row level security;
alter table saved_jobs enable row level security;
alter table applications enable row level security;
alter table watchlists enable row level security;
alter table watchlist_events enable row level security;
alter table calendar_links enable row level security;
alter table calendar_events_map enable row level security;
alter table fit_scores enable row level security;
alter table oa_logs enable row level security;
alter table activity_log enable row level security;
alter table achievements enable row level security;
alter table resume_versions enable row level security;
alter table ignored_companies enable row level security;
alter table company_requests enable row level security;

create policy "own profile"       on profiles            for all using (auth.uid() = id);
create policy "own saved"         on saved_jobs           for all using (auth.uid() = user_id);
create policy "own applications"  on applications         for all using (auth.uid() = user_id);
create policy "own watchlists"    on watchlists           for all using (auth.uid() = user_id);
create policy "own watchlist evt" on watchlist_events     for select using (
  watchlist_id in (select id from watchlists where user_id = auth.uid())
);
create policy "own calendar link" on calendar_links       for all using (auth.uid() = user_id);
create policy "own calendar map"  on calendar_events_map  for all using (auth.uid() = user_id);
create policy "own fit scores"    on fit_scores           for all using (auth.uid() = user_id);
create policy "own oa logs"       on oa_logs              for all using (auth.uid() = user_id);
create policy "own activity"      on activity_log         for all using (auth.uid() = user_id);
create policy "own achievements"  on achievements         for all using (auth.uid() = user_id);
create policy "own resumes"       on resume_versions      for all using (auth.uid() = user_id);
create policy "own ignores"       on ignored_companies    for all using (auth.uid() = user_id);
create policy "own requests"      on company_requests     for all using (auth.uid() = user_id);

create policy "jobs public"          on jobs                       for select using (true);
create policy "company pages public" on company_pages               for select using (true);
create policy "interview public"     on interview_experiences      for select using (true);
create policy "college public"       on college_hires              for select using (true);
create policy "oa pattern public"    on oa_patterns                for select using (true);
create policy "leaderboard public"   on resume_leaderboard         for select using (true);
create policy "conversion public"    on community_conversion_reports for select using (true);
create policy "public profiles"      on profiles                   for select using (public_profile = true);
```

## 31. API Surface v3

New route groups added on top of every endpoint already defined in prior plan iterations:

```
── WATCHLISTS ───────────────────────────────────────────
GET    /api/watchlists
POST   /api/watchlists
PATCH  /api/watchlists/[id]
DELETE /api/watchlists/[id]
GET    /api/watchlists/[id]/events

── COMPANY DISCOVERY ────────────────────────────────────
POST   /api/company-requests              (submit a careers URL)
GET    /api/company-requests/[id]/status
GET    /api/company/[slug]                (company page data + posting history)

── INSIGHTS ──────────────────────────────────────────────
GET    /api/insights/skills               (top/rising skills)
GET    /api/insights/heatmap              (city-level density)
GET    /api/insights/crowding             (platform-wide crowding distribution)
GET    /api/insights/sources              (source health summary)

── GOOGLE CALENDAR ───────────────────────────────────────
GET    /api/calendar/google/connect       (initiates OAuth flow)
GET    /api/calendar/google/callback      (OAuth redirect handler)
POST   /api/calendar/google/sync          (manual full sync trigger)
DELETE /api/calendar/google/disconnect
POST   /api/calendar/google/quick-add     (single-event quick-add link generator)

── RESUME LAB ────────────────────────────────────────────
GET    /api/resume-lab/performance        (per-version outcome stats)
GET    /api/resume-lab/recommended        (best version per category)
POST   /api/resume-lab/weak-sections      (AI weak-section detection)

── RSS FEED ──────────────────────────────────────────────
GET    /feed/[token].xml                  (personal watchlist RSS feed, public route)

── ADMIN / SOURCE HEALTH ─────────────────────────────────
GET    /api/admin/source-health
GET    /api/admin/moderation-queue
POST   /api/admin/moderation/[id]/approve
POST   /api/admin/moderation/[id]/reject
```

## 32. Google Calendar Integration — Full Implementation

Per the explicit requirement: **this is the only reminder/notification mechanism in the entire product.** No fallback notification system exists. The implementation below is complete and production-ready, synthesised from Google's own Node.js quickstart documentation and multiple independent implementation guides researched directly for this blueprint.

### 32.1 Google Cloud Setup (One-Time, Manual)

1. Create a project in Google Cloud Console.
2. Enable the **Google Calendar API** (APIs & Services → Library → search "Google Calendar API" → Enable).
3. Configure the OAuth consent screen: User Type = External (since this is a public-facing student app, not a Workspace-internal tool), add app name "JobHunt India," support email, and the `calendar` and `calendar.events` scopes.
4. Create OAuth 2.0 Client ID credentials (Web application type), with authorised redirect URI set to `https://jobhuntindia.in/api/calendar/google/callback` (and the equivalent `localhost` URI for local development).
5. Note the Client ID and Client Secret — these become `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET` environment variables.

This entire integration is free for this usage volume — the Google Calendar API has no billing requirement at typical personal-productivity-app scale, confirmed directly in Google's documentation.

### 32.2 OAuth Connection Flow

```typescript
// app/api/calendar/google/connect/route.ts
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
);

export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',   // REQUIRED to receive a refresh_token for long-lived access
    prompt: 'consent',        // REQUIRED to force refresh_token issuance even on re-auth
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
    ],
  });
  return Response.redirect(authUrl);
}
```

```typescript
// app/api/calendar/google/callback/route.ts
import { google } from 'googleapis';
import { supabaseRoute } from '@/lib/supabase/route-handler';

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get('code');
  const sb = supabaseRoute();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return Response.redirect('/auth/login');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
  );

  const { tokens } = await oauth2Client.getToken(code!);

  // Fetch the connected Google account's email for display purposes
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
  const { data: userInfo } = await oauth2.userinfo.get();

  // Store tokens (encrypted at rest via Supabase Vault in production)
  await supabaseAdmin().from('calendar_links').upsert({
    user_id:       session.user.id,
    google_email:  userInfo.email,
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token,   // only present on first consent — never overwrite with null
    token_expiry:  new Date(tokens.expiry_date!).toISOString(),
    connected_at:  new Date().toISOString(),
  }, { onConflict: 'user_id', ignoreDuplicates: false });

  // Trigger an immediate full sync of existing deadlines
  await triggerFullSync(session.user.id);

  return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/calendar?connected=true`);
}
```

### 32.3 Quick-Add (No OAuth Required) — For Users Who Skip Full Connection

A zero-friction fallback that works without any account connection, using Google Calendar's public event-creation template URL:

```typescript
// lib/calendar/quick-add.ts
export function buildQuickAddUrl(job: Job): string {
  if (!job.deadline) return '';
  const start = new Date(job.deadline);
  const end   = new Date(start.getTime() + 30 * 60000); // 30-minute placeholder event

  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');

  const params = new URLSearchParams({
    action:  'TEMPLATE',
    text:    `Apply: ${job.title} @ ${job.company}`,
    dates:   `${fmt(start)}/${fmt(end)}`,
    details: `Apply at: ${job.apply_url}\n\nAdded via JobHunt India.`,
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

// Used directly as an <a href> target — opens Google Calendar's own
// add-event screen pre-filled, no API call, no OAuth, works for any
// logged-in Google user instantly.
```

### 32.4 Full Sync — Event Creation, Update & Deletion

```typescript
// lib/calendar/sync.ts
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase/server';

async function getAuthorizedClient(userId: string) {
  const { data: link } = await supabaseAdmin()
    .from('calendar_links').select('*').eq('user_id', userId).single();
  if (!link) return null;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    access_token: link.access_token,
    refresh_token: link.refresh_token,
  });

  // googleapis automatically refreshes the access token using the refresh_token
  // when it's expired, as long as credentials are set — no manual refresh logic needed
  return oauth2Client;
}

export async function syncDeadlineEvent(userId: string, job: Job) {
  const auth = await getAuthorizedClient(userId);
  if (!auth) return; // not connected — silently skip, Quick-Add remains available

  const calendar = google.calendar({ version: 'v3', auth });
  const sb = supabaseAdmin();

  const { data: existing } = await sb.from('calendar_events_map')
    .select('google_event_id').eq('user_id', userId)
    .eq('internal_type', 'deadline').eq('internal_ref_id', job.id).maybeSingle();

  const eventBody = {
    summary:     `Apply: ${job.title} @ ${job.company}`,
    description: `Apply at: ${job.apply_url}\n\nTracked via JobHunt India.`,
    start: { dateTime: job.deadline, timeZone: 'Asia/Kolkata' },
    end:   { dateTime: new Date(new Date(job.deadline!).getTime() + 30*60000).toISOString(), timeZone: 'Asia/Kolkata' },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 7 * 24 * 60 },   // 7 days before
        { method: 'popup', minutes: 3 * 24 * 60 },   // 3 days before
        { method: 'popup', minutes: 1 * 24 * 60 },   // 1 day before
        { method: 'popup', minutes: 2 * 60 },        // 2 hours before
      ],
    },
  };

  if (existing) {
    await calendar.events.update({ calendarId: 'primary', eventId: existing.google_event_id, requestBody: eventBody });
  } else {
    const { data: created } = await calendar.events.insert({ calendarId: 'primary', requestBody: eventBody });
    await sb.from('calendar_events_map').insert({
      user_id: userId, google_event_id: created.id!,
      internal_type: 'deadline', internal_ref_id: job.id,
    });
  }
}

export async function syncInterviewEvent(userId: string, application: Application, job: Job) {
  const auth = await getAuthorizedClient(userId);
  if (!auth || !application.interview_date) return;

  const calendar = google.calendar({ version: 'v3', auth });
  const sb = supabaseAdmin();

  // Main interview event
  const { data: interviewEvent } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `Interview: ${job.title} @ ${job.company}`,
      start: { dateTime: application.interview_date, timeZone: 'Asia/Kolkata' },
      end:   { dateTime: new Date(new Date(application.interview_date).getTime() + 60*60000).toISOString(), timeZone: 'Asia/Kolkata' },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 24*60 }, { method: 'popup', minutes: 60 }] },
    },
  });
  await sb.from('calendar_events_map').insert({
    user_id: userId, google_event_id: interviewEvent.id!,
    internal_type: 'interview', internal_ref_id: application.id,
  });

  // Auto-created "prep reminder" 2 days prior (per Section 9 requirement)
  const prepDate = new Date(new Date(application.interview_date).getTime() - 2*86400000);
  const { data: prepEvent } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `Prep reminder: ${job.title} interview in 2 days`,
      description: `Review: company research, recent interview experiences for ${job.company}, your resume.`,
      start: { dateTime: prepDate.toISOString(), timeZone: 'Asia/Kolkata' },
      end:   { dateTime: new Date(prepDate.getTime() + 30*60000).toISOString(), timeZone: 'Asia/Kolkata' },
    },
  });
  await sb.from('calendar_events_map').insert({
    user_id: userId, google_event_id: prepEvent.id!,
    internal_type: 'prep_reminder', internal_ref_id: application.id,
  });
}

export async function removeDeadlineEvent(userId: string, jobId: string) {
  const auth = await getAuthorizedClient(userId);
  if (!auth) return;
  const calendar = google.calendar({ version: 'v3', auth });
  const sb = supabaseAdmin();

  const { data: existing } = await sb.from('calendar_events_map')
    .select('id, google_event_id').eq('user_id', userId)
    .eq('internal_type', 'deadline').eq('internal_ref_id', jobId).maybeSingle();

  if (existing) {
    await calendar.events.delete({ calendarId: 'primary', eventId: existing.google_event_id }).catch(() => {});
    await sb.from('calendar_events_map').delete().eq('id', existing.id);
  }
}
```

### 32.5 Watchlist Delta Events → Calendar (The Notification-Replacement Mechanism)

Since there is no notification centre in this build, watchlist deltas become same-day all-day Calendar events — this is how users learn about new matches without any push/email system:

```typescript
// lib/calendar/watchlist-sync.ts
export async function syncWatchlistDeltaToCalendar(userId: string, watchlist: Watchlist, newMatchCount: number) {
  const auth = await getAuthorizedClient(userId);
  if (!auth || newMatchCount === 0) return;

  const calendar = google.calendar({ version: 'v3', auth });
  const today = new Date().toISOString().split('T')[0];

  await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `🔔 ${newMatchCount} new match${newMatchCount > 1 ? 'es' : ''}: "${watchlist.name}"`,
      description: `Open JobHunt India to view: ${process.env.NEXT_PUBLIC_APP_URL}/watchlists/${watchlist.id}`,
      start: { date: today },   // all-day event — appears as a banner, not a timed slot
      end:   { date: today },
    },
  });

  await supabaseAdmin().from('watchlist_events').update({ synced_to_calendar: true })
    .eq('watchlist_id', watchlist.id).eq('event_type', 'new_match').is('synced_to_calendar', false);
}
```

This function is invoked from the ingestion pipeline itself, immediately after a new job is matched against any active watchlist with `sync_mode = 'full'` — making Calendar sync an integrated part of ingestion, not a separate notification layer bolted on afterward.

### 32.6 Token Refresh & Disconnection

`googleapis`'s `OAuth2Client` automatically refreshes an expired `access_token` using the stored `refresh_token` whenever credentials are set on the client (per Google's own documentation, confirmed in research) — no manual refresh-token-exchange logic is required in application code, only the responsibility to persist the refresh token securely on first consent and never overwrite it with null on subsequent token refreshes.

```typescript
// app/api/calendar/google/disconnect/route.ts
export async function DELETE() {
  const sb = supabaseRoute();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Revoke the token with Google (best practice — invalidates it server-side too)
  const { data: link } = await supabaseAdmin().from('calendar_links')
    .select('access_token').eq('user_id', session.user.id).single();
  if (link?.access_token) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${link.access_token}`, { method: 'POST' }).catch(() => {});
  }

  await supabaseAdmin().from('calendar_links').delete().eq('user_id', session.user.id);
  await supabaseAdmin().from('calendar_events_map').delete().eq('user_id', session.user.id);

  return Response.json({ disconnected: true });
}
```

## 33. Free AI Provider Orchestration

Unchanged in substance from the prior iteration's cascade design (Groq → OpenRouter free models → Gemini Flash-Lite → Gemini Flash → rule-based fallback), retained in full per Section 7. The one addition for this version is that the **fit score's two AI-assisted components** (Section 19.1) now explicitly degrade to a free TF-IDF-style overlap calculation rather than returning `null` when all providers are quota-exhausted — ensuring the Fit Score, Eligibility Engine, and Crowding Score (the three load-bearing intelligence features) are **never fully AI-dependent**, only AI-enhanced. This is a deliberate resilience upgrade: the original v2 cascade let AI features go fully blank on quota exhaustion; this version ensures the most important scores degrade gracefully instead.

---

# PART VII — BUILD PLAN

---

## 34. Phase-by-Phase Roadmap

### Phase 1 — Strong Aggregation MVP
Auth, profile basics, ATS adapters for Greenhouse/Lever/Ashby (Tier 1, cleanest sources), JobSpy integration for LinkedIn/Indeed/Naukri baseline coverage, GitHub curated-list ingestion, basic feed with dropdown filters (no sliders), save/apply tracking, eligibility chips, reliability badges, **Google Calendar Quick-Add** (no-OAuth version, ships first since it requires zero backend token infrastructure).

### Phase 2 — India-First Intelligence
Naukri/Internshala/Hirist/Freshersworld dedicated adapters, Unstop Playwright adapter, full eligibility engine with reasons panel, crowding score, hidden-gem score, urgency score, watchlists with delta detection, **Google Calendar full OAuth sync** (deadlines + interviews + prep reminders), placement season mode.

### Phase 3 — Resume & AI Layer
Resume Lab (versions + per-version outcome analytics), resume-job fit scoring (full weighted model), cover letter generation, skill roadmap / learning priority engine, mock interview prep, semantic search via pgvector.

### Phase 4 — Insights & Community
Market intelligence dashboard, city heatmap, skill frequency trending, interview experience feed, OA tracker + crowdsourced patterns, referral exchange, PPO tracker, community conversion reporting, college-specific feed.

### Phase 5 — Discovery & Advanced Sourcing
Company Discovery Request UI with auto-ATS-detection, generic extractor with Playwright JS-shell fallback for long-tail companies, source health dashboard with live link-checking, remaining Tier-2/3 ATS adapters (SmartRecruiters, Workable, Workday, Rippling, Recruitee, Teamtailor, BambooHR), Chrome extension with both autofill and "save this job" capture, personal RSS feed export, applied-jobs auto-disappear + permanent ignore/mute UX polish.

## 35. Minimum Viable Launch

A realistic, fully differentiated MVP requires: auth and onboarding (including the Google Calendar connection step), a profile with CGPA/batch/degree/branch/skills, a feed combining ATS-direct sources + JobSpy-covered boards + Naukri + Internshala + GitHub lists, save/tracker/status updates, eligibility chips, reliability badges, **Google Calendar Quick-Add at minimum, full OAuth sync as a fast-follow**, and basic watchlists. This is already meaningfully differentiated from every repo studied in the research sweep — none combine this breadth of sourcing with this depth of India-specific intelligence, and none have any calendar integration at all, let alone Google Calendar as a first-class, fully-synced system.

## 36. Risk Management

### 36.1 What Is Realistic on a Free Stack (Confirmed by Research)

Next.js + Vercel frontend: confirmed free at this scale by every comparable project studied. Supabase free tier for database/auth/storage: confirmed sufficient through MVP and moderate growth. GitHub Actions for all scheduled ingestion: confirmed viable at production scale by `adgramigna/job-board-scraper` (~$30/year total cost, mostly domain registration, not compute) and `billyweinberger/job-scraping-app` (fully GitHub-Actions-only architecture). Python + Playwright scraping at moderate scale: confirmed viable within GitHub Actions' free monthly minutes when scrapers are tiered by cadence (Section 11.1) rather than all running at maximum frequency. Google Calendar integration: confirmed free for this usage pattern directly from Google's own documentation — no billing account required for Calendar API access at personal-productivity-app scale. Free-tier AI usage with aggressive caching: confirmed sufficient by the multi-provider cascade design (Groq 14,400/day + OpenRouter 200/day + Gemini Flash-Lite 1,000/day comfortably covers realistic MVP-to-moderate-growth usage).

### 36.2 Main Risks

Some job boards (LinkedIn especially) are actively hostile to scraping and will throttle or block — JobSpy's own documentation confirms this is an inherent, permanent constraint, not a solvable engineering problem. Naukri and Internshala may change their HTML/API structure without notice, breaking scrapers until patched — mitigated by the multi-source design meaning no single source's breakage takes down the whole feed. Free AI quotas require careful caching discipline — a caching bug that causes redundant calls could exhaust daily quota faster than expected. Playwright-heavy scraping (Unstop, Foundit, generic long-tail extraction) is the most compute-expensive ingestion category and the most likely to approach GitHub Actions' free-minute ceiling if too many Tier-3 sources are added too quickly. Feature scope is large enough that shipping everything before validating core value with real users would delay launch unnecessarily.

### 36.3 Strategic Mitigation

Make ATS adapters and direct company pages the durable backbone of the entire ingestion system — this is the single most validated architectural decision across every repo studied (Jobseek, jobhive-py, job-board-scraper, job-seek all converge on the same insight independently). Treat LinkedIn, Naukri, and other anti-bot-hostile sources as **bonus coverage layered on top of the durable ATS backbone**, never as a survival dependency — exactly as JobSpy's own documentation and every prior plan iteration have already correctly concluded. Precompute as much as possible at ingest time (AI summaries, embeddings, eligibility extraction, skill extraction) rather than at user-view time, to control both AI quota consumption and page-load latency. Keep every AI feature optional with a graceful, visible fallback state — never a broken UI. Ship the India-first intelligence layer (eligibility, crowding, hidden-gem, reliability) early, in Phase 2, immediately after the aggregation MVP — this is the real, durable moat validated by the complete absence of any comparable feature across 30+ repos studied. Build Google Calendar integration as a Phase-1 Quick-Add (zero infrastructure) before the Phase-2 full OAuth sync, so the product has *a* working reminder mechanism from day one rather than waiting for the more complex integration to ship.

---

## Final Implementation Guidance

The build sequence that respects both the research findings and the realistic free-stack constraints:

1. Build the ingestion registry and the `NormalizedJob` contract first (Section 12.3) — every adapter, regardless of source category, must conform to this shape from day one, or normalisation work compounds painfully later.
2. Launch with Tier-1 ATS adapters (Greenhouse, Lever, Ashby — clean JSON/GraphQL APIs, no anti-bot risk) plus JobSpy for board coverage plus GitHub lists, since these are the lowest-risk, highest-reliability sources confirmed across every repo studied.
3. Ship Google Calendar Quick-Add (no OAuth) immediately as the first reminder mechanism — it requires zero backend token infrastructure and gives every user a working calendar action from launch day.
4. Add the India-specific scrapers (Naukri, Internshala, Hirist, Freshersworld, Unstop) as Phase 2, tiered by anti-bot risk per Section 13.4's documented cadence rules.
5. Layer in eligibility, crowding, hidden-gem, and reliability scoring before building further AI features — this intelligence layer is the actual differentiator, confirmed by its total absence across every comparable project researched.
6. Build the full Google Calendar OAuth sync once the deadline/interview data model is stable, since calendar sync depends on having reliable, well-populated deadline and interview-date fields to sync in the first place.
7. Use AI only where it creates genuine leverage that rules cannot replicate cheaply: summaries, fit reasoning, resume matching, learning roadmaps, cover letters, mock interview generation — never for tasks regex and controlled vocabularies already solve for free.
8. Keep every feature measurable from day one (the `job_metrics_daily`, `crowding_snapshots`, and `resume_outcomes` tables exist specifically so future iteration can be driven by what actually helps users get interviews, not by intuition alone).

This blueprint keeps the project ambitious while remaining fully phased and buildable on a genuinely free toolchain, and it surpasses every comparable open-source job-aggregator project studied — not through more scraping volume alone, but through the combination of comprehensive direct-source aggregation, India-first eligibility and competition intelligence, a fully-integrated Google Calendar reminder system, and outcome-driven learning that no other project in the entire research sweep combines.

---

*Last updated: June 2026*
*Research basis: 18 repos from github.com/topics/job-aggregator, 9 additional ATS/scraper-focused repos and topic sweeps, 10 India-specific scraper repos and marketplace listings, JobSpy/python-jobspy as primary multi-board library, and Google's official Calendar API documentation.*
*Stack: Next.js 14 · Supabase · Vercel · GitHub Actions · Groq · OpenRouter · Google Gemini · Google Calendar API · JobSpy (Python) · Playwright*
*Notification system: Google Calendar only. No email digests, no push notifications, no Telegram, no SMS.*
*Monthly cost: ₹0 (Google Calendar API is free at this usage scale; all other infrastructure as established in prior plan iterations).*
