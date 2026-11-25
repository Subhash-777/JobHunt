-- Migration 0010: RSS Token, Recruiter Panel, Resume Benchmarking, Source Health
-- Date: 2026-10-04

-- ─── RSS token per profile ────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS rss_feed_token TEXT UNIQUE DEFAULT gen_random_uuid()::text
;

-- Ensure every existing profile has a token
UPDATE profiles SET rss_feed_token = gen_random_uuid()::text WHERE rss_feed_token IS NULL;

-- ─── Recruiter accounts ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recruiters (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  company_name  TEXT NOT NULL,
  company_domain TEXT,
  designation   TEXT,
  verified      BOOLEAN NOT NULL DEFAULT false,
  blocked       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recruiter job postings
CREATE TABLE IF NOT EXISTS recruiter_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id  UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  location      TEXT,
  job_type      TEXT DEFAULT 'full-time',
  skills        TEXT[] DEFAULT '{}',
  cgpa_cutoff   NUMERIC(3,2),
  apply_link    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ
);

-- ─── Anonymous resume score benchmarking ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume_benchmarks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID REFERENCES jobs(id) ON DELETE SET NULL,
  role_tag      TEXT,         -- e.g. "SDE Intern", "Data Analyst"
  ats_score     INTEGER CHECK (ats_score BETWEEN 0 AND 100),
  got_interview BOOLEAN,
  got_offer     BOOLEAN,
  yoe_bucket    TEXT,         -- "0-1", "1-3", "3-5"
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Source health log (for admin dashboard) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS source_health_log (
  id            SERIAL PRIMARY KEY,
  source_name   TEXT NOT NULL,
  run_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  jobs_fetched  INTEGER DEFAULT 0,
  jobs_inserted INTEGER DEFAULT 0,
  duration_ms   INTEGER,
  status        TEXT DEFAULT 'success',  -- 'success' | 'partial' | 'error'
  error_message TEXT
);

-- ─── RLS policies ─────────────────────────────────────────────────────────────
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_health_log ENABLE ROW LEVEL SECURITY;

-- Recruiter: own row only
CREATE POLICY "recruiter_own_row" ON recruiters
  FOR ALL USING (auth.uid() = user_id);

-- Recruiter jobs: public read of active listings, recruiter-only write
CREATE POLICY "recruiter_jobs_public_read" ON recruiter_jobs
  FOR SELECT USING (is_active = true);

CREATE POLICY "recruiter_jobs_own_write" ON recruiter_jobs
  FOR ALL USING (
    recruiter_id IN (SELECT id FROM recruiters WHERE user_id = auth.uid())
  );

-- Resume benchmarks: any authenticated user can insert; public read
CREATE POLICY "benchmarks_insert" ON resume_benchmarks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "benchmarks_read" ON resume_benchmarks
  FOR SELECT USING (true);

-- Source health log: only service-role key can read (RLS blocks all normal queries)
CREATE POLICY "source_health_admin_read" ON source_health_log
  FOR SELECT USING (false);
