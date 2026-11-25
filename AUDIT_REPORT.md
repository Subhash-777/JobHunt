# JobHunt India — Launch Readiness Audit Report (v1.1 Live Verified)

**Date:** November 25, 2026  
**Auditor:** Antigravity AI  
**Scope:** Pre-Launch Evidence Audit across Repository, Database RLS, Authorization, Abuse Surface, Calendar OAuth, Data Quality, and Deployment Integrity.

---

## 1. Executive Summary & Findings Matrix

| ID | Check | PASS/FAIL/UNVERIFIED | Evidence | Severity | Proposed Fix |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **A1.1** | Working-tree secret scan | ✅ **PASS** | Remediated in commit `f7bbd98`. `insert_test_jobs.sh` deleted, pre-commit hook installed. | **Closed** | Clean. |
| **A1.2** | Full-history secret scan (all commits) | ✅ **PASS** | Extended scan 2 clean across all key formats (`sb_secret_`, `hf_`, `ghp_`, postgres). | **Low** | Verified clean. |
| **A1.3** | Repository visibility & forks | ⚠️ **INFO** | GitHub API confirms repository is **Public** (`Subhash-777/JobHunt`) with **0 forks**. | **High** | Push protection recommended. |
| **A1.4** | Leaked old key revocation | ⚠️ **UNVERIFIED** | Cloudflare DoH returned `Status: 3` (NXDOMAIN) for `xvityaqxxabpouuckkac`. Awaiting user dashboard confirmation. | **High** | Confirm project deletion in Supabase dashboard. |
| **A1.5** | Production service key in history | ✅ **PASS** | Verified clean across all historical commits. Production key unexposed. | **None** | Clean. |
| **A2.1** | Database RLS & Table Existence | ❌ **FAIL (Missing Migrations)** | Live probe: `dm_messages`, `dm_conversations` (0008) and `recruiter_jobs`, `source_health_log`, `resume_benchmarks` (0010) return **HTTP 404** (tables missing). | **Blocker** | Execute migrations `0008_realtime_dms.sql` and `0010_rss_recruiter.sql` on production. |
| **A2.2** | Schema drift on RSS token | ❌ **FAIL (Schema Drift)** | Live `profiles` schema has `rss_feed_token` (Section 30). `0010` and code query `rss_token` (`column profiles.rss_token does not exist`). | **Blocker** | Harmonize column reference or alias `rss_token` to `rss_feed_token`. |
| **A3.1** | Anon-key probes on sensitive tables | ✅ **PASS** | Probed `profiles`, `calendar_links`, `recruiters`, `ai_usage_log`, `user_submitted_jobs`: all return **HTTP 200, 0 rows** (RLS active and blocking unauthenticated reads). | **None** | Base RLS active. |
| **A3.2** | Public profile column leak | ❌ **FAIL (Design)** | Policy `profiles_public` exposes all columns on `public_profile = true`. Currently 0 rows have `public_profile = true` (2 users total, both false). | **High** | Drop base-table public policy; deploy `public_profiles` view exposing only safe portfolio columns. |
| **A4.1** | Admin route server protection | ❌ **FAIL** | `proxy.ts` does NOT guard `/api/*`. `/admin/source-health` currently 404 on Vercel because `a19ba41` is unpushed. | **High** | Move admin auth check into server-side `/api/admin/*` handlers using server-only `ADMIN_EMAIL`. |
| **A4.2** | DM participant authorization | ✅ **PASS (Code)** | Code checks `conv.user_a === user.id \|\| conv.user_b === user.id`. Tables currently missing on live DB. | **Medium** | Fixed in code; will be live once 0008 migration runs. |
| **A4.3** | Recruiter posting instant live | ❌ **FAIL (Design)** | Migration `0010` policy `recruiter_jobs_public_read` checks `is_active = true`, NOT `verified = true`. Unverified recruiters' posts appear immediately. | **High** | Gate public visibility on `recruiters.verified = true AND email_confirmed_at IS NOT NULL`. |
| **A5.1** | RSS feed XML injection | ✅ **PASS** | `app/api/feed/[token]/route.ts` uses `escapeXml()` on all fields; no raw CDATA blocks. | **Low** | Safe. |
| **A5.2** | POST route schema validation | ❌ **FAIL** | 0 of 19 POST routes use `zod` schema validation. All routes rely on loose runtime destructuring. | **Medium** | Implement standard `zod` schemas on all 19 POST endpoints. |
| **A5.3** | API rate limiting | ⚠️ **PARTIAL** | Only `referrals` (3/week) and `dm_messages` (20/day) have rate limits. 17 other POST routes have 0 rate limits. | **High** | Add IP / user rate limiting to AI routes, community posts, and extension submissions. |
| **A5.4** | Per-user AI daily budget | ❌ **FAIL** | `ai_usage_log` has no `user_id` column. `cascade.ts` enforces only global daily quotas. Single user can exhaust 180/day OpenRouter or 900/day Gemini quota. | **High** | Add `user_id` to `ai_usage_log`; cap each user at 30 AI requests/day with rule-based fallback. |
| **A5.5** | Resume upload size, MIME, timeout | ❌ **FAIL** | `parse-resume/route.ts` checks only client `file.type`. No file size limit, no magic bytes check, no timeout abort signal. | **High** | Enforce 5MB cap, `%PDF-` magic header check, and 15s timeout abort signal server-side. |
| **A5.6** | PII leak to external AI providers | ❌ **FAIL** | `parse-resume/route.ts` and `tailor-resume/route.ts` send full raw resume text (emails, phones, addresses) directly to Groq/OpenRouter/Gemini. | **High** | Implement regex PII sanitization (redact email, phone, DOB, address) before dispatching to AI. |
| **A6.1** | Google OAuth publishing status | ⚠️ **UNVERIFIED (Console)** | Must be verified in Google Cloud Console. If "Testing", refresh tokens expire after 7 days and users capped at 100. | **High** | Verify in GCP Console. Evaluate Production publishing verification vs Testing mode. |
| **A6.2** | Google OAuth requested scopes | ✅ **PASS** | `app/api/calendar/google/connect/route.ts:23` requests `calendar.events` and `userinfo.email`. | **Low** | Scope is correctly minimal. |
| **A6.3** | OAuth token refresh error handling | ❌ **FAIL** | `lib/calendar/sync.ts:47` logs failure to console and returns `null`. Does not set `needs_reconnect` flag on `calendar_links`. | **Medium** | Add `needs_reconnect BOOLEAN DEFAULT false` column to `calendar_links` and set on `invalid_grant`. |
| **A6.4** | Token encryption & client RLS | ❌ **FAIL** | `calendar_links` stores tokens in plaintext. RLS policy `own calendar link` allows any authenticated user to read raw `refresh_token` in browser. | **High** | Remove client RLS policy (service-role only). Encrypt tokens at rest using AES-256-GCM. |
| **A7.1** | Job data freshness & eligibility | ⚠️ **POOR** | 6,577 total jobs in DB. **0 jobs in last 24h** (cron paused since Aug 31). **0.0% deadlines**. **21.4% skills**. **21.4% eligibility**. | **High** | Re-activate ingestion cron and run `node scripts/enrich_jobs.mjs`. |
| **A7.2** | India-relevant job share | ❌ **FAIL** | Sample of 500 jobs shows **only 27.8% India or remote** (139/500). Top company is Stripe (104 jobs, mostly US/EU/Brazil). | **High** | Implement `is_india_relevant` column and filter feed by default. Clean up non-India listings. |
| **A8.1** | Production deployment SHA match | ❌ **FAIL** | Local `main` is ahead by 2 commits (`a19ba41`, `f7bbd98`). Vercel is running older build `OrwtidS5BcY46o_19cI1r` (`3a18d65`). | **Blocker** | Push `main` to `origin` once B0 approval gates are satisfied. |
| **A8.2** | 7 Launch User Journeys | ⚠️ **PARTIAL** | Feed now renders live (200 OK). Community DMs, PPO, recruiter panel blocked by missing 0008 & 0010 tables. | **High** | Run migrations 0008 and 0010, deploy code, and complete end-to-end journey tests. |

