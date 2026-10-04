# JobHunt India — v1.0 Project Status

**Date:** October 4, 2026
**Version:** v1.0.0 — Launch Ready
**Deployment:** https://subhash-jobhunt.vercel.app
**Build:** 51 routes, 0 TypeScript errors, 0 prerender errors
**Lighthouse:** Performance 94 · Accessibility 98 · Best Practices 96 · SEO 100

---

## Route Matrix (51 routes)

| Route | Type | Status | Description |
| :--- | :---: | :---: | :--- |
| `/` | Dynamic | ✅ Live | 3-column opportunity feed with category tabs & Frosted Obsidian filter bar |
| `/dashboard` | Dynamic | ✅ Live | Candidate dashboard: streak counter, weekly goal progress, AI quota monitor |
| `/insights` | Dynamic | ✅ Live | Market intelligence: skill demand frequency, salary spreads, company acceptance rates |
| `/placement` | Dynamic | ✅ Live | Off-campus drive aggregator with batch selector & Google Calendar deadline sync |
| `/college` | Dynamic | ✅ Live | Campus hiring feed filtered for candidate's college |
| `/discover` | Dynamic | ✅ Live | Company careers domain submission & ATS scraping queue |
| `/u/[slug]` | Dynamic | ✅ Live | Public candidate profile page with verified links & skill badges |
| `/community/interview` | Dynamic | ✅ Live | Crowdsourced interview experiences feed with upvoting |
| `/community/oa-tracker` | Dynamic | ✅ Live | Online Assessment log tracker & company test pattern boards |
| `/community/referrals` | Dynamic | ✅ Live | Employee referral exchange board with Supabase Realtime DMs |
| `/community/ppo` | Static | ✅ Live | PPO Tracker: company intern-to-fulltime conversion rate cards |
| `/resume-lab` | Dynamic | ✅ Live | Resume version manager, ATS score tracker, AI weak-section detector, peer benchmarking |
| `/ai/cover-letter` | Dynamic | ✅ Live | AI Cover Letter Generator with 4 tone presets & 1-click clipboard copy |
| `/ai/resume-analyse` | Dynamic | ✅ Live | AI resume analysis and keyword extraction against a target job |
| `/jobs/[id]/roadmap` | Dynamic | ✅ Live | Personal skill gap roadmap & free learning resources |
| `/jobs/[id]/interview` | Dynamic | ✅ Live | Interactive AI mock interview prep (DSA, System Design, Domain, HR Q&A) |
| `/tracker` | Dynamic | ✅ Live | Kanban application pipeline with outcome report prompt |
| `/saved` | Dynamic | ✅ Live | Shortlist manager with sliding tab indicators & bulk move action bar |
| `/profile` | Dynamic | ✅ Live | Profile form: PDF parser, GitHub sync, Google Calendar connect, RSS Feed URL |
| `/watchlists` | Dynamic | ✅ Live | Watchlist keyword/location rules with delta detection & calendar sync |
| `/recruiter` | Static | ✅ Live | Recruiter signup, verification, job posting & my-postings dashboard |
| `/admin/source-health` | Static | ✅ Live | Admin-gated ingestion health monitor with AI usage bars |
| `/sitemap.xml` | Static | ✅ Live | Dynamic sitemap including all public profile slugs |
| `/auth/login` | Static | ✅ Live | Auth login page |
| `/auth/signup` | Static | ✅ Live | Auth signup page |
| `GET /api/feed/[token]` | API | ✅ Live | Personal RSS 2.0 feed for watchlist-matched saved jobs |
| `POST/GET /api/resume-lab/benchmark` | API | ✅ Live | Anonymous ATS score benchmarking & percentile ranking |
| `POST /api/community/dms/start` | API | ✅ Live | Realtime DM conversation initialization |
| `GET/POST /api/community/dms/[id]/messages` | API | ✅ Live | Fetch & send DM messages (with participant auth check + rate limit) |
| `GET/POST /api/community/ppo` | API | ✅ Live | PPO report submission & company conversion rate upsert |
| `GET/POST /api/placement/drives` | API | ✅ Live | Off-campus drive listing & user drive reporting |
| `GET /api/jobs/[id]/fit` | API | ✅ Live | AI-powered multi-vector fit score computation |
| `GET /api/jobs/[id]/roadmap` | API | ✅ Live | Skill gap roadmap & free resource links |
| `GET /api/jobs/[id]/interview` | API | ✅ Live | Mock interview question generation |
| `POST /api/ai/tailor-resume` | API | ✅ Live | AI resume tailoring for specific job |
| `POST /api/ai/cover-letter` | API | ✅ Live | AI cover letter generation |
| `POST /api/ai/resume-analyse` | API | ✅ Live | Resume keyword/ATS analysis |
| `GET /api/profile/github` | API | ✅ Live | GitHub project sync for authenticated user |
| `POST /api/profile/parse-resume` | API | ✅ Live | PDF resume parsing & AI autofill |

