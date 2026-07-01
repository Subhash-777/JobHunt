create extension if not exists vector with schema public;

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
  user_id         uuid, -- Will add reference after profiles is created
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

alter table company_requests add constraint fk_company_requests_profiles foreign key (user_id) references profiles(id);

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