---

## 2. Live Probe Evidence & Telemetry

### A. Restored Database Connectivity (Cloudflare DoH)
```bash
$ curl -s "https://cloudflare-dns.com/dns-query?name=iiyuvwfjscqptxkpxqmv.supabase.co&type=A" -H 'accept: application/dns-json'
{
  "Status": 0,
  "Answer": [
    { "name": "iiyuvwfjscqptxkpxqmv.supabase.co", "type": 1, "TTL": 300, "data": "104.18.38.10" },
    { "name": "iiyuvwfjscqptxkpxqmv.supabase.co", "type": 1, "TTL": 300, "data": "172.64.149.246" }
  ]
}
```

### B. Ingestion Sources Max `created_at` (Last Ingestion per Source)
```
┌─────────┬─────────────────┬───────┬────────────────────────────────────┐
│ (index) │ source          │ total │ last_ingested                      │
├─────────┼─────────────────┼───────┼────────────────────────────────────┤
│ 0       │ 'greenhouse'    │ 211   │ '2026-08-24T06:35:21.542457+00:00' │
│ 1       │ 'linkedin'      │ 213   │ '2026-08-16T19:04:17.203313+00:00' │
│ 2       │ 'indeed'        │ 315   │ '2026-08-28T11:39:49.249053+00:00' │
│ 3       │ 'unstop'        │ 138   │ '2026-08-28T11:39:49.249053+00:00' │
│ 4       │ 'internshala'   │ 109   │ '2026-08-18T13:25:27.736986+00:00' │
│ 5       │ 'lever'         │ 3     │ '2026-07-06T13:38:17.486335+00:00' │
│ 6       │ 'freshersworld' │ 10    │ '2026-07-10T04:35:30.058946+00:00' │
│ 7       │ 'ashby'         │ 1     │ '2026-07-02T22:57:03.881419+00:00' │
└─────────┴─────────────────┴───────┴────────────────────────────────────┘
```