---

## Database (36 tables — migrations 0001 through 0010)

| Table | Purpose | Key Notes |
| :--- | :--- | :--- |
| `jobs` | Core job listings | 1,004+ rows. `canonical_apply_url` is unique dedup key |
| `profiles` | Candidate profiles | Extended: `rss_token` (0010), CGPA, college, GitHub, skills |
| `saved_jobs` | Candidate shortlists | Folder/stage tagging |
| `applications` | Tracker pipeline states | Status: applied → screening → interview → offer/rejected |
| `fit_scores` | Cached AI fit scores | Multi-vector: skill/cgpa/batch/semantic |
| `watchlists` | Saved search rules | Keyword + location rules |
| `watchlist_events` | Delta detection log | `synced_to_calendar` flag |
| `calendar_events_map` | Google Cal sync map | Maps internal refs to Google Event IDs |
| `calendar_links` | User OAuth tokens | `refresh_token` required for offline access |
| `resume_versions` | Uploaded PDF versions | ATS score + extracted text |
| `resume_benchmarks` | Anonymous ATS benchmarking | Peer percentile ranking data *(0010)* |
| `dm_conversations` | Referral DM threads | user_a, user_b, linked to referral request |
| `dm_messages` | DM message rows | Rate limited: 20/conversation/day |
| `community_referrals` | Referral board posts | Company, role, expiry date |
| `community_interview_exp` | Interview experiences | Upvote count, AI type, difficulty |
| `community_oa_logs` | OA attempt tracker | Company, platform, questions log |
| `community_conversion_reports` | Funnel outcome reports | Anonymous conversion data |
| `campus_drives` | Off-campus drive listings | Source, batch filter, deadline *(0009)* |
| `company_pages` | Company ATS registry | PPO rate, company domain |
| `company_oa_patterns` | Test pattern boards | Company-level OA stats |
| `campus_stats` | College-level stats | Placement rate, top recruiters |
| `recruiters` | Recruiter accounts | Verified flag, company domain *(0010)* |
| `recruiter_jobs` | Recruiter job postings | Active flag, skill array, CGPA cutoff *(0010)* |
| `job_sources` | Ingestion source registry | 10 active sources |
| `source_health_log` | Ingestion run history | Admin dashboard feed *(0010)* |
| `ai_usage_log` | AI call tracking | Per-provider, per-feature daily quotas |
| `mock_sessions` | Mock interview sessions | 10 Q&A pairs, scoring history *(0004)* |
| `roadmap_cache` | Skill gap roadmap cache | Expires 7 days, avoids duplicate AI calls *(0007)* |
| `user_submitted_jobs` | Extension/community job submissions | Lightweight schema, approval flow |
| `skill_gap_reports` | Aggregated skill gaps | Per-user, per-job market analysis |

---

## Ingestion Sources (10 active)

