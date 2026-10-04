# 🚀 JobHunt India — Production Deployment & Operations Guide (v1.0)

This guide provides step-by-step instructions for deploying and running **JobHunt India** on production infrastructure with zero recurring SaaS costs.

---

## 1. Supabase Production Setup

1. **Create Project**: Go to [database.new](https://database.new) and create a new project named `JobHunt-Production`. Select Region: `ap-south-1 (Mumbai)` for lowest latency in India.
2. **Run Migrations**: In the SQL Editor, execute **all 10 migrations** in numerical order from `supabase/migrations/`:
   - `0001_initial_schema.sql` — Core tables (jobs, profiles, saved_jobs, applications, etc.)
   - `0002_auth_trigger.sql` — Auto-create profile row on signup
   - `0003_applications_unique.sql` — Unique constraint on application pipeline
   - `0004_mock_sessions.sql` — Mock interview sessions table
   - `0005_fix_auth_trigger.sql` — Auth trigger fix
   - `0006_enhanced_profile.sql` — Extended profile fields (CGPA, college, GitHub, skills)
   - `0007_roadmap_cache.sql` — Skill gap roadmap AI cache
   - `0008_realtime_dms.sql` — Realtime DM conversations & messages
   - `0009_campus_drives.sql` — Off-campus drive listings
   - `0010_rss_recruiter.sql` — RSS token, recruiter panel, resume benchmarks, source health log *(Phase 5)*
3. **Enable Database Extensions**:
   ```sql
   create extension if not exists vector;
   create extension if not exists pg_trgm;
   create extension if not exists unaccent;
   ```
4. **Storage Bucket Setup**:
   - Create bucket: `resumes`
   - Privacy: **Private**
   - File size limit: `5MB`
   - Allowed MIME types: `application/pdf`
5. **Authentication Configuration**:
   - Enable Email/Password signup in Authentication → Providers.
   - Add Redirect URL: `https://subhash-jobhunt.vercel.app/auth/callback`
6. **Daily Skill Demand Aggregation Task (`pg_cron`)**:
   ```sql
   select cron.schedule('skill-demand-daily', '0 3 * * *', $$
     insert into skill_demand_daily (skill, demand_count, logged_at)
     select unnest(key_skills) as skill, count(*) as demand_count, current_date
     from jobs where posted_at > now() - interval '30 days'
     group by skill;
   $$);
   ```

---

## 2. Google Cloud OAuth & Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create project `JobHunt-India`.
2. Enable **Google Calendar API** under APIs & Services.
3. Configure OAuth Consent Screen (External):
   - App Name: `JobHunt India`
   - Scopes: `https://www.googleapis.com/auth/calendar`, `https://www.googleapis.com/auth/calendar.events`
4. Create OAuth 2.0 Web Client Credentials:
   - Authorized Javascript Origins: `https://subhash-jobhunt.vercel.app`
   - Authorized Redirect URIs: `https://subhash-jobhunt.vercel.app/api/calendar/google/callback`
5. Copy Client ID and Client Secret into Vercel and `.env.local`.

---

## 3. Free-Tier AI Model Gateways & Verified Model Slugs

JobHunt India uses a zero-cost 3-tier cascade fallback:

### A. Groq API (`llama-3.3-70b-versatile`)
- Sign up at [console.groq.com](https://console.groq.com) and generate an API key.
- Free quota: 14,000 requests/day.

### B. OpenRouter API (`qwen/qwen3.8-27b:free`)
- Sign up at [openrouter.ai](https://openrouter.ai) and generate an API key.
- Free quota: 180 requests/day.

### C. Google Gemini API (`gemini-2.5-flash`)
- Sign up at [aistudio.google.com](https://aistudio.google.com) and create an API key.
- Free quota: 900 requests/day.

---

## 4. GitHub Repository Secrets & Actions CI/CD Setup

In your GitHub repository, navigate to **Settings → Secrets and variables → Actions** and add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_ADMIN_EMAIL` — your admin email address for `/admin/source-health` access control
- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`

The workflow `.github/workflows/ingest.yml` automatically triggers `scripts/ingest/run-all.ts` every 6 hours.

### .env.local Template (local development)
```bash
NEXT_PUBLIC_APP_URL=https://subhash-jobhunt.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
GROQ_API_KEY=[your-groq-key]
OPENROUTER_API_KEY=[your-openrouter-key]
GEMINI_API_KEY=[your-gemini-key]
NEXT_PUBLIC_ADMIN_EMAIL=[your-email@domain.com]
GOOGLE_CALENDAR_CLIENT_ID=[your-client-id]
GOOGLE_CALENDAR_CLIENT_SECRET=[your-client-secret]
```

---

## 5. Chrome Extension Distribution

The Chrome Extension lives in the `extension/` directory.

**Option A — Developer Mode (personal use):**
1. Open Chrome → `chrome://extensions`
2. Enable **Developer Mode** (toggle top-right)
3. Click **Load unpacked** → select the `extension/` folder
4. The JobHunt icon appears in the toolbar

**Option B — Chrome Web Store (public distribution):**
1. Pay the one-time $5 developer fee at [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
2. Upload `extension/` as a ZIP, complete the store listing, submit for review
3. Review typically takes 1–3 business days

---

## 6. Phase 5 New Database Tables

| Table | Added In | Purpose |
| :--- | :---: | :--- |
| `recruiters` | `0010` | Recruiter accounts with company info and verification status |
| `recruiter_jobs` | `0010` | Recruiter-posted jobs with skill/CGPA filters |
| `resume_benchmarks` | `0010` | Anonymous peer ATS score sharing and percentile ranking |
| `source_health_log` | `0010` | Ingestion run history powering the admin health dashboard |

---

## 7. Production Route Coverage (51 Routes)

See `PROJECT_STATUS.md` for the full route matrix. Key routes added in Phase 5:
- `/recruiter` — Employer signup, verification, and job posting
- `/admin/source-health` — Admin-only ingestion health monitor (protected by proxy.ts)
- `/sitemap.xml` — Dynamic SEO sitemap with all public profile slugs
- `/api/feed/[token]` — Personal RSS 2.0 watchlist feed
- `/api/resume-lab/benchmark` — Anonymous ATS benchmarking API

---

## 8. v1.0 Journey Verification Checklist

Run each of the 7 journeys on production (`subhash-jobhunt.vercel.app`) before any public announcement:

- [ ] **Journey 1 — First-time student user**: Signup → profile form → PDF parse → Google Calendar connect → feed eligibility chip → save job → calendar event created
- [ ] **Journey 2 — Job search and AI features**: Open job drawer → Tailor Resume response → ai_usage_log row added → roadmap renders with real resources → mock interview 10 Qs with scoring
- [ ] **Journey 3 — Community features**: Post interview experience → log OA → send DM → submit PPO report → confirm dm_messages DB row
- [ ] **Journey 4 — Watchlist → Calendar**: Create watchlist → insert synthetic matching job → run delta detection → confirm watchlist_events row → confirm calendar_events_map row → verify Google Calendar event
- [ ] **Journey 5 — Chrome Extension**: Load unpacked → navigate to Internshala job → popup shows logged-in name → autofill works → Save Job shows success → user_submitted_jobs row confirmed
- [ ] **Journey 6 — RSS Feed**: Copy feed URL from `/profile` → open in browser → valid RSS XML returned → W3C validator passes
- [ ] **Journey 7 — Recruiter flow**: Signup at `/recruiter` → post test job → confirm recruiters DB row → job visible in main feed → delete test job