### C. Live Table & Anon-Key Probes (A3)
```
Table: profiles               | HTTP 200 | Rows: 0 | Error: None (allowed by RLS)
Table: calendar_links         | HTTP 200 | Rows: 0 | Error: None (allowed by RLS)
Table: dm_messages            | HTTP 404 | Rows: null | Error: Could not find the table 'public.dm_messages'
Table: dm_conversations       | HTTP 404 | Rows: null | Error: Could not find the table 'public.dm_conversations'
Table: recruiters             | HTTP 200 | Rows: 0 | Error: None (allowed by RLS)
Table: recruiter_jobs         | HTTP 404 | Rows: null | Error: Could not find the table 'public.recruiter_jobs'
Table: ai_usage_log           | HTTP 200 | Rows: 0 | Error: None (allowed by RLS)
Table: source_health_log      | HTTP 404 | Rows: null | Error: Could not find the table 'public.source_health_log'
Table: resume_benchmarks      | HTTP 404 | Rows: null | Error: Could not find the table 'public.resume_benchmarks'
Table: user_submitted_jobs    | HTTP 200 | Rows: 0 | Error: None (allowed by RLS)
```

### D. Data Quality & Feed Relevance Metrics (A7)
* **Total Jobs in Production Database:** 6,577
* **Jobs in Last 24 Hours:** 0 (Cron disabled since Aug 31)
* **Deadlines Present:** 0.0%
* **Skills Populated:** 21.4%
* **Eligibility Populated:** 21.4%
* **India or Remote Relevant:** **27.8% (139 / 500 sample)**
* **Top Company:** **Stripe (104 listings, 20.8% of sample)** — predominantly international / non-India roles.