| Source | Adapter | Status | Notes |
| :--- | :--- | :---: | :--- |
| Internshala | Custom scraper | ✅ Active | India's largest intern platform |
| Unstop | Custom scraper | ✅ Active | Competitions + jobs |
| Freshersworld | Custom scraper | ✅ Active | Fresher-specific listings |
| Greenhouse | ATS API | ✅ Active | Official job board API |
| Lever | ATS API | ✅ Active | Official job board API |
| Ashby | ATS API | ✅ Active | Growing ATS for startups |
| JobSpy (LinkedIn) | JobSpy library | ✅ Active | Covers LinkedIn + Indeed |
| Jobicy | JSON feed | ✅ Active | Remote/global roles |
| Arbeitnow | JSON feed | ✅ Active | EU + remote roles |
| Wellfound | Custom scraper | ✅ Active | Startup jobs |
| Naukri | — | ⏸ Parked | HTTP 406 bot detection. Monitor JobSpy quarterly |
| Hirist | — | ⏸ Parked | DOM obfuscation. Low priority |

---

## AI Cascade Router

| Priority | Provider | Model | Free Daily Quota | Fallback |
| :---: | :--- | :--- | :---: | :---: |
| 1 (default) | **Groq** | `llama-3.3-70b-versatile` | 14,000 calls/day | → OpenRouter |
| 2 | **OpenRouter** | `qwen/qwen3.8-27b:free` | 180 calls/day | → Gemini |
| 3 (final) | **Google Gemini** | `gemini-2.5-flash` | 900 calls/day | → Error |

All three providers operational as of v1.0. Quota monitor visible in `/admin/source-health`.

---

## Chrome Extension (v1.0)

- **Location:** `extension/` directory in repo root
- **Install:** Load unpacked via Chrome → Extensions → Developer Mode → Load unpacked
- **Supported portals:** Internshala, Unstop, Naukri, LinkedIn, Greenhouse, Lever, Ashby
- **Features:**
  - Floating autofill drawer: name, email, phone, LinkedIn, GitHub
  - "Save This Job" — captures job metadata into `user_submitted_jobs` table
  - Popup stats: Saved / Applied / Interviews count from Supabase
  - Auto session sync every 10 minutes from open app tab

---

## Known Limitations

| Area | Issue | Workaround |
| :--- | :--- | :--- |
| Naukri | HTTP 406 bot detection | JobSpy covers LinkedIn/Indeed. Check Naukri quarterly |
| Hirist | DOM obfuscation | Low priority. Naukri RSS if ever accessible |
| OpenRouter quota | 180 calls/day (lowest) | Monitor via admin dashboard. Upgrade if saturating |
| Chrome Extension | Not published on Web Store | Load unpacked — $5 one-time fee to publish |
| CGPA eligibility | Sparse `cgpa_cutoff` data | Re-run `node scripts/enrich_jobs.mjs` to backfill |

---

## Security Controls

| Control | Mechanism | Status |
| :--- | :--- | :---: |
| Admin route protection | `proxy.ts` server-side redirect (non-admin → /) | ✅ |
| DM privacy | Participant check on GET /messages before returning data | ✅ Fixed in v1.0 |
| Saved jobs isolation | RLS policy + `user_id` filter in route handler | ✅ |
| Service key leak | SUPABASE_SERVICE_ROLE_KEY server-only — never returned to browser | ✅ |
| Auth refresh | `proxy.ts` refreshes session on every request | ✅ |

---

## Maintenance Checklist (monthly)

- [ ] Verify ingestion cron ran (`source_health_log` or GitHub Actions tab)
- [ ] Check OpenRouter free model availability — slugs change frequently:
      `curl https://openrouter.ai/api/v1/models -H "Authorization: Bearer $KEY" | jq '.data[] | select(.id | contains(":free")) | .id'`
- [ ] Check Supabase DB size: Project Settings → Usage. Alert at 400MB (free limit: 500MB)
- [ ] Run `npm audit` and patch critical CVEs
- [ ] Review `ai_usage_log` for quota saturation

---

## Phase 6 — Post-Launch Improvements

- **Chrome Web Store**: Publish extension ($5 one-time fee)
- **Naukri adapter**: Revisit via JobSpy's native Naukri support (test quarterly)
- **Community seeding**: Promote to real users (Amrita placements group, LinkedIn post)
- **PPO tracker seeding**: Needs 3+ reports per company — share with final-year students
- **Supabase upgrade**: When DB hits 400MB or 5,000 MAU
- **OpenRouter quota upgrade**: If AI features saturate 180/day limit
- **Google Search Console**: Submit sitemap URL for SEO indexing
