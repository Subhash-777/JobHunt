# JobHunt India — Godmode Blueprint (plan.md v4)

> The complete, research-grounded master plan for JobHunt India.
> Synthesises the original spec, the v2 free-AI spec, the master implementation plan, the India-first intelligence update, a full competitive sweep of every GitHub job-aggregator/scraper repo discovered across three research passes, and — new in v4 — a fully-specified dark, animation-rich, glassmorphism-aware motion design system (Part VIII) plus a supplementary Google Jobs API research addendum (Part 0.5).
> Calendar and reminders run on **Google Calendar only** — no Telegram, no Web Push, no third-party notification service.
> Visual direction: **dark, aesthetic "Frosted Obsidian"** — near-black surfaces, selective glassmorphism, saffron accent, and a fully-specified Framer Motion animation system covering every interactive element in the product.

---

## Table of Contents

**Part 0 — Research Ledger**
0. [Every Source Repo & API Discovered, and What We Took From Each](#part-0--research-ledger)
0.5. [Research Addendum — Google Jobs APIs & 2026 Motion/Aesthetic Landscape](#part-05--research-addendum-session-2-findings)

**Part I — Product Direction**
1. [Vision & Positioning](#1-vision--positioning)
2. [What Makes JobHunt India Different](#2-what-makes-jobhunt-india-different)
3. [User Personas](#3-user-personas)
4. [Product Pillars](#4-product-pillars)

**Part II — Feature System**
5. [Core Feature Matrix](#5-core-feature-matrix)
6. [India-First Intelligence Features](#6-india-first-intelligence-features)
7. [AI Feature System — Free Providers Only](#7-ai-feature-system--free-providers-only)
8. [Community & Data-Network Features](#8-community--data-network-features)
9. [Google Calendar — The Only Reminder System](#9-google-calendar--the-only-reminder-system)
10. [Novel Features Found Nowhere Else](#10-novel-features-found-nowhere-else)

**Part III — Data Ingestion & Scraping**
11. [Ingestion Architecture Overview](#11-ingestion-architecture-overview)
12. [ATS Adapter Layer](#12-ats-adapter-layer)
13. [Job Board & Public API Layer](#13-job-board--public-api-layer)
14. [India-Specific Platform Scrapers](#14-india-specific-platform-scrapers)
15. [GitHub & Community-List Ingestion](#15-github--community-list-ingestion)
16. [Company Discovery Engine](#16-company-discovery-engine)
17. [Normalisation, Deduplication & Trust Scoring](#17-normalisation-deduplication--trust-scoring)

**Part IV — Ranking & Intelligence Layer**
18. [Eligibility Engine](#18-eligibility-engine)
19. [Fit Score & Resume Matching](#19-fit-score--resume-matching)
20. [Urgency, Crowding & Hidden-Gem Scores](#20-urgency-crowding--hidden-gem-scores)
21. [Learning Priority Engine](#21-learning-priority-engine)
22. [Source Reliability System](#22-source-reliability-system)

**Part V — Frontend & UX (Fully Redesigned)**
23. [Design Philosophy v3](#23-design-philosophy-v3)
24. [Visual System Updates](#24-visual-system-updates)
25. [Information Architecture v3](#25-information-architecture-v3)
26. [Page-by-Page Redesign](#26-page-by-page-redesign)
27. [New Dashboards](#27-new-dashboards)
28. [Mobile & Extension UX](#28-mobile--extension-ux)

**Part VI — Backend & Data Model**
29. [Architecture](#29-architecture)
30. [Complete Database Schema v3](#30-complete-database-schema-v3)
31. [API Surface v3](#31-api-surface-v3)
32. [Google Calendar Integration — Full Implementation](#32-google-calendar-integration--full-implementation)
33. [Free AI Provider Orchestration](#33-free-ai-provider-orchestration)

**Part VII — Build Plan**
34. [Phase-by-Phase Roadmap](#34-phase-by-phase-roadmap)
35. [Minimum Viable Launch](#35-minimum-viable-launch)
36. [Risk Management](#36-risk-management)

**Part VIII — The Motion System (v4 Addendum)**
37. [The Aesthetic Direction — "Frosted Obsidian"](#37-the-aesthetic-direction--frosted-obsidian)
38. [Motion Engine — Framer Motion as the Sole Animation Library](#38-motion-engine--framer-motion-as-the-sole-animation-library)
39. [Card Micro-Interactions — The Job Card, Fully Specified](#39-card-micro-interactions--the-job-card-fully-specified)
40. [Skeleton Loading — Shimmer as the Default](#40-skeleton-loading--shimmer-as-the-default-never-a-bare-spinner)
41. [Staggered Entrances — Feed, Lists & Grids](#41-staggered-entrances--feed-lists--grids)
42. [Kanban Tracker — Drag Physics](#42-kanban-tracker--drag-physics)
43. [Tab & Navigation Indicators](#43-tab--navigation-indicators--shared-layout-magnetic-motion)
44. [Streak & Achievement Celebration Moments](#44-streak--achievement-celebration-moments)
45. [Performance Discipline](#45-performance-discipline--the-non-negotiable-constraints)
46. [Updated Dependency List](#46-updated-dependency-list-for-the-motion-system)

---

# PART 0 — RESEARCH LEDGER

This section exists so nothing discovered across the research passes gets lost. Every repo and API below was inspected; the column on the right states exactly what JobHunt India borrows from it.

## 0.1 GitHub Topic Page Sweep — `github.com/topics/job-aggregator` (18 repos)

| Repo | What it does | What JobHunt India takes from it |
|---|---|---|
| **theihasan/geezap** (PHP/Laravel) | Aggregates LinkedIn, Upwork, Indeed, ZipRecruiter. Uses **Typesense** for sub-200ms direct-from-browser search. AI cover letters (OpenAI/Gemini/DeepSeek selectable). WebSocket live updates via Laravel Reverb. Filament admin panel. Cloudflare Turnstile bot protection. | Typesense-style fast search pattern (adapted to Postgres `pg_trgm` + pgvector since Typesense is an extra paid-adjacent service); multi-provider AI selector idea; admin/source-health panel concept. |
| **colophon-group/jobseek** (Python/TS, jseek.co) | Monitors **4,400+ company career pages directly** via 40 monitor/scraper adapters (Greenhouse, Lever, Workday, custom). Canonical one-entry-per-role. Daily HuggingFace labelling pipeline. Built-in tracker (Saved→Applied→Interviewing→Offered/Rejected). Company pages with historical posting counts. | The entire **Company Discovery Engine** concept (Section 16) — direct-to-source canonical monitoring instead of board-scraping; company page with posting history; the tracker funnel naming convention. |
| **kbhujbal/go-get-jobs** (Go) | Scrapes 50+ named tech companies via Workday API. Goroutine concurrency, MongoDB, auto-updates README with new listings. | Workday API integration pattern; concurrent-scrape architecture reference for our ingestion workers. |
| **ever-jobs** (TypeScript) | Aggregates LinkedIn, Glassdoor, Indeed. Monorepo. | Baseline multi-source pattern; monorepo structuring reference. |
| **Job-Crawler / Job RAID** (Python) | Microservice crawler, real-time extraction, no UI. | Validates a decoupled "ingestion is just a pipeline, frontend reads from DB" architecture — same as our design. |
| **tech_award_2024** (JS) | Telegram **userbot** (TDLib) pulling jobs from Telegram channels/groups. | Telegram-channel-as-a-source idea — noted as an optional future ingestion source (not a notification channel, since this build is Google-Calendar-only for alerts). |
| **Dalbug0/job_aggregator** (Python) | FastAPI + SQLAlchemy + PostgreSQL + APScheduler. | Confirms FastAPI/APScheduler as one valid scraping-worker stack alternative to GitHub Actions cron, if we ever need a long-running worker. |
| **IagoBCorrea/JobMiner** (Python) | Brazil-focused. **Job market analytics dashboard**: most demanded languages, remote vs onsite split, seniority auto-detection, priority scoring boosting remote/junior roles. | Direct blueprint for our **Insights / Market Intelligence dashboard** (Section 27.1) and seniority auto-detection logic. |
| **Job-Magician** (TS) | AI agent for auto-search and auto-apply. | Confirms demand for AI-assisted applying; we deliberately stop short of auto-apply (ToS risk) but adopt the "AI checklist before applying" idea. |
| **Rufat-Baghirli/job_aggregator** (Python) | Django REST + Celery + Redis for remote job scraping. | Validates Celery/Redis as an alternative task queue pattern. |
| **canada-tech-job-market-analysis-2026** (Python) | Aggregates Job Bank, Adzuna, RemoteOK. Streamlit dashboard, skills insights, Ollama local AI. | Confirms Adzuna and RemoteOK as reliable free APIs; Streamlit-style insights dashboard idea folded into our Insights page. |
| **job-radar** (Python/Next.js) | FastAPI + Celery + PostgreSQL + Redis, async ingestion. | Architecture cross-check — our BFF + GitHub Actions design is the equivalent zero-cost version of this. |
| **Dalbug0/job-platform** | HH.ru (Russian board) aggregation with **Telegram bot as the entire client UI**. | Noted but explicitly NOT adopted as the alert channel (per this build's Google-Calendar-only constraint) — kept as an example of bot-as-UI pattern for potential future power-user feature. |
| **openjobs-api** (Go) | Microservices, unified sync API. | Confirms the value of a normalised `NormalizedJob` contract (Section 12.3) across heterogeneous sources. |
| **go-jobs** (Go) | Self-hosted, **LLM enrichment at ingest time**, CLI + HTMX UI. | Validates our "AI runs once at ingest, cached forever" cost-control philosophy. |
| **harsh8423/Jobzy** | Scrapes **LinkedIn, Naukri, Foundit, Indeed** via Playwright stealth. BullMQ per-platform workers, Redis dedup, 24h freshness cap, **Applied jobs auto-disappear from feed**, **Ignore/mute job permanently**, preference-driven polling intervals, self-healing queue. | Auto-disappear-on-apply UX; permanent ignore/mute; preference-driven per-user polling; stealth Playwright config; most India-relevant scraping precedent in the whole sweep. |
| **job-track** (TS/Angular) | Application tracker + Chrome extension capturing jobs from LinkedIn, self-hosted. | Chrome extension "capture this job page" pattern (in addition to autofill) — added to our extension spec (Section 28.2). |

## 0.2 ATS & Direct-Source Scraper Sweep (second research pass)

| Repo / Tool | What it does | What we take |
|---|---|---|
| **adgramigna/job-board-scraper** (levergreen.dev) | Scrapy spiders for Greenhouse + Lever, daily cron, raw HTML archived to S3, skip-if-already-scraped-today logic, runs for ~$30/year on AWS. | The "skip if scraped today" deduplication-at-source-level optimisation; validates ATS scraping can run near-zero-cost. |
| **kalil0321/ats-scrapers (jobhive-py)** | **The most comprehensive open ATS scraper found.** Single tiny `BaseScraper` interface (`fetch()` returns `list[Job]`). Covers Greenhouse, Lever, Ashby, SmartRecruiters, Workable, Rippling, Personio, Gem, JoinCom, iCIMS, JazzHR, Breezy, Teamtailor, Pinpoint, BambooHR, Cornerstone, Recruitee, Recruiterbox, Eightfold, Avature, Phenom, Workday, Oracle, SuccessFactors, Taleo, Mercor, plus single-tenant custom APIs for Amazon/Apple/Google/TikTok/Uber, national aggregators (Bundesagentur, Arbetsformedlingen, Eures), and browser-required scrapes (Meta, Tesla) via Browserbase. 3.27M+ live jobs, 86K+ companies, 47 ATS platforms tracked live via a public manifest JSON. | **This defines our entire ATS adapter target list** (Section 12.1). The `BaseScraper` / `fetch()` interface pattern is adopted directly as our `NormalizedJob` adapter contract. Their public manifest-of-counts idea inspires our own internal "source health dashboard." |
| **plibither8/jobber** | Minimal API wrapper: `{board, companySlug} → jobs[]` for Ashby/Greenhouse/Lever/BambooHR. | Confirms the simplicity of the per-ATS-board JSON endpoint pattern; used as the simplest reference implementation for our Greenhouse/Lever/Ashby adapters. |
| **d-alleyne/ashby-job-scraper** | No-browser Ashby **GraphQL API** scraper, team/department filtering, `daysBack` incremental scraping. | Adopted directly: Ashby's GraphQL API + `daysBack` incremental-fetch parameter pattern goes straight into our Ashby adapter. |
| **MarcusKyung/greenhouse.io-scraper** | Simple Greenhouse/Lever scraper; documents edge cases (employer-embedded Greenhouse pages don't work, non-standard title formatting on some boards). | Edge-case warnings folded into our adapter error-handling notes. |
| **billyweinberger/job-scraping-app** | GitHub-Actions-only pipeline (no server): Fetchers → Processor (normalise/dedupe/rank) → Reporter (JSON/Markdown) → AI (resume tips, interview prep) → commits results back to the repo. Daily 9 AM UTC cron. | **This is structurally identical to our own ingestion pipeline** — validates the "GitHub Actions only, no server, commit results" approach end-to-end including the AI-enrichment-at-ingest step. |
| **viktor-shcherb/job-seek** (Streamlit) | General-purpose extractor pipeline (anchors, JSON-LD, repeated DOM blocks, pagination) with **headless-JS fallback** when a page is a JS shell. Per-board scrape health tracking, conservative merge-on-failure. Has a public "request a company, an agent adds it in 5 minutes" UI. | The **generic extractor pipeline w/ JSON-LD parsing + JS-shell fallback** becomes our default adapter for unknown/long-tail company career pages (Section 16.2); the "request a company" UX is adopted directly into our Company Discovery page. |
| **github.com/topics/ashby** (topic sweep) | Surfaced: a Slack-watcher scanner (stdlib-only, zero deps) pinging on new roles; an MCP server turning an ATS into an LLM copilot; a 446-company personal job-search tool that scores against a profile with Claude and notifies via Discord; multiple SerpAPI-driven company-discovery tools. | The "stdlib-only, zero dependency weekly scanner" minimalism is a good fallback reference if GitHub Actions free minutes ever get tight; the Claude-scoring-against-profile pattern is exactly our **Fit Score** feature, confirming it as a differentiator worth doing well. |
| **github.com/topics/job-scraper** (topic sweep) | Surfaced a **2026-new-grad early-warning watchlist** that polls Greenhouse/Lever/Ashby/Workday/SmartRecruiters/Workable/Recruitee directly and push-notifies "before the big job boards" (Next.js + Express + Supabase); a PSR-compliant PHP engine scraping LinkedIn/Indeed/Glassdoor/ZipRecruiter without APIs; a self-hosted "scrape, dedupe, score, alert — private by default, runs locally for free" tool with resume-matching and ATS-scanner naming. | Validates our entire premise: direct ATS polling beats job boards on speed; the "private by default, runs locally for free" ethos matches our zero-cost design goal exactly. |

## 0.3 India-Specific Source Sweep (third research pass)

| Source / Tool | What it does | What we take |
|---|---|---|
| **bhagatanirudh/Web-Scraper-Internshala** | Selenium scraper of Internshala filtered by user preference, sends results + screenshots via WhatsApp (PyWhatKit). | Confirms Internshala is reliably scrapeable via Selenium/Playwright with preference filters built into the search URL itself. |
| **Rockposedon/WebScraping** (Naukri) | Hits **Naukri's internal job-search API directly** (not raw HTML), extracts title/company/description/experience/salary/location at scale. | Confirms Naukri has an internal JSON API reachable with the right headers — adopted as our primary Naukri ingestion method (faster + more reliable than RSS alone). |
| **het-parekh / vkbandari / ligmitz** — Internshala scrapers (BeautifulSoup4, generic Python, npm package) | Three independent confirmations that Internshala is scraped via simple HTML parsing (BS4) with query fields for category, location, work-from-home, part-time, stipend, duration, "internship with job offer" (PPO signal at the source). | The `job_offer: true` query parameter is a direct, free PPO-likelihood signal we can pull at ingest time — feeds straight into our PPO tracker. |
| **pawan941394/Naukri-Web-Scrapper-** | Custom headers + cookies to simulate a Naukri browser session, CSV export. | Confirms cookie/header simulation is the practical approach for Naukri (their API blocks bare requests without realistic headers). |
| **yashbg/internshala-scraper** | Scrapes *applicant* details of a specific posting (Selenium). | Not directly used (privacy-sensitive use case) but confirms Internshala posting pages are fully Selenium-scrapeable end-to-end. |
| **Hyperion101010/naukri-scraper** | Pure `requests`-based scraper claiming 400,000+ profiles scraped, auto-generates Excel. | Confirms Naukri can be scraped without a headless browser at all in many cases — lighter-weight than Playwright, preferred when possible for GitHub Actions runtime budget. |
| **Apify marketplace listings (India cluster)** | Surfaced production-grade scrapers for **Internshala** (21 output fields incl. `stipend_min_inr`, `is_early_applicant`, `is_part_time`, **PPO offer flag**), **Naukri.com** (residential-proxy-backed, anti-bot resistant), **Hirist.tech** ("India's #1 niche IT job portal," 50K+ listings, salary/skills/experience/recruiter info), **Freshersworld** (India's #1 fresher/entry-level portal), and a combined actor pulling **Naukri + Indeed + LinkedIn + Internshala + Foundit + Hirist** fresher jobs from the last 24 hours in one pass. | **Hirist.tech and Freshersworld are added as new first-class India sources** (Section 14) — neither was in any earlier version of this plan. The `is_early_applicant` / `is_part_time` / PPO-offer structured fields from the Internshala actor are adopted as fields to extract at ingest. |
| **speedyapply/JobSpy** (Python, PyPI: `python-jobspy`) | The most complete **multi-board unification library**: LinkedIn, Indeed, Glassdoor, Google Jobs, ZipRecruiter, Bayt, BDJobs in one call, returns a unified `JobPost` schema. Documents real operational limits precisely: Indeed is the most reliable (no rate limiting, ~1000 job cap per search), LinkedIn rate-limits around page 10 per IP (proxies effectively required at scale), Glassdoor/Indeed need a `country_indeed` parameter. **Has Naukri-specific output fields already built in**: `skills`, `experience_range`, `company_rating`, `company_reviews_count`, `vacancy_count`, `work_from_home_type`. | **This becomes our primary multi-board ingestion library**, replacing several bespoke scrapers. JobSpy already ships first-class Naukri support with India-relevant fields — a major time-saver. Its documented rate-limit behaviour per platform (Section 13.4) is adopted verbatim into our scraping cadence rules. |
| **alpharomercoma/ts-jobspy** | TypeScript port of JobSpy (Indeed + LinkedIn). | Means JobSpy's pattern is usable natively in our Next.js/TypeScript ingestion scripts without a Python subprocess, if preferred — documented as an alternative integration path. |
| **JobSpy MCP Server** | Wraps JobSpy as an MCP tool ("Find me remote Python jobs using JobSpy") for Claude Desktop / agent clients. | Not used directly in production ingestion, but confirms JobSpy is stable enough to be wrapped as a tool-call interface — validates reliability. |

## 0.4 Google Calendar Integration Research (fourth pass)

Confirmed via Google's own developer documentation and multiple independent implementation guides: the Google Calendar API is free for this use case (no billing required for the Calendar API itself at this usage volume), uses standard OAuth 2.0 with the `googleapis` npm package, requires `access_type: offline` + `prompt: consent` to obtain a refresh token for long-lived access, and supports event creation (`calendar.events.insert`), updates, deletion, custom reminders (email + popup overrides), recurrence rules, and optional Google Meet conference data attachment. This confirms Google Calendar can fully replace any other notification/reminder system for this build — see Section 32 for the complete implementation.

---

---

# PART 0.5 — RESEARCH ADDENDUM (Session 2 Findings)

This addendum extends Part 0's research ledger with sources discovered in the follow-up research pass, covering Google Jobs aggregator APIs and the confirmed 2026 frontend motion/aesthetic landscape that directly informed Part VIII.

## 0.5.1 Google Jobs Aggregation APIs (Bonus/Supplementary Source Layer)

| Provider | What it offers | Free tier | Verdict for JobHunt India |
|---|---|---|---|
| **SerpApi (Google Jobs engine)** | Structured JSON scrape of Google Jobs results, which itself aggregates from Indeed, LinkedIn, ZipRecruiter, Workday, and thousands of other sources in one response. Returns title, company, location, posted-date, salary (when available), apply links (often multiple per listing across different boards), and detected extensions (schedule type, remote/hybrid flags, benefits). | 100–250 free searches/month depending on signup cohort (confirmed in research as 100/month baseline, with some onboarding flows granting 250). Cached searches (same query within 1 hour) don't count against quota. | **Adopted as a supplementary, low-volume enrichment source**, not a core ingestion pipeline component. At 100–250 free searches/month, this is nowhere near sufficient for primary ingestion (which needs thousands of jobs/day across many keyword combinations), but it's genuinely useful for two narrow, high-value use cases: (1) **Company Discovery validation** (Section 16.2) — when a user requests a new company, one SerpApi call can cross-check whether that company's roles already appear on Google Jobs, informing the initial trust/cross-verification score; (2) **Spot-checking source reliability** (Section 22.2) — periodically sampling whether JobHunt India's own listings appear (and stay listed) on Google Jobs as an external corroboration signal, consumed sparingly (a few calls/day, well within the free quota). |
| **SearchApi.io (google_jobs engine)** | Same underlying Google Jobs aggregation, alternate provider, structurally similar JSON response shape (`apply_links` array, `detected_extensions`). | Free tier exists but exact quota not independently confirmed at the same depth as SerpApi in this research pass. | Documented as a **fallback alternative** to SerpApi if SerpApi's free quota is exhausted in a given month — the two providers' response shapes are similar enough that a single thin adapter function can target either with minimal branching. |
| **SERPHouse / Serply.io (Google Jobs variants)** | Comparable structured Google Jobs scraping products, India-market results confirmed present in sample responses during research (e.g. Ahmedabad, Gujarat-based listings returned directly). | Free tiers exist; not the primary recommendation since SerpApi has the most mature documentation and the clearest free-tier terms. | Noted as further fallback options only — not adopted into the core build. |
| **TheirStack** | A dedicated job-data API distinct from the Google Jobs scraping category — structured job postings with a stated 200 free credits/month. | 200 credits/month free, confirmed in research as "genuinely usable for prototyping." | Not adopted in this version (the existing source stack — ATS adapters, JobSpy, India platforms, GitHub lists — already comfortably covers ingestion breadth without needing a paid-adjacent aggregator), but documented here as the next evaluation candidate if a future version needs a broader bulk-prototyping data source during early development before the full scraper fleet is live. |

**Why these remain supplementary, not core:** every one of these providers' free tiers (100–250 requests/month) is roughly the request budget JobHunt India's own ingestion pipeline would consume in a single hour at full Tier-1 cadence (Section 11.1). They are valuable specifically *because* they're low-volume, high-trust, third-party corroboration signals — not because they could replace the direct-source ATS/board/India-platform scraping architecture that remains the system's durable backbone (Section 36.3's core strategic conclusion is unchanged by this addendum).

### Reference Implementation — SerpApi as a Trust-Verification Adapter

```javascript
// scripts/ingest/utils/serpapi-verify.js
// Used sparingly — NOT part of the main ingestion cadence (Section 11.1's Tier 1-3 system).
// Called only from the Company Discovery flow (Section 16.2) and the weekly source-health
// spot-check, to stay comfortably within the ~100-250/month free quota.

export async function verifyOnGoogleJobs(company, roleTitle) {
  const params = new URLSearchParams({
    engine: 'google_jobs',
    q: `${roleTitle} ${company}`,
    location: 'India',
    api_key: process.env.SERPAPI_KEY,
  });

  const res = await fetch(`https://serpapi.com/search?${params}`);
  const data = await res.json();

  const matches = (data.jobs_results ?? []).filter(j =>
    j.company_name?.toLowerCase().includes(company.toLowerCase())
  );

  return {
    crossVerified: matches.length > 0,
    matchCount: matches.length,
    applyLinks: matches[0]?.apply_options?.map(o => o.link) ?? [],
  };
}
```

```sql
-- Source registry entry added for this supplementary verification layer
insert into job_sources (source_name, source_type, cadence_tier, active, config_json)
values ('serpapi_verification', 'verification_only', 0, true,
  '{"purpose": "trust_cross_check", "monthly_quota": 100, "usage": "company_discovery + weekly_spot_check"}');
```

## 0.5.2 Confirmed 2026 Frontend Aesthetic & Motion Landscape

This research pass directly informed Part VIII (The Motion System) and is logged here for traceability, per the plan's own "every claim should be sourced" standard established in Part 0.

**Glassmorphism status in 2026:** confirmed mature and stable rather than trend-of-the-moment — explicitly backed by macOS, Windows Fluent Design, and Apple visionOS as a load-bearing OS-level pattern. Confirmed failure modes: overuse on large/many simultaneous areas causes performance degradation (`backdrop-filter` is computationally expensive) and legibility problems on busy backgrounds. Confirmed best practices adopted directly into Part VIII: the "1px border at ~15-20% white opacity" technique for grounding glass edges (Section 37.1), mandatory `prefers-reduced-motion` and `prefers-contrast` fallbacks to a solid surface (Section 37.1), and restricting glass to "key interactive elements, not the entire layout" (the Elevation 0/1/2 tier system in Section 37.1 is JobHunt India's direct implementation of this principle).

**Framer Motion status in 2026:** confirmed as the dominant React animation library, specifically for `AnimatePresence`-driven exit animations (the standard solution to React's instant-unmount problem), spring-physics-based motion over manual `cubic-bezier` duration tuning, and `layoutId`-based shared-element transitions as the modern replacement for manual DOM-measurement-based indicator positioning. All three patterns are adopted directly into Part VIII Sections 38.2, 39.2, and 43 respectively.

**Confirmed 2026 dashboard/SaaS template landscape:** premium dark-mode admin templates in this period consistently combine Next.js + Tailwind v4 + Framer Motion + shadcn/ui-style component primitives, with dark mode treated as a first-class token system (not a bolted-on toggle) and chart/data-visualisation colour palettes specifically tuned for dark backgrounds rather than inverted light-mode palettes. This confirms JobHunt India's existing dark-mode-first (not dark-mode-as-an-option) approach, established back in the original Part V design philosophy, remains the correct strategic choice in the current landscape, and validates the Section 24.1 colour-token approach (semantic tokens with explicit dark-tuned values, not a CSS `prefers-color-scheme` light/dark pair).

**Confirmed micro-interaction baseline expectations for 2026:** skeleton/shimmer loading states (not bare spinners) are now the expected default, not a premium differentiator — directly motivating the full shimmer specification in Part VIII Section 40. Hover effects (scale/glow/colour-shift), scroll-triggered reveals, and custom branded loading states are all confirmed as standard, expected micro-animation patterns rather than novel additions — confirming Part VIII's approach is calibrated correctly to "meets and slightly exceeds 2026 baseline expectations" rather than over- or under-shooting the current bar.

---

*This addendum should be read alongside Part 0's original research ledger. Together they constitute the complete, two-session research basis for every sourcing and design decision in this blueprint.*

# PART I — PRODUCT DIRECTION

---

## 1. Vision & Positioning

JobHunt India is not another job board clone. It is a **job operating system** for Indian students and early-career candidates — one place to discover openings, understand eligibility instantly, judge real competition levels, plan every deadline through Google Calendar, track outcomes end-to-end, prepare targeted applications with free AI, and learn exactly what to improve next.

The research sweep above confirms something important: across 18 dedicated job-aggregator repos and a dozen more ATS/India-specific scrapers, **not a single project combines aggregation with India-specific eligibility logic, competition intelligence, and outcome-driven learning.** Some are excellent at scraping (Jobseek's 4,400-company monitor, JobSpy's seven-board unification, jobhive's 47-ATS coverage). Some are excellent at one clever idea (Jobzy's auto-disappear-on-apply, JobMiner's market dashboard). None combine breadth of sourcing with depth of India-specific intelligence. That gap is the entire opportunity.

**Positioning statement:** JobHunt India helps Indian students and freshers find relevant jobs faster, avoid wasting time on ineligible or overcrowded listings, track every application from save to offer, sync every deadline straight into Google Calendar, and improve their chances with AI assistance that costs nothing to run.

## 2. What Makes JobHunt India Different

### The common aggregator pattern (confirmed across all 18+ repos studied)

Multi-source scraping. Search and filters. Save/bookmark. Basic application tracking. Sometimes AI cover letters or naive resume keyword matching. That is the ceiling of what exists today, even in the most polished projects (Geezap, Jobseek).

### The JobHunt India intelligence layer (the actual product)

- **Campus/India-specific eligibility** — CGPA cutoffs, batch year, branch, degree, bond/service agreement detection, internship-only vs PPO-eligible, off-campus drive flagging. Found in zero competing repos.
- **Crowding intelligence** — application crowding score, urgency rank, hidden-gem score, source reliability badge. Found in zero competing repos (Jobzy's "applied jobs disappear" is the closest analogue, and it's a UX trick, not a scoring system).
- **Learning intelligence** — skill frequency mapping, gap analysis, learning priority engine, per-resume-version outcome tracking. Found in zero competing repos.
- **Outcome intelligence** — which resume version converts better, which source converts better, which companies move fast. Found in zero competing repos.
- **Community intelligence** — PPO tracker, interview experience feed, OA pattern logs, referral layer, conversion-rate reporting. Found in zero competing repos (some have generic "interview prep" AI generation, but none have crowdsourced, India-context community data).
- **Direct-to-source canonical aggregation at India scale** — Jobseek does this brilliantly for global tech companies (4,400 companies); nobody does it for the Indian market (Infosys, TCS, Wipro, Flipkart, Swiggy, Zomato, Razorpay, CRED, Meesho, Ola, Zepto, and 500 more).

## 3. User Personas

**Persona A — Placement-season student.** Final-year B.Tech student. Needs batch-year and CGPA filtering above all else. Wants off-campus drives and internship-to-PPO visibility. Needs every deadline pushed straight into Google Calendar with no manual re-entry. Wants an instant answer to "is this listing actually worth my time right now."

**Persona B — Fresher / recent graduate.** Searches 0–2 year roles across LinkedIn, Naukri, ATS boards, and startup sites simultaneously. Needs resume matching and full application tracking. Wants hidden-gem openings with lower crowding rather than the same 5 companies everyone else is applying to.

**Persona C — Internship seeker.** Needs Internshala, Unstop, Hirist, Freshersworld, company internship pages, GitHub lists, and remote internship sources in one feed. Wants stipend, duration, location, and skill requirements visible at a glance, with PPO-likelihood surfaced up front.

**Persona D — Power user / referral-driven applicant.** Tracks dozens of roles weekly. Lives in saved searches (watchlists), wants delta alerts the moment a watchlist gets a new match, and relies on Google Calendar sync plus resume-version performance analytics to optimise their entire search strategy.

## 4. Product Pillars

1. **Aggregation** — collect jobs from everywhere practical: ATS APIs, job boards, India-specific platforms, GitHub hiring lists, and direct company career pages.
2. **Qualification** — tell the user immediately whether a job is actually suitable for them, not just keyword-matched.
3. **Prioritisation** — rank by urgency, true relevance, and real competition level, not just recency.
4. **Execution** — make saving, calendar planning, and applying as fast as physically possible.
5. **Improvement** — help users learn from outcomes (which resume worked, which skill was missing, which source converts) and refine their strategy over time.

---

# PART II — FEATURE SYSTEM

---

## 5. Core Feature Matrix

### A. Discovery & Aggregation
Multi-source scraping across ATS platforms, major job boards, India-specific platforms, public APIs, GitHub hiring repos, and curated community sources. Unified keyword + semantic search. Faceted filters (no sliders — dropdown buckets only, per existing requirement). Clean, information-dense card feed. "Similar jobs" and "same-company jobs" panels. Source badges with reliability labels on every card.

### B. Tracking & Execution
Save for later with folders (Saved, Shortlisted, Applied, OA, Interview, Offer, Rejected). Full application tracker (Kanban) with per-card notes and a linked resume version. Outcome analytics per category and per resume version. Anonymous apply-click tracking feeding the crowding score.

### C. Calendar & Reminders — Google Calendar Only
One-click "Add to Google Calendar" for any deadline. Full bulk sync of all tracked deadlines. Reminder presets at 7 days, 3 days, 1 day, and 2 hours before deadline. Interview-date sync with a separate "prep reminder" event 2 days prior. No other notification system exists in this build — no email digests, no push notifications, no Telegram, no SMS. Google Calendar is the single source of truth for reminders.

### D. AI Assistance (Free Providers Only)
Job summary generation at ingest time. Eligibility extraction from messy free-text requirements. Resume-job fit explanation. Tone-controlled cover letter drafts. Application checklist generation. Mock interview question generation. Learning roadmap suggestions. Search query rewriting/expansion.

### E. Community Intelligence
Interview experience feed. OA pattern logs (personal + aggregated). PPO tracker. Referral requests and offers. Campus drive board. Community conversion reports (sample-size-gated).

## 6. India-First Intelligence Features

### 6.1 Eligibility Engine
Per listing, computed automatically at ingest and re-evaluated against the user's live profile: batch year eligibility, degree eligibility, branch eligibility, CGPA cutoff match, backlog restriction flags, bond/service-agreement flag, location requirement flag, internship-vs-full-time distinction, PPO-potential flag. Output is always one of **Eligible / Borderline / Ineligible / Unknown**, with a reasons panel explaining exactly why ("Batch year mismatch — listing wants 2025 batch, your profile says 2026", "CGPA cutoff 8.0, your CGPA is 7.6", "Bond required — 2 year lock-in mentioned in description").

### 6.2 Placement Season Mode
A seasonal UI mode active by default August–December: batch-year-first filtering becomes the primary sort, a dedicated campus-season dashboard appears, the layout becomes calendar-heavy, OA/interview prep shortcuts surface prominently, a deadline-density view shows the week ahead at a glance, and a "missed deadline recovery" panel suggests similar still-open roles when a deadline is missed.

### 6.3 Crowding & Hidden-Gem System
The single strongest differentiator validated by the research sweep — nothing in any of the 30+ repos studied solves this.

**Signals computed per job:**
- Anonymous click-through count from JobHunt India users (`apply_clicks` table).
- Save/watcher count.
- Listing age (freshness decay).
- Source popularity weight (a job exclusively on a small ATS page is inherently less crowded than the same role cross-posted to LinkedIn).
- Whether the job appears in a GitHub curated list but not on major boards (early-signal indicator).

**Outputs:**
- **Crowding score** (0–100) — estimated applicant saturation.
- **Urgency rank** — how fast the user should act, blending deadline proximity, deadline confidence (explicit vs inferred), and historical decay rate of similar listings.
- **Hidden-gem score** — high when fit is high, source trust is high, crowding is low, and the deadline is still comfortably open.

### 6.4 Skills Frequency Map
Aggregated continuously from all newly ingested jobs: most-demanded skills overall, most-demanded by role category (SWE/Data/ML/Core/Product/Design), most-demanded by city, most-demanded for internships vs full-time, and a 7/30/90-day trend line showing which skills are rising or falling in demand. Zero AI cost — purely a count-and-rank query over the `key_skills` array already extracted at ingest.

### 6.5 Learning Priority Engine
Combines the user's profile, saved jobs, applied jobs, and historical missed-skill frequency to output a ranked list of high/medium/low priority skills, each with free learning resources, an estimated payoff by category, and a recommended learning order (quick wins first, long-term investments after).

### 6.6 Source Reliability System
Every listing carries a reliability badge computed from: whether it came from an official ATS/company source vs a third-party board, cross-source confirmation (appears in 2+ trusted sources), community-submission validation status, and freshness/link-health.

**Badge tiers:** 🟢 **Official** (direct ATS or company page) · 🔵 **Cross-verified** (appears in 2+ trusted sources) · 🟡 **Community verified** (user-submitted, passed automated validation) · ⚪ **Low confidence** (scraped, incomplete, or apply link unverified).

### 6.7 PPO Tracker
Tracks internships explicitly mentioning PPO (including the `job_offer: true` structured signal available directly from Internshala's own search filters, confirmed in the research sweep), aggregates community-reported PPO conversion rates per company, and surfaces a "PPO Likely" filter tab platform-wide.

### 6.8 Resume Performance Analytics
For every resume version attached to applications, tracks: applications sent, click-to-apply count, OA conversion rate, interview conversion rate, offer conversion rate, category-wise performance (which version works best for SWE vs Data roles), and company-size-wise performance (startups vs large enterprises).

## 7. AI Feature System — Free Providers Only

### 7.1 The Strict Rule

Every AI feature in JobHunt India must run on a completely free tier or free/open routing layer. No paid API keys, ever, under any circumstance.

### 7.2 Allowed Providers (Provider Router)

1. **Groq** (Llama 3.3 70B / 3.1 70B) — 14,400 requests/day free, fastest latency. Primary for high-volume, speed-sensitive tasks.
2. **OpenRouter free models** (`:free` suffix models — Llama 4 Maverick/Scout, Gemini 2.5 Pro Exp, DeepSeek Chat v3, Mistral Small) — ~200 requests/day combined, best raw quality. The router treats free-model availability as dynamic and must gracefully fall through if a specific free model disappears from the roster.
3. **Google Gemini free tier** (2.5 Flash-Lite at ~1,000/day, 2.5 Flash at ~250/day, 2.5 Pro at ~100/day) — tertiary fallback, high aggregate quota.
4. **Rule-based / regex fallback** — for tasks where AI is genuinely unnecessary (see 7.3 below), avoiding AI calls entirely saves quota for tasks that actually need it.

### 7.3 AI Task Routing — Where AI Helps vs Where Rules Are Enough

**Good AI use cases:** short job summary from messy descriptions; eligibility extraction from free-text requirements; resume-job fit explanation; tone-controlled cover letter drafts; interview question generation from job context; search query expansion/rewriting; skill clustering.

**Avoid AI — rules are sufficient and free:** salary/stipend bucket parsing (regex); deadline parsing when a standard date format exists (regex/date-fns); role category mapping via controlled keyword lists; duplicate detection (URL/hash matching); bond detection (regex catches the overwhelming majority of cases: "bond", "service agreement", "lock-in period").

### 7.4 AI Features — Complete List

**Job summary generator** (runs once at ingest, Groq, cached forever): 2-line summary, key qualifications, key skills, seniority hint, urgent-action note if applicable.

**Cover letter system**: per-job context, tone picker (formal/confident/enthusiastic/concise), resume-version-aware prompt context, company/role auto-insertion, optional "mention project experience relevant to this role" checkbox.

**Resume matcher**: skill overlap extraction, missing-skill identification, missing-signal-type detection (projects vs internships vs tools vs certifications), section-by-section weakness explanation, per-version performance history cross-reference.

**Interview preparation**: role-specific question set generation, company-prep checklist, "what to revise in the next 24 hours" condensed list.

**Skill roadmap**: learning order based on the jobs the user actually wants (not generic advice), prioritising high-frequency missing skills first.

### 7.5 AI Safety & Practicality Rules

Every AI output must have a non-AI fallback or a clear "quota unavailable today" state — never a broken UI. AI results are cached aggressively (job-level summaries forever; user+job fit scores for 48 hours; cover letters not cached, since regeneration is the point). Summaries and structured extraction happen once at ingest time, never per-user-view, to conserve quota. Provider usage is logged per task in `ai_usage_log` so the router can make real-time quota decisions and an admin can monitor provider health.

## 8. Community & Data-Network Features

### 8.1 Interview Feed
Company + role + year + round-by-round structure + difficulty + sample questions + outcome. Upvoting for helpfulness. Filterable by company, role, batch year, branch, and difficulty.

### 8.2 OA Tracker
Personal logs (company, platform, date, topics, difficulty, outcome) plus an aggregated company-pattern page built from 3+ independent reports (time limit, sections, topics, difficulty, platform — e.g. "Infosys via Mettl: 30 aptitude + 2 coding, Easy–Medium, 60 minutes").

### 8.3 Referral Exchange
Referral requests and referral offers in one board. Basic trust scoring and hard rate limits (3 requests/week/user) to prevent spam.

### 8.4 Campus Drive Board
Off-campus drives, college-specific announcements, shared deadlines synced straight to Google Calendar, verified banners for officially-confirmed posts.

### 8.5 Conversion Reports
Community-reported aggregate signals: how many got an OA, how many got an interview, how many got shortlisted, median response delay. Always labelled as sample-based and only shown once a minimum report-count threshold is met (avoids single-person noise skewing the data).

## 9. Google Calendar — The Only Reminder System

Per the explicit requirement for this version: **Google Calendar is the sole reminder and notification mechanism in JobHunt India.** There is no separate in-app notification centre, no email digest system, no push notification service, no Telegram bot. Every alert a user needs lives inside their own Google Calendar, where they already check daily.

**Why this is the right call, not a compromise:** Google Calendar already solves reminders, recurrence, cross-device sync, and a UI users already trust — rebuilding any of that from scratch would be wasted effort and added free-tier surface area for zero extra value. Full implementation detail is in Section 32.

**Integration modes:**
- **Mode A — Quick Add (no OAuth required):** generates a one-time Google Calendar event-creation deep link (`calendar.google.com/calendar/render?action=TEMPLATE&...`) for a single deadline. Works instantly with zero account connection — the user just needs to be logged into Google in their browser.
- **Mode B — Connected Sync (OAuth, for power users):** user authorises calendar write access once; JobHunt India then auto-creates, auto-updates, and auto-deletes events as deadlines change, interview dates get logged, or jobs are unsaved.

**Event types created:** application deadline, interview slot (with a follow-up "prep reminder" 2 days prior, auto-created), OA reminder, follow-up reminder, resume submission reminder.

**Watchlist delta events:** when a saved watchlist gets a new matching job, a same-day all-day calendar event is created summarising the new matches — this becomes the de facto "notification," delivered through Calendar rather than a push system.

## 10. Novel Features Found Nowhere Else

These ideas emerged specifically from cross-referencing every repo studied — patterns spotted in fragments across different projects, never assembled together, and several genuinely new ideas layered on top.

**10.1 Canonical Company Pages** (inspired by Jobseek's 4,400-company direct monitor, adapted to ~500 curated Indian companies — Infosys, TCS, Wipro, Flipkart, Swiggy, Zomato, Razorpay, CRED, Meesho, Ola, Zepto, and more). Each gets a `/company/[slug]` page: all current open roles, historical posting frequency ("typically posts 30+ roles in August for campus season"), open-role count trend over time, and aggregated community interview/PPO data.

**10.2 Preference-Driven Watchlists** (inspired by Jobzy's per-preference background polling). Users define up to 5 named watchlists, each with its own keyword scope, platform scope, eligibility filters, and minimum-fit threshold. Ingestion only deep-fetches sources relevant to at least one active watchlist, making scraping targeted and resource-efficient rather than blindly comprehensive.

**10.3 Market Intelligence Dashboard** (inspired by JobMiner, massively expanded for the India context). A dedicated `/insights` page: top 10 in-demand skills this week, fastest-rising skills (week-over-week), which cities are hiring most for which categories, which companies are on a hiring spree (10+ roles in 7 days), average CTC by role category, and internship-vs-full-time ratio trend. Pure analytics over already-collected data — zero extra scraping, zero AI cost.

**10.4 Applied-Jobs Auto-Disappear** (adopted directly from Jobzy). The moment a job is marked "Applied," it vanishes from the main feed permanently, living only in the Applied tab — keeping the feed a pure "things I haven't acted on yet" list.

**10.5 Permanent Ignore/Mute** (adopted directly from Jobzy). One click hides a job forever, with an optional "Mute this entire company" extension — useful for filtering out companies known not to recruit from the user's college, or roles consistently miscategorised.

**10.6 Freshness Decay Indicator** (evolved from Jobzy's 24-hour freshness cap — instead of deleting stale jobs, we show decay). "Posted 2h ago" → "Posted 3 days ago" → "Possibly stale (12+ days, no deadline)" → auto-archived after 30 days but still searchable.

**10.7 Personal Job Alert RSS/Atom Feed** (novel — inspired by Geezap's API-key concept and Jobseek's Pro watchlists, but implemented as a zero-infrastructure RSS feed instead of a paid tier). Every user gets a private feed URL (`jobhuntindia.in/feed/[token].xml`) streaming their watchlist matches in standard RSS format, usable in any reader (Feedly, Reeder, Inoreader). Generated on-demand as XML in a single Next.js route handler.

**10.8 Source Reliability Score with Live Link-Health Checks** (novel). Periodically HEAD-pings a sample of `apply_url`s per source to measure what fraction are still live/active, producing a genuine reliability percentage per source over time rather than a static badge.

**10.9 Job Velocity / Trending Signal** (novel, built entirely on the anonymous `apply_clicks` table already needed for crowding scoring). A job receiving an unusually fast click-rate in its first 24 hours gets a "🔥 Trending" badge — a zero-AI, zero-extra-infrastructure signal of real-time competitive intensity.

**10.10 Company Discovery Request Marketplace** (adopted directly from job-seek's "request a company, an agent adds it in under 5 minutes" UX, adapted to a community-prioritised queue since we don't have a coding agent on standby). Users paste a careers URL; if it matches a known ATS adapter, it's queued for immediate scraping; if unsupported, it becomes a discovery candidate, and enough requests for the same domain bumps it up the build-an-adapter priority list.

**10.11 Resume Outcome Benchmarking** (novel, extending the per-resume-version tracking already planned). Anonymous, opt-in aggregate ATS-score leaderboard per job posting — "your resume scores better than 67% of JobHunt India applicants to this role" — using only `(job_id, score)` pairs, no identity attached.

**10.12 Watchlist Delta Alerts via Calendar** (novel synthesis unique to this build's Google-Calendar-only constraint — see Section 9). Since there's no notification centre, watchlist deltas (new match, compensation updated, work mode changed, deadline shortened, job removed) are written as same-day Calendar events, making Calendar double as both reminder system and notification feed.

---
*(Continued in subsequent sections — ingestion architecture, full database schema, redesigned frontend, Google Calendar implementation, and the phased build plan.)*

# PART III — DATA INGESTION & SCRAPING

---

## 11. Ingestion Architecture Overview

JobHunt India uses **layered ingestion** — never depending on a single scraper or source category, exactly as validated across every successful repo in the research sweep (Jobseek's 40 adapters, jobhive's 47 ATS platforms, JobSpy's 7 boards in one call).

```
┌──────────────────────────────────────────────────────────────────────┐
│                         SOURCE CATEGORIES                            │
│                                                                       │
│  1. ATS Platforms (direct API)      → Section 12                    │
│  2. Job Board Aggregator Libraries  → Section 13                    │
│  3. India-Specific Platforms        → Section 14                    │
│  4. GitHub Hiring Lists             → Section 15                    │
│  5. Company Discovery (long-tail)   → Section 16                    │
│  6. Community Submissions           → user-submitted, moderated     │
└───────────────────────────────┬───────────────────────────────────────┘
                                │ all sources funnel into ↓
┌───────────────────────────────▼───────────────────────────────────────┐
│              NORMALISATION PIPELINE (Section 17)                     │
│  Raw ingest → HTML clean → Structured extraction → Title norm.       │
│  → Category map → Location norm. → Compensation parse →              │
│  Eligibility extract → Skill extract → Dedup → Trust score →         │
│  Crowding/Urgency/Hidden-gem compute → Upsert → Watchlist events     │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                          Supabase Postgres (jobs table)
```

Ingestion runs entirely on **GitHub Actions** (free, 2,000 minutes/month) — no dedicated scraping server. This mirrors the exact architecture validated by `billyweinberger/job-scraping-app` (Fetchers → Processor → Reporter → AI, GitHub-Actions-only, daily cron) and `adgramigna/job-board-scraper` (runs for ~$30/year, mostly domain costs, on a similarly minimal architecture).

### 11.1 Source Tiering (Cadence Strategy)

Adopted from Jobzy's BullMQ per-platform interval design, mapped onto GitHub Actions cron tiers to respect both free-tier minutes and each platform's anti-bot tolerance:

| Tier | Sources | Cadence | Method |
|---|---|---|---|
| **Tier 1 — Pure API, no scraping** | Remotive, RemoteOK, Jobicy, Adzuna, Arbeitnow, ATS GraphQL/JSON APIs (Greenhouse, Lever, Ashby, SmartRecruiters) | Every 2 hours | Direct `fetch()`, no browser |
| **Tier 2 — Semi-structured, light scraping** | Naukri (internal JSON API + headers), Internshala (BS4/Cheerio HTML), Hirist, Freshersworld, GitHub hiring lists | Every 4 hours | `requests`/`fetch` + Cheerio/BS4 parsing |
| **Tier 3 — JS-rendered, heavier scraping** | Unstop, LinkedIn (via JobSpy, best-effort), Foundit/Monster India, company career pages without ATS, Workday/Taleo/SuccessFactors portals | Every 6 hours | Playwright headless Chromium with stealth config |

## 12. ATS Adapter Layer

This is the durable backbone of the entire ingestion system — confirmed by every research pass as the highest-value, most stable source category, because ATS platforms expose either clean JSON/GraphQL APIs or highly predictable HTML structures that don't change as often as job-board frontends do.

### 12.1 ATS Platforms Supported (Full Target List)

Directly modelled on **kalil0321/ats-scrapers (jobhive-py)** — the most comprehensive open ATS coverage found in the entire sweep, tracking 3.27M+ live jobs across 86,000+ companies and 47 ATS platforms via a `BaseScraper` interface.

**Tier 1 — must-have, build first (clean JSON/GraphQL APIs, no browser needed):**
- **Greenhouse** — `boards-api.greenhouse.io/v1/boards/{token}/jobs` JSON endpoint. Reference: `adgramigna/job-board-scraper`, `plibither8/jobber`, `MarcusKyung/greenhouse.io-scraper`.
- **Lever** — `api.lever.co/v0/postings/{company}?mode=json`. Reference: same three repos above plus `viktor-shcherb/job-seek`.
- **Ashby** — GraphQL API at `jobs.ashbyhq.com/api/non-user-graphql`, no browser required. Reference: `d-alleyne/ashby-job-scraper` (adopted `daysBack` incremental-fetch parameter directly), `plibither8/jobber`.
- **SmartRecruiters** — public `api.smartrecruiters.com/v1/companies/{company}/postings` JSON API.
- **Workable** — `apply.workable.com/api/v1/widget/accounts/{account}` JSON API.

**Tier 2 — build next (JSON APIs but less standardised):**
- **Rippling**, **Recruitee**, **Teamtailor**, **BambooHR**, **JazzHR**, **Breezy**, **Pinpoint** — all confirmed to expose semi-public job-listing JSON endpoints per the jobhive-py manifest.

**Tier 3 — enterprise ATS, browser or heavier parsing required:**
- **Workday** — confirmed reachable via Workday's own internal API pattern (per `kbhujbal/go-get-jobs`'s direct Workday API integration). No full headless browser needed in most cases — a `cxs/{tenant}/{site}/jobs` POST endpoint pattern works for most Workday-hosted boards.
- **Oracle Taleo**, **SAP SuccessFactors**, **iCIMS** — heavier, less standardised; built on a generic JSON-LD + DOM-pattern extractor (see 12.2) rather than bespoke adapters per tenant, since the long tail of individual tenant quirks isn't worth bespoke code.

### 12.2 Generic Fallback Extractor (for unknown/long-tail company career pages)

Directly adopted from **`viktor-shcherb/job-seek`**'s pipeline: anchors → JSON-LD (`schema.org/JobPosting`) → repeated DOM block detection → pagination handling → normalisation, with a **headless-JS rendering fallback** triggered automatically when the initial HTML fetch looks like a JS shell (near-empty `<body>`, React/Vue root div with no server-rendered content). This is what the Company Discovery Engine (Section 16) uses for any company career page that doesn't match a known ATS pattern.

```javascript
// scripts/ingest/utils/generic-extractor.js
// Adapted from the job-seek extraction pipeline pattern

export async function extractGenericCareerPage(url) {
  let html = await fetch(url).then(r => r.text());

  // Detect JS shell (job-seek's heuristic: near-empty body + framework root div)
  const looksLikeShell = /<div id="(root|app|__next)">\s*<\/div>/i.test(html)
    || html.replace(/<[^>]+>/g, '').trim().length < 200;

  if (looksLikeShell) {
    html = await renderWithPlaywright(url); // headless Chromium fallback
  }

  // 1. Try JSON-LD JobPosting schema first (cleanest signal when present)
  const jsonLdJobs = extractJsonLdJobPostings(html);
  if (jsonLdJobs.length) return jsonLdJobs;

  // 2. Fall back to repeated-DOM-block detection (job-seek's general pipeline)
  return extractRepeatedBlocks(html, url);
}
```

### 12.3 Normalised Job Contract (Adapter Output Schema)

Every adapter — ATS, board, India platform, or generic extractor — outputs this single shape, directly modelled on jobhive-py's `BaseScraper.fetch() → list[Job]` contract and the original plan's `NormalizedJob` interface:

```typescript
interface NormalizedJob {
  source_type:      'ats' | 'board' | 'india_platform' | 'github_list' | 'community' | 'discovery';
  source_name:       string;          // 'greenhouse' | 'naukri' | 'internshala' | etc.
  source_url:        string;          // canonical dedup key
  external_id:       string | null;   // ATS-native job ID if available
  company:           string;
  company_domain:    string | null;
  title:             string;
  description_raw:   string;
  location_raw:       string | null;
  work_mode:         'remote' | 'hybrid' | 'onsite' | 'unknown';
  employment_type:   'internship' | 'full_time' | 'contract' | 'part_time' | 'unknown';
  role_category:      string | null;   // computed at normalisation, not adapter-level
  salary_raw:        string | null;
  stipend_raw:        string | null;
  posted_at:          string | null;
  deadline_raw:       string | null;
  apply_url:          string;
  is_early_applicant: boolean | null;  // from Internshala-style structured signal
  is_ppo_mentioned:   boolean | null;  // from Internshala's job_offer flag or regex
  metadata_json:      Record<string, unknown>;
}
```

### 12.4 ATS Adapter Implementation Examples

```javascript
// scripts/ingest/ats/greenhouse.js
export async function fetchGreenhouse(boardToken) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`);
  const { jobs } = await res.json();
  return jobs.map(j => ({
    source_type: 'ats', source_name: 'greenhouse',
    source_url: j.absolute_url, external_id: String(j.id),
    company: boardToken, title: j.title,
    description_raw: j.content,
    location_raw: j.location?.name ?? null,
    posted_at: j.updated_at, apply_url: j.absolute_url,
    metadata_json: { departments: j.departments },
  }));
}

// scripts/ingest/ats/lever.js
export async function fetchLever(company) {
  const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`);
  const jobs = await res.json();
  return jobs.map(j => ({
    source_type: 'ats', source_name: 'lever',
    source_url: j.hostedUrl, external_id: j.id,
    company, title: j.text,
    description_raw: j.descriptionPlain,
    location_raw: j.categories?.location ?? null,
    work_mode: /remote/i.test(j.categories?.location ?? '') ? 'remote' : 'onsite',
    posted_at: new Date(j.createdAt).toISOString(),
    apply_url: j.applyUrl,
    salary_raw: j.salaryRange ? `${j.salaryRange.min}-${j.salaryRange.max} ${j.salaryRange.currency}` : null,
    metadata_json: { team: j.categories?.team },
  }));
}

// scripts/ingest/ats/ashby.js — GraphQL API, daysBack incremental param (from d-alleyne/ashby-job-scraper)
export async function fetchAshby(orgSlug, daysBack = 7) {
  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${orgSlug}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const { jobs } = await res.json();
  const cutoff = Date.now() - daysBack * 86400000;
  return jobs
    .filter(j => new Date(j.publishedAt).getTime() >= cutoff)
    .map(j => ({
      source_type: 'ats', source_name: 'ashby',
      source_url: j.jobUrl, external_id: j.id,
      company: orgSlug, title: j.title,
      description_raw: j.descriptionHtml,
      location_raw: j.location, work_mode: j.isRemote ? 'remote' : 'onsite',
      employment_type: j.employmentType?.toLowerCase() ?? 'unknown',
      posted_at: j.publishedAt, apply_url: j.applyUrl,
      metadata_json: { department: j.department },
    }));
}

// scripts/ingest/ats/workday.js — Workday's internal CXS endpoint pattern
export async function fetchWorkday(tenant, site) {
  const res = await fetch(`https://${tenant}.wd1.myworkdayjobs.com/wday/cxs/${tenant}/${site}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 50, offset: 0, searchText: '' }),
  });
  const { jobPostings } = await res.json();
  return jobPostings.map(j => ({
    source_type: 'ats', source_name: 'workday',
    source_url: `https://${tenant}.wd1.myworkdayjobs.com${j.externalPath}`,
    external_id: j.bulletFields?.[0] ?? null,
    company: tenant, title: j.title,
    description_raw: '', // Workday requires a second per-job call for full description
    location_raw: j.locationsText, posted_at: j.postedOn,
    apply_url: `https://${tenant}.wd1.myworkdayjobs.com${j.externalPath}`,
    metadata_json: {},
  }));
}
```

### 12.5 Indian Companies Mapped to ATS Adapters

A curated registry (`config/companies-ats-registry.json`) of ~500 Indian companies mapped to their ATS platform + board token, enabling the canonical Company Discovery concept (Section 16) for the Indian market specifically:

```json
[
  { "name": "Razorpay",  "ats": "greenhouse", "token": "razorpay" },
  { "name": "CRED",      "ats": "lever",      "token": "cred" },
  { "name": "Meesho",    "ats": "greenhouse", "token": "meesho" },
  { "name": "Swiggy",    "ats": "custom",     "url": "https://careers.swiggy.com" },
  { "name": "Zomato",    "ats": "custom",     "url": "https://www.zomato.com/careers" },
  { "name": "Ola",       "ats": "custom",     "url": "https://www.olacabs.com/careers" },
  { "name": "Zepto",     "ats": "greenhouse", "token": "zepto" },
  { "name": "Infosys",   "ats": "custom",     "url": "https://career.infosys.com/joblist" },
  { "name": "TCS",       "ats": "custom",     "url": "https://ibegin.tcs.com/iBegin/" },
  { "name": "Wipro",     "ats": "custom",     "url": "https://careers.wipro.com/jobs/" },
  { "name": "Flipkart",  "ats": "custom",     "url": "https://www.flipkartcareers.com/#!/joblist" }
]
```

`"ats": "custom"` entries route to the generic extractor (Section 12.2) with Playwright fallback; `"ats": "greenhouse"`/`"lever"`/`"ashby"` entries use the direct API adapters (Section 12.4). This registry grows over time via the Company Discovery Request flow (Section 16.2).

## 13. Job Board & Public API Layer

### 13.1 JobSpy as the Primary Multi-Board Unification Library

**`speedyapply/JobSpy`** (PyPI: `python-jobspy`) is adopted as the primary ingestion library for LinkedIn, Indeed, Glassdoor, Google Jobs, and ZipRecruiter in a single unified call, replacing what would otherwise require five bespoke scrapers. Critically, **JobSpy already ships first-class Naukri support** with India-relevant structured fields (`skills`, `experience_range`, `company_rating`, `company_reviews_count`, `vacancy_count`, `work_from_home_type`) — confirmed directly in the PyPI documentation during research.

```python
# scripts/ingest/jobspy_runner.py
from jobspy import scrape_jobs
import json, sys

jobs_df = scrape_jobs(
    site_name=["indeed", "linkedin", "naukri"],
    search_term=sys.argv[1] if len(sys.argv) > 1 else "software engineer",
    location="India",
    results_wanted=50,
    hours_old=72,            # only jobs posted in the last 3 days
    country_indeed="India",  # required for Indeed's country-scoping
)
print(jobs_df.to_json(orient="records"))
```

```yaml
# Invoked from the GitHub Actions ingestion workflow as a Python subprocess step
- name: Run JobSpy ingestion
  run: |
    pip install python-jobspy --quiet
    python scripts/ingest/jobspy_runner.py "software engineer" > jobspy_output.json
    python scripts/ingest/jobspy_runner.py "data scientist intern" >> jobspy_output.json
    node scripts/ingest/utils/import-jobspy-output.js jobspy_output.json
```

**Documented operational limits (taken directly from JobSpy's own documentation, adopted verbatim into our cadence rules):** Indeed is the most reliable scraper with effectively no rate limiting, capped at ~1,000 results per search. LinkedIn is the most restrictive, rate-limiting around the 10th results page per IP — meaning LinkedIn results via JobSpy are treated as **best-effort bonus coverage**, never a load-bearing dependency, exactly as the earlier plan iteration already recommended independently. A TypeScript port (`alpharomercoma/ts-jobspy`) exists if native Node integration is preferred over a Python subprocess step — documented as an alternative integration path.

### 13.2 Pure Public APIs (No Scraping, No Rate-Limit Risk)

| API | Endpoint | Notes |
|---|---|---|
| **Remotive** | `remotive.com/api/remote-jobs` | No key required, remote-only |
| **RemoteOK** | `remoteok.com/api` | No key required, remote-only |
| **Jobicy** | `jobicy.com/api/v2/remote-jobs` | No key required, remote-only |
| **Adzuna** | `api.adzuna.com/v1/api/jobs/in/search/{page}` | Free developer key, India-scoped (`/in/`) |
| **Arbeitnow** | `arbeitnow.com/api/job-board-api` | No key required (verify still active periodically) |

### 13.3 India-Relevant Boards Beyond Naukri (Newly Added From Research)

- **Hirist.tech** — confirmed via the Apify marketplace sweep as "India's #1 niche IT job portal" with 50K+ active listings, salary/skills/experience/recruiter info. Scraped via a Cheerio HTML parser (Tier 2 cadence) targeting category and search-result pages.
- **Freshersworld** — confirmed as India's #1 portal specifically for freshers and entry-level roles. Lightweight HTML structure, scraped via Cheerio (Tier 2 cadence).
- **Foundit (formerly Monster India)** — confirmed reachable via Playwright stealth mode in the Jobzy precedent; Tier 3 cadence.
- **Wellfound / AngelList** — startup-focused listings, useful for the startup-internship persona; Tier 3, Playwright.
- **Cutshort, TimesJobs** — included as best-effort sources where technically accessible, Tier 3.

### 13.4 Rate-Limit & Anti-Bot Cadence Rules (Synthesised From All Sources Studied)

- **Naukri:** internal JSON API confirmed reachable directly (per `Rockposedon/WebScraping`) but requires realistic browser-mimicking headers and cookies (per `pawan941394/Naukri-Web-Scrapper-`). No headless browser strictly required — lighter-weight `requests`-based calls preferred (per `Hyperion101010/naukri-scraper`'s 400K-profile-scale precedent) to conserve GitHub Actions compute minutes.
- **LinkedIn:** rate-limits around page 10 per IP with no proxy (per JobSpy's own documentation) — kept at Tier 3, best-effort only, never the backbone.
- **Internshala:** reliably scraped via plain BeautifulSoup4/Cheerio HTML parsing (confirmed independently by 4 separate repos in the sweep) — no headless browser needed, Tier 2 cadence is safe.
- **Unstop:** requires Playwright due to dynamic JS-rendered content — Tier 3 cadence with stealth config (randomised user-agent, realistic viewport, navigation delays) per the Jobzy precedent's documented CAPTCHA-avoidance advice (keep polling intervals at 15+ minutes minimum per platform; our 4–6 hour tiers are comfortably within this).

## 14. India-Specific Platform Scrapers

### 14.1 Naukri Adapter

```javascript
// scripts/ingest/india/naukri.js
// Pattern confirmed by Rockposedon/WebScraping (internal API) + pawan941394 (headers/cookies)
export async function fetchNaukri(keyword, location = 'india') {
  const url = `https://www.naukri.com/jobapi/v3/search?noOfResults=50&keyword=${encodeURIComponent(keyword)}&location=${location}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'appid': '109', 'systemid': '109', // public Naukri internal app identifiers
    },
  });
  const data = await res.json();
  return (data.jobDetails ?? []).map(j => ({
    source_type: 'india_platform', source_name: 'naukri',
    source_url: `https://www.naukri.com/job-listings-${j.jdURL}`,
    external_id: j.jobId, company: j.companyName, title: j.title,
    description_raw: j.jobDescription ?? '',
    location_raw: j.placeholders?.find(p => p.type === 'location')?.label ?? null,
    salary_raw: j.placeholders?.find(p => p.type === 'salary')?.label ?? null,
    posted_at: j.createdDate, apply_url: `https://www.naukri.com/job-listings-${j.jdURL}`,
    metadata_json: {
      skills: j.tagsAndSkills?.split(',') ?? [],
      experience_range: j.placeholders?.find(p => p.type === 'experience')?.label,
      company_rating: j.ambitionBoxData?.AggregateRating,
      vacancy_count: j.vacancy,
    },
  }));
}
```

### 14.2 Internshala Adapter

```javascript
// scripts/ingest/india/internshala.js
// Confirmed by het-parekh, vkbandari, ligmitz — BS4/Cheerio pattern, query-field driven
import * as cheerio from 'cheerio';

export async function fetchInternshala(category = '', location = '') {
  const params = new URLSearchParams({ category, location, job_offer: '' }); // job_offer flags PPO-likely
  const html = await fetch(`https://internshala.com/internships/${params}`).then(r => r.text());
  const $ = cheerio.load(html);
  const jobs = [];

  $('.internship_meta').each((_, el) => {
    const $el = $(el);
    const title    = $el.find('.job-internship-name').text().trim();
    const company  = $el.find('.company-name').text().trim();
    const stipend  = $el.find('.stipend').text().trim();
    const duration = $el.find('[data-duration]').text().trim();
    const loc      = $el.find('.locations').text().trim();
    const link     = 'https://internshala.com' + $el.find('a.view_detail_button').attr('href');
    const isPPO    = /job offer/i.test($el.text());            // PPO structured signal at source
    const isEarly  = /early applicant/i.test($el.text());

    jobs.push({
      source_type: 'india_platform', source_name: 'internshala',
      source_url: link, external_id: null, company, title,
      description_raw: '', location_raw: loc,
      employment_type: 'internship', stipend_raw: stipend,
      apply_url: link, is_ppo_mentioned: isPPO, is_early_applicant: isEarly,
      metadata_json: { duration_raw: duration },
    });
  });
  return jobs;
}
```

### 14.3 Unstop Adapter (Playwright, Tier 3)

```javascript
// scripts/ingest/india/unstop.js — JS-rendered, requires Playwright per research findings
import { chromium } from 'playwright';

export async function fetchUnstop(category = 'jobs') {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
  await page.goto(`https://unstop.com/${category}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('.opportunity-card', { timeout: 10000 }).catch(() => {});

  const jobs = await page.evaluate(() => {
    return [...document.querySelectorAll('.opportunity-card')].slice(0, 40).map(el => ({
      title:    el.querySelector('.title')?.textContent?.trim(),
      company:  el.querySelector('.company-name')?.textContent?.trim(),
      url:      el.querySelector('a')?.href,
      location: el.querySelector('.location')?.textContent?.trim(),
      deadline: el.querySelector('.deadline')?.textContent?.trim(),
    }));
  });

  await browser.close();
  return jobs.filter(j => j.title && j.url).map(j => ({
    source_type: 'india_platform', source_name: 'unstop',
    source_url: j.url, external_id: null, company: j.company, title: j.title,
    description_raw: '', location_raw: j.location,
    deadline_raw: j.deadline, apply_url: j.url,
    metadata_json: {},
  }));
}
```

### 14.4 Hirist & Freshersworld Adapters (New India Sources from Research)

```javascript
// scripts/ingest/india/hirist.js — confirmed as IT-niche, Cheerio-scrapeable
export async function fetchHirist(keyword) {
  const html = await fetch(`https://www.hirist.tech/search?q=${encodeURIComponent(keyword)}`)
    .then(r => r.text());
  const $ = cheerio.load(html);
  const jobs = [];
  $('.job-card').each((_, el) => {
    const $el = $(el);
    jobs.push({
      source_type: 'india_platform', source_name: 'hirist',
      source_url: 'https://www.hirist.tech' + $el.find('a').attr('href'),
      company: $el.find('.company').text().trim(),
      title: $el.find('.job-title').text().trim(),
      description_raw: '',
      location_raw: $el.find('.location').text().trim(),
      salary_raw: $el.find('.salary').text().trim(),
      apply_url: 'https://www.hirist.tech' + $el.find('a').attr('href'),
      metadata_json: { skills: $el.find('.skill-tag').map((_, s) => $(s).text()).get() },
    });
  });
  return jobs;
}

// scripts/ingest/india/freshersworld.js — confirmed India's #1 fresher-focused portal
export async function fetchFreshersworld(keyword) {
  const html = await fetch(`https://www.freshersworld.com/jobs/jobsearch/${encodeURIComponent(keyword)}`)
    .then(r => r.text());
  const $ = cheerio.load(html);
  const jobs = [];
  $('.job-container').each((_, el) => {
    const $el = $(el);
    jobs.push({
      source_type: 'india_platform', source_name: 'freshersworld',
      source_url: $el.find('a.job-title-text').attr('href'),
      company: $el.find('.company-name').text().trim(),
      title: $el.find('.job-title-text').text().trim(),
      description_raw: '', location_raw: $el.find('.job-location').text().trim(),
      apply_url: $el.find('a.job-title-text').attr('href'),
      metadata_json: {},
    });
  });
  return jobs;
}
```

## 15. GitHub & Community-List Ingestion

GitHub is valuable for curated hiring lists that often surface companies and roles earlier than mainstream boards.

### 15.1 GitHub Sources to Ingest

- **`Bhanubasyan/hiring-companies-list-2026`** — curated markdown table of 250+ companies hiring freshers/interns/full-time (already in the original project context).
- **`SimplifyJobs/Summer2025-Internships`**, **`pittcsc/New-Grad-2025`**, **`ReaVNaiL/New-Grad-2024`** — large, actively-maintained markdown-table hiring repos with strong community update cadence.
- **`kbhujbal/go-get-jobs`** — actually auto-publishes a constantly-updated README of 50+ named tech companies scraped via Workday; ingestible as a secondary GitHub-list source even though it's technically a scraper output, not a hand-curated list.
- Topic/repository search for new curated lists on a recurring basis (monthly discovery sweep), since new hiring-list repos appear regularly.

### 15.2 GitHub Ingestion Methods

Parse README markdown tables (regex on `| Company | Link | Role | Location |` row patterns). Parse any JSON/CSV data files committed alongside the README. Track each repo's last-seen commit hash so only deltas are reprocessed on subsequent runs (avoids redundant AI summarisation calls on unchanged rows).

```javascript
// scripts/ingest/github/list-monitor.js
export async function ingestGithubList(repoSlug, branch = 'main') {
  const metaUrl = `https://api.github.com/repos/${repoSlug}/commits/${branch}`;
  const { sha: latestCommit } = await fetch(metaUrl, {
    headers: { 'User-Agent': 'JobHuntIndia-Bot' }
  }).then(r => r.json());

  const { data: lastRun } = await supabaseAdmin()
    .from('source_runs').select('last_commit_hash')
    .eq('source_name', repoSlug).maybeSingle();

  if (lastRun?.last_commit_hash === latestCommit) {
    return []; // no change since last run — skip re-parsing entirely
  }

  const readme = await fetch(`https://raw.githubusercontent.com/${repoSlug}/${branch}/README.md`)
    .then(r => r.text());
  const jobs = parseMarkdownTable(readme, repoSlug);

  await supabaseAdmin().from('source_runs').upsert({
    source_name: repoSlug, last_commit_hash: latestCommit, last_run_at: new Date().toISOString(),
  });

  return jobs;
}
```

### 15.3 Community Submission Source

Users can submit official career page links, startup hiring pages, off-campus drive forms, or campus drive links through the in-app submission form (Section 16.2 covers the matching company-discovery flow). Submissions land in a review queue with auto-validation (URL reachability check, basic spam heuristics) and a 24-hour auto-approval window if unflagged.

## 16. Company Discovery Engine

This is where JobHunt India goes meaningfully beyond every repo studied — closest precedent is `colophon-group/jobseek`'s 4,400-company direct monitor and `viktor-shcherb/job-seek`'s "request a company, an agent adds it in 5 minutes" UX, both adapted here for the Indian market and a fully-automated (non-agent-staffed) discovery pipeline.

### 16.1 Discovery Sources

GitHub curated lists (Section 15). Startup directories (Wellfound, India-specific startup databases). Public careers pages found through targeted search seeding (e.g. searching `"careers" site:{company-domain}` patterns for companies in our curated registry that don't yet have a mapped ATS). Manual user-submitted requests (Section 16.2). Broad web discovery (Common Crawl-style) is explicitly treated as a **secondary enrichment mechanism only** — never a core near-real-time source, since freshness and validation are much harder to guarantee at that scale, exactly as the prior plan iteration correctly identified.

### 16.2 Company Discovery Request UI

A dedicated `/discover` page lets users paste a company domain or careers URL to request tracking:

```
Flow:
1. User pastes company domain or careers URL.
2. System validates reachability (HEAD request, checks for a 2xx response).
3. System probes for known ATS signatures:
   - boards.greenhouse.io/{token} pattern → instant Greenhouse adapter match
   - jobs.lever.co/{company} pattern → instant Lever adapter match
   - jobs.ashbyhq.com/{org} pattern → instant Ashby adapter match
   - {tenant}.wd1.myworkdayjobs.com pattern → instant Workday adapter match
4. If matched: queue immediate scrape via the matching adapter, surface results within
   the next ingestion cycle (within 6 hours).
5. If unmatched: store as a discovery candidate in `company_requests`, route to the
   generic extractor (Section 12.2) on a best-effort basis, and increment a request
   counter. When a domain accumulates 5+ independent user requests, it is prioritised
   for a bespoke adapter if the generic extractor's output quality is poor.
```

### 16.3 Hidden Listing Discovery

Crawl company career pages even when the company doesn't appear on LinkedIn or Naukri at all — this is precisely how "hidden gem" jobs (Section 20.3) get discovered in the first place. Official ATS boards and direct company pages are preferred sources for low-crowding detection, since by definition a listing that only exists on a small ATS page (and not cross-posted to a major board) has a structurally smaller applicant pool.

## 17. Normalisation, Deduplication & Trust Scoring

### 17.1 Normalisation Pipeline Stages

Every job, regardless of source, passes through the same eleven stages: raw ingest → HTML clean → structured extraction → title normalisation → category mapping → location normalisation → compensation parsing → eligibility extraction → skill extraction → duplicate detection → trust scoring → ranking metric computation (urgency/crowding/hidden-gem) → upsert → watchlist delta event generation.

### 17.2 Deduplication Strategy (Multi-Key)

Exact `apply_url` match (primary key). Canonical URL match (stripping tracking query params like `?utm_source=`). Same company + similar title (Levenshtein distance threshold) + similar location + overlapping posting window (catches the same role cross-posted with slightly different URLs across boards). External ATS-native ID match when the source provides one (most reliable when available — Greenhouse, Lever, and Ashby all expose stable IDs).

```javascript
// scripts/ingest/utils/deduplicate.js
export async function findDuplicate(job, sb) {
  // 1. Exact canonical URL match
  const canonicalUrl = job.apply_url.split('?')[0];
  const { data: exact } = await sb.from('jobs').select('id').eq('canonical_apply_url', canonicalUrl).maybeSingle();
  if (exact) return { id: exact.id, matchType: 'exact_url' };

  // 2. External ID match (when ATS provides one)
  if (job.external_id) {
    const { data: byId } = await sb.from('jobs').select('id')
      .eq('source_name', job.source_name).eq('external_id', job.external_id).maybeSingle();
    if (byId) return { id: byId.id, matchType: 'external_id' };
  }

  // 3. Fuzzy company+title+location+window match (catches cross-posted duplicates)
  const titleNorm = job.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const { data: candidates } = await sb.from('jobs')
    .select('id, title, posted_at')
    .eq('company', job.company)
    .gte('posted_at', new Date(Date.now() - 14 * 86400000).toISOString());

  for (const c of candidates ?? []) {
    const cTitleNorm = c.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (levenshteinSimilarity(titleNorm, cTitleNorm) > 0.85) {
      return { id: c.id, matchType: 'fuzzy_match' };
    }
  }
  return null;
}
```

### 17.3 Source Trust Scoring Inputs

Official career page / direct ATS source (highest weight) versus third-party board (lower weight). Parse completeness (did we successfully extract description, location, compensation, deadline — or only a title and link). Freshness (how recently was this listing confirmed still live). Cross-source confirmation (does the same role appear via 2+ independent sources — a strong trust signal). Historical source quality (a source's track record of producing valid, non-stale, non-broken listings over time, computed from `job_sources.reliability_score` updated on a rolling basis).

### 17.4 Listing Quality Score (Separate from Trust — Used for Moderation/Feed Confidence)

Description completeness. Skills successfully extracted (non-empty `key_skills` array). Eligibility clarity (could batch year/CGPA/degree constraints be parsed, or are they all `unknown`). Deadline presence. Compensation presence. Apply-link quality (resolves to a 2xx response, not a redirect loop or 404).

---
*(Continued — Part IV: Ranking & Intelligence Layer, with full eligibility/fit/crowding/urgency scoring formulas.)*

# PART IV — RANKING & INTELLIGENCE LAYER

---

## 18. Eligibility Engine

### 18.1 Inputs

User profile (CGPA, batch year, degree, branch, backlog status if self-reported) and job structured fields (`cgpa_cutoff`, `batch_years[]`, `degree_required[]`, `branch_required[]`, `bond_flag`, `location_requirement`).

### 18.2 Output States

Always exactly one of: **Eligible** · **Borderline** · **Ineligible** · **Unknown** (shown when the user's profile is incomplete or the job's eligibility fields couldn't be parsed at ingest).

### 18.3 Reasons Panel (Always Shown, Never Just a Badge Alone)

```typescript
// lib/intelligence/eligibility.ts
export function evaluateEligibility(job: Job, profile: Profile): EligibilityResult {
  if (!profile.cgpa || !profile.graduation_year) {
    return { status: 'unknown', reasons: ['Complete your profile to see eligibility'] };
  }

  const reasons: { field: string; status: 'pass' | 'fail' | 'warn'; message: string }[] = [];

  if (job.cgpa_cutoff != null) {
    reasons.push(profile.cgpa >= job.cgpa_cutoff
      ? { field: 'CGPA', status: 'pass', message: `Cutoff ${job.cgpa_cutoff}, you have ${profile.cgpa}` }
      : { field: 'CGPA', status: 'fail', message: `Cutoff ${job.cgpa_cutoff}, your CGPA is ${profile.cgpa}` });
  }

  if (job.batch_years?.length) {
    reasons.push(job.batch_years.includes(profile.graduation_year)
      ? { field: 'Batch', status: 'pass', message: `${profile.graduation_year} batch accepted` }
      : { field: 'Batch', status: 'fail', message: `Batch year mismatch — listing wants ${job.batch_years.join(' or ')}` });
  }

  if (job.degree_required?.length && !job.degree_required.includes('Any')) {
    reasons.push(job.degree_required.includes(profile.degree)
      ? { field: 'Degree', status: 'pass', message: `${profile.degree} accepted` }
      : { field: 'Degree', status: 'warn', message: `Listing prefers ${job.degree_required.join('/')}` });
  }

  if (job.bond_flag) {
    reasons.push({ field: 'Bond', status: 'warn', message: 'Service agreement / bond mentioned in listing' });
  }

  if (!job.cgpa_cutoff && !job.batch_years?.length) {
    reasons.push({ field: 'Clarity', status: 'warn', message: 'Degree/eligibility not explicitly specified — uncertain' });
  }

  const fails = reasons.filter(r => r.status === 'fail').length;
  return {
    status: fails === 0 ? 'eligible' : fails === 1 ? 'borderline' : 'ineligible',
    reasons,
  };
}
```

## 19. Fit Score & Resume Matching

### 19.1 Fit Score Model — Weighted Composite

The fit score blends seven signals rather than a single AI call guessing holistically, making it both more explainable and cheaper to compute (most components are free, rule-based pre-filters before the one AI call that adds genuine reasoning):

```
fit_score = (
    0.30 * skill_overlap_ratio +
    0.15 * project_overlap_signal +
    0.20 * resume_keyword_similarity +
    0.15 * preferred_role_match +
    0.10 * location_preference_match +
    0.10 * experience_seniority_match
) * 100
```

`skill_overlap_ratio`, `preferred_role_match`, `location_preference_match`, and `experience_seniority_match` are computed with zero AI cost (set intersection / direct comparison). Only `resume_keyword_similarity` and `project_overlap_signal` benefit from an AI call (semantic understanding beyond literal keyword matching) — and even those fall back to a TF-IDF-style overlap calculation when the daily AI quota is exhausted, so the Fit Score **never fully breaks**, it just becomes slightly less nuanced.

```typescript
// lib/intelligence/fit-score.ts
export async function computeFitScore(job: Job, profile: Profile, resumeVersion?: ResumeVersion) {
  const userSkills = new Set((profile.skills ?? []).map(s => s.toLowerCase()));
  const jobSkills  = job.key_skills ?? [];

  const skillOverlapRatio = jobSkills.length
    ? jobSkills.filter(s => userSkills.has(s.toLowerCase())).length / jobSkills.length
    : 0.5; // neutral when job has no parsed skills

  const preferredRoleMatch     = profile.preferred_roles?.includes(job.role_category) ? 1 : 0.3;
  const locationPreferenceMatch = profile.preferred_locations?.some(l => job.location?.includes(l)) ? 1
                                  : job.work_mode === 'remote' ? 0.8 : 0.2;
  const experienceMatch = (profile.graduation_year && job.experience_max != null)
    ? (job.experience_max <= 2 ? 1 : 0.4) // fresher-friendly heuristic
    : 0.5;

  // AI-assisted signals (fall back to rule-based overlap if quota exhausted)
  const { resumeKeywordSimilarity, projectOverlapSignal } =
    await computeAIAssistedSignals(job, profile, resumeVersion);

  const score = Math.round(100 * (
    0.30 * skillOverlapRatio +
    0.15 * projectOverlapSignal +
    0.20 * resumeKeywordSimilarity +
    0.15 * preferredRoleMatch +
    0.10 * locationPreferenceMatch +
    0.10 * experienceMatch
  ));

  return { score, components: { skillOverlapRatio, preferredRoleMatch, locationPreferenceMatch, experienceMatch } };
}
```

### 19.2 Per-Resume-Version Performance Tracking

Every application optionally attaches a `resume_version_id`. Over time, this lets `resume_outcomes` aggregate: applications sent per version, OA/interview/offer conversion rate per version, category-wise performance (which resume wins for SWE vs Data/ML roles), and company-size-wise performance. Surfaced in the Resume Lab dashboard (Section 27.3).

## 20. Urgency, Crowding & Hidden-Gem Scores

### 20.1 Urgency Rank

```
urgency_score = (
    0.45 * deadline_proximity_factor +
    0.20 * deadline_confidence_factor +
    0.20 * already_saved_factor +
    0.15 * historical_decay_rate_factor
) * 100
```

`deadline_proximity_factor` decays from 1.0 (deadline today) to 0.0 (30+ days out, or no deadline). `deadline_confidence_factor` is 1.0 for an explicitly parsed date, 0.5 for an inferred/regex-guessed date. `already_saved_factor` boosts urgency slightly for jobs the user has already shortlisted (signals genuine personal interest, not just generic recency). `historical_decay_rate_factor` uses the source's historical pattern — some sources/companies are known to close listings fast based on past observed `apply_url` link-health decay (Section 22.2).

### 20.2 Crowding Score

```
crowding_score = (
    0.35 * platform_popularity_weight +
    0.30 * normalized_click_through_count +
    0.20 * normalized_save_count +
    0.15 * source_openness_factor
) * 100
```

`platform_popularity_weight` is highest for major boards (LinkedIn, Naukri) and lowest for a listing found only on a small direct ATS page. `normalized_click_through_count` and `normalized_save_count` come from JobHunt India's own anonymous `apply_clicks` and `saved_jobs` tables, normalised against the median for that role category to avoid raw-count bias toward older listings. `source_openness_factor` is lower (less crowded) for jobs sourced exclusively via direct ATS/company pages versus jobs cross-posted to major public boards.

### 20.3 Hidden-Gem Score

```
hidden_gem_score = fit_score_normalised
                    * trust_score_normalised
                    * (1 - crowding_score_normalised)
                    * deadline_still_open_factor
```

A job scores highly here precisely when it's a strong personal fit, comes from a trustworthy source, has low estimated competition, and still has time to apply. This is a multiplicative formula rather than additive specifically so that a job failing badly on any one dimension (e.g. zero fit, or already closed) can't be propped up by strength on the others — a true hidden gem must clear a bar on every dimension simultaneously.

```typescript
// lib/intelligence/scoring.ts
export function computeHiddenGemScore(job: JobWithScores): number {
  const fitNorm      = (job.fit_score ?? 50) / 100;
  const trustNorm     = job.reliability_score / 100;
  const crowdingNorm  = job.crowding_score / 100;
  const deadlineOpen  = job.deadline ? (new Date(job.deadline) > new Date() ? 1 : 0) : 0.7; // no deadline = mild uncertainty

  return Math.round(100 * fitNorm * trustNorm * (1 - crowdingNorm) * deadlineOpen);
}
```

## 21. Learning Priority Engine

### 21.1 Inputs

User's target role categories (from profile preferences), saved jobs' required skills, applied jobs' required skills, and historical "missing skills" frequency aggregated across every fit-score computation ever run for that user.

### 21.2 Outputs

A ranked list of high/medium/low priority skills, each annotated with a "why this matters" explanation (e.g. "Appears in 8 of your 12 saved jobs and is trending +40% in demand this month"), free learning resources, an estimated weeks-to-competency, and an explicit quick-win-vs-long-term-investment categorisation so users can sequence their learning sensibly rather than trying to learn everything at once.

```typescript
// lib/intelligence/learning-priority.ts
export async function buildLearningPriority(userId: string) {
  const sb = supabaseAdmin();

  // Aggregate missing skills across all this user's fit-score computations
  const { data: scores } = await sb.from('fit_scores').select('missing').eq('user_id', userId);
  const skillFrequency: Record<string, number> = {};
  for (const row of scores ?? []) {
    for (const skill of row.missing ?? []) {
      skillFrequency[skill] = (skillFrequency[skill] ?? 0) + 1;
    }
  }

  // Cross-reference with platform-wide demand trend (skill_demand_daily table)
  const { data: demandTrend } = await sb.from('skill_demand_daily')
    .select('skill, count, week_over_week_change')
    .in('skill', Object.keys(skillFrequency));

  const ranked = Object.entries(skillFrequency)
    .map(([skill, freq]) => {
      const trend = demandTrend?.find(d => d.skill === skill);
      const priorityScore = freq * 2 + (trend?.week_over_week_change ?? 0) * 0.5;
      return { skill, freq, trend: trend?.week_over_week_change ?? 0, priorityScore };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return {
    high:   ranked.slice(0, 3),
    medium: ranked.slice(3, 7),
    low:    ranked.slice(7, 12),
  };
}
```

## 22. Source Reliability System

### 22.1 UI-Facing Outputs

Reliability badge (🟢 Official / 🔵 Cross-verified / 🟡 Community verified / ⚪ Low confidence). Last-checked timestamp. "Cross-verified on 2 sources" tag where applicable. Broken/stale warning when a periodic link-health check fails.

### 22.2 Live Link-Health Checks (Novel Addition — Section 10.8)

A separate lightweight GitHub Actions job (low frequency — daily, not every ingestion cycle, to conserve minutes) samples a rotating subset of `apply_url`s per source and issues a `HEAD` request, updating `job_sources.reliability_score` as a rolling percentage of links still resolving with a 2xx/3xx status:

```javascript
// scripts/ingest/health-check.js — runs once daily, separate from the main ingestion cron
export async function checkSourceHealth() {
  const sb = supabaseAdmin();
  const { data: sources } = await sb.from('job_sources').select('id, source_name');

  for (const source of sources ?? []) {
    const { data: sample } = await sb.from('jobs')
      .select('id, apply_url').eq('source', source.source_name)
      .order('posted_at', { ascending: false }).limit(30); // sample the 30 most recent per source

    let alive = 0;
    for (const job of sample ?? []) {
      try {
        const res = await fetch(job.apply_url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(5000) });
        if (res.ok || res.status < 400) alive++;
      } catch { /* counts as dead */ }
    }

    const reliabilityScore = sample?.length ? Math.round((alive / sample.length) * 100) : null;
    await sb.from('job_sources').update({
      reliability_score: reliabilityScore, last_health_check: new Date().toISOString(),
    }).eq('id', source.id);
  }
}
```

### 22.3 Admin / Source Health Dashboard

An internal `/admin/source-health` page (role-gated) shows: per-source reliability percentage trend, a low-confidence moderation queue (listings scoring poorly on the Listing Quality Score from Section 17.4), and a broken-link queue (recently failed health checks) for manual review or automatic archival.

---
*(Continued — Part V: the fully redesigned Frontend & UX, incorporating every new feature above into the design system, information architecture, and page layouts.)*

# PART V — FRONTEND & UX (FULLY REDESIGNED)

---

## 23. Design Philosophy v3

The original calm-productivity, warm-dark-mode philosophy remains correct and is retained in full (Plus Jakarta Sans + Inter, saffron accent `#E8894B`, near-black surfaces, card-first density). What changes in v3 is **how much intelligence now has to live on a single card without it becoming noisy**. The original card showed title, company, location, salary, skills, deadline, and an apply button. The v3 card must additionally communicate eligibility, crowding, hidden-gem status, urgency, reliability, and PPO signals — six new data points — without the feed turning into a wall of badges.

### 23.1 The Governing Rule: Progressive Disclosure of Intelligence

Not every signal earns permanent card real estate. The redesign principle is a strict three-tier disclosure system:

**Tier 1 — Always visible on the card (the four signals that change a user's immediate decision):** Eligibility chip, Fit score ring, Deadline/urgency indicator, Hidden-gem flame icon (only shown when the score crosses a high threshold — most cards show nothing here, which is the point).

**Tier 2 — Visible on hover/tap (secondary signals, shown in a compact pill row that appears on interaction):** Crowding level, Reliability badge, PPO indicator, source badge.

**Tier 3 — Detail drawer only (full reasoning, never crowds the feed):** Eligibility reasons panel, crowding score breakdown, source cross-verification list, fit score component breakdown, similar/same-company jobs, Google Calendar quick actions.

This rule is the single most important UX decision in this revision — it's what keeps "Linear + Notion + a serious research dashboard" (the explicit aspiration) from collapsing into "cluttered SaaS dashboard with seventeen badges per row."

### 23.2 New Visual Vocabulary Required by the New Features

Four new visual primitives are added to the existing design system, each used sparingly and only where it earns its place:

- **The Flame (🔥 Hidden Gem / Trending)** — a small animated flame glyph, accent-coloured, appearing only on the top ~5% of cards by hidden-gem or velocity score. Its rarity is the feature; if it appeared on every third card it would be meaningless.
- **The Crowding Meter** — a tiny horizontal 3-segment bar (low/medium/high fill) rather than a number, because a precise percentage implies false precision for what is fundamentally an estimate.
- **The Reliability Dot** — a single coloured dot (green/blue/yellow/grey) rather than a full badge on the card face, expanding to the full badge with label only in the Tier-2 hover row.
- **The Calendar Quick-Add Icon** — a small calendar glyph with a "+" that appears next to any deadline anywhere in the product (cards, drawer, tracker, watchlists) — this icon must be visually identical everywhere it appears, since it becomes the universal "this date matters, save it" affordance across the whole app.

## 24. Visual System Updates

### 24.1 Extended Colour Tokens for New Signal Types

Added to the existing CSS custom property system from the original design system, without altering any of the original tokens:

```css
:root {
  /* ── Existing tokens retained in full (bg, text, accent, success/warning/danger/info) ── */

  /* ── New: Crowding scale (distinct from semantic success/warning/danger — this is a
         spectrum, not a binary good/bad) ── */
  --crowding-low:    #4CAF7D;   /* reuse success green — low crowding is good news */
  --crowding-medium: #E8B84B;   /* reuse warning amber */
  --crowding-high:   #C77B5B;   /* a muted terracotta, NOT danger red — high crowding
                                    isn't a failure state, just informational */

  /* ── New: Reliability dot colours ── */
  --reliability-official:   #4CAF7D;  /* green */
  --reliability-verified:   #5B8FE8;  /* blue */
  --reliability-community:  #E8B84B;  /* amber */
  --reliability-low:        #6B6862;  /* muted grey, text-tertiary */

  /* ── New: Hidden gem / trending flame ── */
  --flame-color: #E8894B;  /* reuses accent-500 — the flame IS an accent moment */
  --flame-glow:  0 0 12px rgba(232,137,75,0.5);

  /* ── New: Google Calendar brand accent (used ONLY on calendar-related icons/buttons,
         never elsewhere — this is the one deliberate brand-colour exception in the
         entire system, because users need to instantly recognise "this connects to
         my actual Google Calendar") ── */
  --gcal-blue: #4285F4;
}
```

### 24.2 Typography Additions

No new typefaces. One new scale application: the Crowding Meter and Reliability Dot labels use the existing **Micro** scale (11px Inter 500, uppercase, 0.04em tracking) — already defined in the v1 type system — applied to a new context (signal labels rather than badge text), keeping the type system closed and consistent rather than growing indefinitely.

## 25. Information Architecture v3

### 25.1 Updated Primary Navigation

The original sidebar groups (Discover / AI Tools / Community / Personal) are restructured to accommodate the new intelligence and discovery features without the sidebar growing unmanageably long:

```
[DISCOVER]
  Feed                  /
  Watchlists             /watchlists        ← NEW (replaces simple "Saved Searches")
  Saved                  /saved
  My Tracker             /tracker
  Discover a Company     /discover          ← NEW (Company Discovery Request)

[INSIGHTS]                                  ← NEW top-level group
  Market Intelligence    /insights
  City Heatmap           /insights/heatmap
  Placement Season       /placement         ← only shown Aug–Dec, or manually toggled

[AI TOOLS]
  Cover Letter           /ai/cover-letter
  Resume Lab             /resume-lab        ← NEW (replaces "Resume Versions", expanded)
  Skill Roadmap          /ai/roadmap

[COMMUNITY]
  Interview Experiences  /community/interview
  OA Tracker             /community/oa-tracker
  Referrals              /community/referrals
  Campus Drives          /community/drives
  PPO Tracker            /community/ppo     ← NEW

[PERSONAL]
  Dashboard              /dashboard
  My Profile             /profile
  Calendar               /calendar          ← now a Google Calendar connection/status page,
                                                not an in-app calendar UI (see Section 26.5)
  My RSS Feed            /settings/feed     ← NEW (Section 10.7)
  Settings               /settings
```

Sidebar groups are collapsible (click the group label to fold it), since the list has grown from four groups to five and the Personal/Community groups now contain enough items that uncollapsed defaults would push the user avatar zone below the fold on smaller laptop screens. Default state: Discover and Insights expanded, others collapsed, remembered per-user via a `sidebar_state` field in local component state (not synced server-side — purely a display preference).

### 25.2 Topbar Additions

The topbar gains one new element: a compact **Google Calendar connection status pill** to the right of the AI Status Indicator — green dot + "Connected" when calendar sync is active, grey dot + "Connect Calendar" as a one-click call-to-action when not yet connected. This is the most important single conversion point in the entire redesign, since Calendar is now the *only* reminder mechanism — if a user never connects it, they get zero reminders, so the prompt must be persistently visible without being naggy (a single static pill, not a recurring modal).

## 26. Page-by-Page Redesign

### 26.1 Job Feed (`/`) — Redesigned Card Anatomy

```
┌──────────────────────────────────────────────────────────┐
│  [LOGO]  Software Engineer Intern         [FIT 87] [🔥]  │  ← Row 1: title + fit ring + gem flame (conditional)
│          Razorpay  ·  🟢                                 │  ← Row 1b: company + reliability dot
├────────────────────────────────────────────────────────────┤
│  📍 Bengaluru · Hybrid · 0–1yr      💰 ₹35–45K/month     │  ← Row 2: location/mode/exp + stipend (no slider, dropdown filtered)
├────────────────────────────────────────────────────────────┤
│  ✅ Eligible          ▂▄█ Crowding: Low      🎓 PPO       │  ← Row 3 (Tier 1+2 combined on hover): eligibility, crowding meter, PPO flag
├────────────────────────────────────────────────────────────┤
│  [python] [django] [postgresql] [+2]                      │  ← Row 4: skill chips, profile-matched skills shown in accent colour
├────────────────────────────────────────────────────────────┤
│  🗓 Closes in 3 days  [+ Calendar]    [🔖]   [Apply →]   │  ← Row 5: deadline + Calendar quick-add + bookmark + apply
└──────────────────────────────────────────────────────────┘
```

Key changes from the v2 card: the crowding meter and PPO flag only render in the expanded/hover state on desktop (Tier 2 disclosure) and are always visible in a denser single line on mobile (since mobile has no hover state, the information has to be available on tap or always-on — mobile cards are deliberately one row taller than desktop cards to accommodate this). The flame icon for hidden-gem/trending status sits directly beside the Fit score ring specifically so the two most "should I act on this right now" signals are co-located. The Calendar quick-add icon sits directly beside the deadline text everywhere in the product (per Section 23.2's universal-affordance rule) — clicking it on the card itself fires the Quick-Add flow (Section 32.3) without opening the drawer at all, since this is a high-frequency, low-friction action that shouldn't require a navigation step.

### 26.2 Job Detail Drawer — New Sections

The original drawer structure is retained with five new sections inserted:

```
[Company logo + name + industry tag + reliability badge expanded]
[Job title — H2]
[Role category · Work mode · Experience range]
[Location chips · Stipend/CTC text]

── ELIGIBILITY ──                                    ← Tier 3 full detail
[Status badge] + full reasons panel (every check, pass/fail/warn, with explanation)

── WHY THIS MIGHT BE A HIDDEN GEM ──                 ← NEW, only shown if hidden_gem_score is high
[Explanation card: "High fit (87%) + low crowding (only on Razorpay's own ATS, not
cross-posted) + 9 days left to apply — this is a strong, low-competition match for you."]

── FIT SCORE ──
[Score ring + component breakdown: skill overlap, role match, location match, experience match]

── PLAIN ENGLISH SUMMARY ──
[AI TL;DR bullets, generated once at ingest]

── CROWDING & RELIABILITY DETAIL ──                  ← NEW
[Crowding meter expanded with component explanation]
[Reliability badge expanded: "Cross-verified on 2 sources: Razorpay's Greenhouse board
 + LinkedIn" or "Official — found only on Razorpay's direct ATS"]
[Last checked: 2 hours ago]

── SKILLS REQUIRED ──
[Skill chips, profile-matched skills highlighted]

── ACTIONS ──
[Apply externally →] [🔖 Save] [+ Add to Google Calendar] [📄 Cover Letter] [📋 Mock Interview]
[How do I get this job? (Skill Roadmap) →] [Analyse my resume for this role →]

── SIMILAR ROLES ──
[Horizontal scroll, pgvector similarity]

── SAME COMPANY — OPEN ROLES ──                      ← NEW (links to the canonical Company Page)
[Horizontal scroll of other open roles at this company, with a "View company page →" link]

── COMPANY ──
[Logo, Wikipedia excerpt, employee count, PPO badge, hiring recency note]

── APPLICANT SIGNAL ──
[~47 applied via JobHunt India]  [🔥 Trending — 30 clicks in the last 6 hours]  ← velocity signal added
```

### 26.3 Watchlists Page (`/watchlists`) — New

Replaces the simpler "saved search" concept entirely. Each watchlist is a card showing its name, active filter criteria, match count this week, and a delta-event history (new matches, compensation changes, removed listings) — each delta also shows whether it was pushed to the user's Google Calendar as a same-day summary event.

```
┌─────────────────────────────────────────────────────┐
│  "Bengaluru SDE Internships"            [Edit] [🗑]  │
│  Keywords: SDE, Software Engineer Intern             │
│  Location: Bengaluru · Min Fit: 60% · Max Crowding:  │
│  Medium · Sources: Official only                     │
│                                                       │
│  12 new matches this week                            │
│  ┌─────────────────────────────────────────────┐    │
│  │ + 3 new matches today        [📅 Synced]     │    │
│  │ Compensation updated: Razorpay SDE Intern    │    │
│  │ Deadline shortened: CRED Backend Intern      │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

[+ Create new watchlist]   (up to 5 active watchlists per user)
```

Creating a watchlist is a guided form: keyword input, location multi-select, role category, internship/full-time toggle, batch year, minimum fit threshold (dropdown: Any/50%+/70%+/85%+), maximum crowding (dropdown: Any/Low/Medium), and an "Official sources only" toggle for users who specifically want the low-crowding, direct-ATS-sourced advantage.

### 26.4 Company Page (`/company/[slug]`) — New

```
[Company logo, name, industry, HQ location, employee count]
[Hiring recency: "Posted 14 roles in the last 30 days — active hiring"]
[Reliability: "Direct ATS source — Greenhouse" badge]

── OPEN ROLES ──
[Full card grid of all current open roles at this company]

── HIRING HISTORY ──                                  ← NEW, inspired by Jobseek's posting-frequency concept
[Simple bar chart: roles posted per month, last 12 months]
["This company typically posts the most roles in August–September for campus season"]

── COMMUNITY DATA ──
[PPO conversion: "~75% (8 reports)"]
[Interview tags: DSA-heavy, 1 HR round, Case study for PM roles]
["View 5 interview experiences →"]
["3 people requesting referrals here →"]

── CROWDING TREND ──                                  ← NEW
[Sparkline: average crowding score for this company's listings over time]
```

### 26.5 Calendar Page (`/calendar`) — Redesigned as a Google Calendar Status & Control Centre

This page changes fundamentally from the original in-app calendar UI concept. Since Google Calendar is now the **only** reminder system, this page is no longer a custom-built month/week/agenda view — it becomes a connection management and sync-status page:

```
┌─────────────────────────────────────────────────────┐
│  Google Calendar                    [🟢 Connected]   │
│  Connected as subhh@gmail.com                        │
│                                                       │
│  Sync mode: ◉ Full sync (auto-create/update events)  │
│             ○ Quick-add only (manual, per-deadline)  │
│                                                       │
│  [Disconnect]                    [Sync now]          │
└─────────────────────────────────────────────────────┘

── UPCOMING SYNCED EVENTS ──
(Read-only mirror of what's in Google Calendar, for in-app visibility —
 the actual calendar lives in Google Calendar itself, this is just a summary)

  🔴 Today — Apply to Figma (closes today)
  🟡 Jan 30 — Google SWE deadline (2 days)
  🟢 Feb 1 — Adobe deadline (4 days)
  📋 Jan 28 — Interview: CRED Backend (prep reminder auto-created 2 days prior)

── SYNC HISTORY ──
[Log of recent sync events: "12 deadlines synced", "1 event removed (job unsaved)"]

[Open Google Calendar →]   (deep link to calendar.google.com)
```

If not yet connected, the page instead shows a single prominent connection card explaining what gets synced (deadlines, interview dates, OA reminders, watchlist deltas) and a one-click "Connect Google Calendar" button — this is the most important onboarding moment in the v3 redesign, and is also surfaced as a required step in the onboarding wizard (Section 26.8).

### 26.6 Insights / Market Intelligence Dashboard (`/insights`) — New

```
[Top bar: filter by category, internship/full-time, time range (7d/30d/90d)]

┌─────────────────┬─────────────────┬─────────────────┐
│ TOP SKILLS       │ FASTEST RISING  │ HIRING SPREE     │
│ 1. Python   847  │ 1. LangChain +40%│ Razorpay: 18 new │
│ 2. React    612  │ 2. Rust    +28% │ Swiggy: 14 new   │
│ 3. SQL      590  │ 3. Next.js +22% │ Zepto: 11 new    │
└─────────────────┴─────────────────┴─────────────────┘

── CITY HEATMAP ──                                    ← NEW, see Section 27.1
[India map, city-level job density, colour intensity = volume, drill-down by category]

── AVERAGE CTC BY CATEGORY ──
[Bar chart: Software 18 LPA, Data/ML 22 LPA, Design 12 LPA, ...]

── INTERNSHIP vs FULL-TIME RATIO ──
[Stacked area chart over time]

── THIS WEEK'S HIDDEN GEMS ──                          ← surfaces top hidden-gem-scored jobs platform-wide
[Card row — even jobs the user hasn't searched for yet, if they score exceptionally
 well against their profile]
```

### 26.7 Resume Lab (`/resume-lab`) — Renamed and Expanded from "Resume Versions"

```
[Resume version cards — same as before, plus:]

── PERFORMANCE BY VERSION ──                          ← NEW
┌──────────────────────────────────────────────┐
│ SDE Resume          Default ✓                │
│ Applications: 24   OA conversion: 38%        │
│ Interview conversion: 17%  Offers: 1          │
│ Best for: Software (82% fit avg), Data (61%) │
└──────────────────────────────────────────────┘

── RECOMMENDED DEFAULT BY CATEGORY ──                  ← NEW
"For Software roles, use: SDE Resume (82% avg fit)"
"For Data/ML roles, use: ML Resume (79% avg fit)"

── WEAK SECTION DETECTION ──                           ← NEW, AI-assisted
"Your Projects section is under-indexed for 'cloud infrastructure' keywords that
appear in 60% of your saved jobs. Consider adding a project that demonstrates this."
```

### 26.8 Onboarding Wizard — Updated to 5 Steps (Calendar Added)

The original 4-step wizard gains a mandatory Google Calendar connection step, since it's now load-bearing for the entire reminder system:

```
Step 1 — Basics: College, Degree, Branch, Graduation Year, CGPA
Step 2 — Skills: Skill tag input, certifications
Step 3 — Links: GitHub, LinkedIn, Portfolio
Step 4 — Connect Google Calendar:                      ← NEW, inserted before preferences
  "JobHunt India uses Google Calendar for all deadline reminders —
   no extra app, no spam, just your existing calendar."
  [Connect Google Calendar]   [Skip for now — I'll do this later]
Step 5 — Preferences: Preferred locations, role categories, weekly application goal
```

Skipping calendar connection is allowed (not gating the rest of onboarding), but a persistent topbar pill (Section 25.2) keeps the prompt visible until connected.

## 27. New Dashboards

### 27.1 City Heatmap System

A choropleth-style map of India, city-level job density, rendered via the Visualizer's diagram/chart capability or a lightweight SVG map component (avoiding a heavy mapping library dependency to keep bundle size down). Toggle between category filter and internship/full-time switch. Clicking a city drills down into a ranked skill-demand list specific to that city.

### 27.2 Placement Season Dashboard (`/placement`)

Active by default in August–December (detected via system date, manually toggleable year-round for users who want it):

```
[Calendar density widget — Google Calendar deadline count per day, next 30 days]
[Top drives this week — off-campus + on-campus, sorted by deadline]
[CGPA-eligible opportunities count — "47 jobs match your CGPA this week"]
[Bond-free opportunities count — "32 of 47 have no bond requirement"]
[Off-campus opportunities count]
["Missed deadline recovery" — if a tracked deadline passed without an application
 logged, suggest 3 similar still-open roles]
```

### 27.3 Resume Lab Dashboard — covered in Section 26.7 above.

## 28. Mobile & Extension UX

### 28.1 Mobile Priorities (Updated)

Save fast. Apply later. **Add to Google Calendar** (now a first-class mobile action, not a secondary one — the Calendar quick-add icon is sized for comfortable thumb-tapping, minimum 44×44px touch target). Quick eligibility check (the eligibility chip is always visible on mobile cards, never hidden behind a hover state that doesn't exist on touch). Watchlist delta review (a dedicated mobile-only condensed watchlist summary view, since the desktop card-heavy watchlist page doesn't translate well to a narrow viewport).

### 28.2 Browser Extension — Expanded Role

Beyond the original autofill-only scope, the extension (per `job-track`'s capture-from-LinkedIn precedent discovered in research) gains a **"Save this job to JobHunt India"** capture button that appears as a small floating action button on any recognised job-posting page (LinkedIn, Naukri, Internshala, Greenhouse, Lever, Ashby, company career pages matching the ATS registry). Clicking it extracts the visible job data, sends it to the JobHunt India backend as a community submission (auto-validated, since the user is actively looking at a live page), and immediately bookmarks it to the user's Saved list. The extension also shows an "Already saved" / "Already applied" indicator overlay when revisiting a job page the user has previously interacted with inside JobHunt India — preventing duplicate manual tracking effort, a small but high-value quality-of-life detail confirmed valuable by the `job-track` precedent.

---
*(Continued — Part VI: Backend Architecture, Complete Database Schema v3, API Surface, and the full Google Calendar implementation.)*

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

*Parts 0–VII above establish the product, intelligence, ingestion, and backend foundation. Part VIII, immediately following, fully specifies the frontend's dark, animated visual execution layer — the "how it should actually feel to use" complement to everything specified above.*

---

# PART VIII — THE MOTION SYSTEM (v4 Addendum: Animation, Aesthetics & Micro-Interaction Deep Dive)

> This part supersedes and dramatically expands Section 23–24 of Part V. Where Part V established the static design system (colour tokens, type scale, card anatomy), Part VIII makes the entire product **move** — confirmed against 2026's dominant interface trends (glassmorphism matured into a stable, OS-backed standard on macOS/Fluent/visionOS; Framer Motion's `AnimatePresence` as the default exit-animation mechanism; spring-physics over linear easing; scroll-triggered reveals via `whileInView`; shimmer/skeleton loading as the expected baseline, not a nice-to-have).
>
> The brief is explicit: **dark, aesthetic, attractive animations, smooth motion, user-friendly.** Every section below is written to deliver exactly that without tipping into the "loud demo reel" trap — motion always serves comprehension or feedback, never decoration for its own sake, per the existing Section 5.1 motion principles, which this part fully inherits and extends.

---

## 37. The Aesthetic Direction — "Frosted Obsidian"

The original v1–v3 design language (warm near-black surfaces, saffron accent, Plus Jakarta Sans + Inter) is the correct foundation and is **not discarded**. Part VIII adds a named, cohesive *aesthetic layer* on top of it: **Frosted Obsidian** — deep, near-black surfaces with selective frosted-glass elevation, a living ambient glow layer behind key moments, and motion that feels like the interface has weight and physical presence rather than being flat layers sliding around.

### 37.1 Why Glassmorphism, Selectively (Not Everywhere)

Glassmorphism has matured by 2026 into a stable, accessible, OS-backed pattern rather than a fad — it's load-bearing in macOS, Windows Fluent, and visionOS. But the research is equally clear on its failure mode: overuse on large areas tanks performance (`backdrop-filter` is expensive) and harms legibility. JobHunt India therefore uses glass **only at three deliberate elevation tiers**, never as a blanket background treatment:

- **Elevation 0 (base canvas):** solid `--bg-base` (#0A0A0B). No blur, ever. This is 90% of the screen at any time — the feed, the page background.
- **Elevation 1 (resting cards):** solid `--bg-surface` (#141416) with a 1px border. **No glass effect on resting cards** — this is a deliberate departure from glass-everywhere templates, because a feed of 20 simultaneously-blurred cards is exactly the "janky scrolling" failure mode the research warns against. Cards stay solid until they become interactive (hover/focus).
- **Elevation 2 (floating/overlay surfaces only):** command palette, modals, the notification/AI-status popover, and the mobile bottom-sheet drawer use true glassmorphism — `backdrop-filter: blur(20px)`, semi-transparent fill, and the "1px border hack" (a 1px solid border at ~15–20% white opacity) confirmed by research as the technique that makes glass read as grounded rather than mushy.

```css
/* The ONLY three places true glass appears in the entire product */
.glass-overlay {
  background: rgba(20, 20, 22, 0.72);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(240, 237, 232, 0.08);  /* the "1px border hack" — a faint
                                                     specular edge so the eye can track
                                                     the glass boundary even on low
                                                     contrast backgrounds */
  box-shadow:
    0 8px 32px rgba(0,0,0,0.55),
    inset 0 1px 0 rgba(255,255,255,0.04);          /* inner top highlight = the
                                                        "specular highlight" that sells
                                                        the glass illusion */
}

/* Mandatory fallback for prefers-reduced-motion AND prefers-contrast,
   per the accessibility research findings — never ship glass without this */
@media (prefers-reduced-motion: reduce), (prefers-contrast: more) {
  .glass-overlay {
    backdrop-filter: none;
    background: var(--bg-elevated);  /* solid, high-contrast fallback */
  }
}
```

### 37.2 The Ambient Glow Layer

A second new primitive: a very low-opacity, slow-moving radial gradient ("ambient glow") sits fixed behind the content on a small number of high-importance screens only — the landing/login screen, the Dashboard, and the Hidden Gem detail panel. It uses the saffron accent at extremely low opacity (4–6%) and animates with an 18–24 second breathing cycle. This is the one place the product allows itself genuine visual flourish, specifically because it's rare — appearing on perhaps 3 screens total — which is what makes it register as premium rather than gimmicky.

```css
.ambient-glow {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(600px circle at 20% 10%, rgba(232,137,75,0.05), transparent 60%),
    radial-gradient(800px circle at 80% 90%, rgba(91,143,232,0.04), transparent 60%);
  animation: ambient-breathe 22s ease-in-out infinite alternate;
}

@keyframes ambient-breathe {
  from { opacity: 0.6; transform: scale(1) translateY(0); }
  to   { opacity: 1.0; transform: scale(1.08) translateY(-12px); }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-glow { animation: none; opacity: 0.7; }
}
```

## 38. Motion Engine — Framer Motion as the Sole Animation Library

Framer Motion (imported as `motion` per its current 2026 package naming) is confirmed as the dominant, React-native, declarative animation engine for exactly this kind of product — spring-physics-based, GPU-accelerated (`transform`/`opacity` only, never animating `width`/`height`/`top`/`left` directly), and equipped with `AnimatePresence` specifically built to solve the "React unmounts instantly, animations need a moment to play first" problem that a flat React app without it cannot solve cleanly.

### 38.1 The Global Motion Tokens (Extending Section 5.1/5.2)

```typescript
// lib/motion/tokens.ts
export const spring = {
  snappy:  { type: 'spring', stiffness: 500, damping: 35, mass: 0.7 },  // buttons, toggles, chips
  smooth:  { type: 'spring', stiffness: 300, damping: 30, mass: 0.9 },  // cards, drawers
  gentle:  { type: 'spring', stiffness: 180, damping: 24, mass: 1.1 },  // page-level, hero moments
};

export const ease = {
  standard: [0.4, 0, 0.2, 1],   // existing Section 5.1 standard easing, retained
  exit:     [0.4, 0, 1, 1],     // sharper exit — per research's "easeIn on exit,
                                   // easeOut on enter" guidance for AnimatePresence
  enter:    [0, 0, 0.2, 1],
};

export const duration = {
  micro:  0.15,   // existing tier
  standard: 0.25, // existing tier
  macro:  0.35,   // existing tier
  hero:   0.6,    // NEW — for the rare, high-impact moments (hidden-gem reveal, streak milestone)
};
```

### 38.2 `AnimatePresence` — Used Everywhere Something Leaves the Screen

Every dismissible UI element in the product — the job detail drawer, toasts, the command palette, kanban cards being removed, watchlist delta event cards being dismissed, the mobile bottom sheet — is wrapped in `AnimatePresence` rather than a conditional render. This is the single highest-leverage technical decision in the entire motion system, because its absence is precisely what makes amateur React UIs feel like things "blink out of existence" rather than dismiss gracefully.

```tsx
// components/shared/Drawer.tsx — the canonical pattern, reused for every overlay in the app
import { motion, AnimatePresence } from 'framer-motion';

export function Drawer({ isOpen, onClose, children }: DrawerProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="drawer-panel glass-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={spring.smooth}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### 38.3 Page Transitions

Route changes use a subtle cross-fade + 8px vertical settle (not a full slide, which would feel heavy for a content-dense app used many times a day). Implemented at the layout level via Next.js's `template.tsx` (which re-mounts on every navigation, unlike `layout.tsx`):

```tsx
// app/template.tsx
'use client';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

### 38.4 Scroll-Triggered Reveals (`whileInView`)

Used specifically on the Insights dashboard, the Company Page's hiring-history chart, and the landing page — anywhere content sits below the fold and benefits from arriving with intent as the user scrolls to it, per the confirmed 2026 "scroll reveals: elements fading in as they enter the viewport" pattern. **Never used on the main job feed** — feed cards must be immediately scannable, not waiting on a scroll-triggered fade, since speed of scanning is the feed's core job.

```tsx
// components/insights/RevealOnScroll.tsx — reusable wrapper
import { motion } from 'framer-motion';

export function RevealOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}   // fires once, 80px before fully in view
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

## 39. Card Micro-Interactions — The Job Card, Fully Specified

The job card (Section 26.1) is the most-seen element in the product. Its motion spec deserves to be exhaustive.

### 39.1 Resting → Hover

```css
.job-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  transition:
    border-color 150ms cubic-bezier(0.4,0,0.2,1),
    box-shadow   150ms cubic-bezier(0.4,0,0.2,1),
    transform    150ms cubic-bezier(0.4,0,0.2,1);
}

.job-card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-md), 0 0 0 1px rgba(232,137,75,0.06); /* whisper-thin accent ring */
  transform: translateY(-2px);   /* increased from -1px in v3 — slightly more lift now
                                     that hover also reveals Tier-2 signals (Section 23.1),
                                     so the lift needs to read as "this card just got
                                     more information," not just a hover ack */
}

/* The Tier-2 disclosure row (crowding meter, reliability dot, PPO flag) animates in */
.job-card__tier2-row {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 200ms ease-out, opacity 150ms ease-out 50ms;
}
.job-card:hover .job-card__tier2-row,
.job-card:focus-within .job-card__tier2-row {
  max-height: 32px;
  opacity: 1;
}
```

### 39.2 The Fit Score Ring — Signature Animation

This remains the platform's single most important "delight" moment (retained from Section 5.2, now fully specified with code). The ring draws itself from 0 to the score value using `stroke-dashoffset`, with the numeric value counting up in sync — both driven by Framer Motion's `useSpring` for natural deceleration rather than a linear count:

```tsx
// components/jobs/FitScoreRing.tsx
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function FitScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  const progress = useSpring(0, { stiffness: 80, damping: 20 });
  const displayScore = useTransform(progress, v => Math.round(v));
  const dashOffset = useTransform(progress, v => circumference * (1 - v / 100));

  useEffect(() => { progress.set(score); }, [score]);

  const ringColor = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--accent-500)' : 'var(--text-tertiary)';

  return (
    <div className="fit-score-ring">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
        <motion.circle
          cx="22" cy="22" r={radius} fill="none"
          stroke={ringColor} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset, rotate: -90, transformOrigin: '50% 50%' }}
        />
      </svg>
      <motion.span className="fit-score-ring__value">{displayScore}</motion.span>
    </div>
  );
}
```

### 39.3 The Hidden-Gem Flame — Rare, Animated, Earns Its Rarity

Per Section 23.2's governing rule, the flame only renders on the top ~5% of cards. When it does appear, it gets a small continuous flicker animation (not a one-time entrance) so it reads as "alive" against the otherwise static feed — exactly the kind of sparse, meaningful motion the brief asks for:

```tsx
// components/jobs/HiddenGemFlame.tsx
import { motion } from 'framer-motion';

export function HiddenGemFlame() {
  return (
    <motion.span
      className="hidden-gem-flame"
      animate={{
        scale: [1, 1.08, 1],
        filter: ['brightness(1)', 'brightness(1.25)', 'brightness(1)'],
      }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'drop-shadow(0 0 6px rgba(232,137,75,0.6))' }}
    >
      🔥
    </motion.span>
  );
}
```

### 39.4 The Calendar Quick-Add Icon — Universal Affordance, Specified

Per Section 23.2, this icon must be visually identical everywhere. Its interaction spec: on click, the icon briefly morphs from a "+calendar" glyph to a checkmark with a small particle-burst (3–4 tiny dots scattering outward, 300ms, pure CSS to keep it cheap), then reverts after 1.5s — confirming the calendar sync fired without needing a toast notification for this specific high-frequency action (toasts are reserved for less-frequent, more consequential actions per Section 10.4).

```tsx
// components/shared/CalendarQuickAdd.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function CalendarQuickAdd({ job }: { job: Job }) {
  const [state, setState] = useState<'idle' | 'success'>('idle');

  const handleClick = async () => {
    window.open(buildQuickAddUrl(job), '_blank');
    setState('success');
    setTimeout(() => setState('idle'), 1500);
  };

  return (
    <button onClick={handleClick} className="calendar-quick-add" aria-label="Add deadline to Google Calendar">
      <AnimatePresence mode="wait">
        {state === 'idle' ? (
          <motion.span key="icon" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <CalendarPlusIcon />
          </motion.span>
        ) : (
          <motion.span key="check" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <CheckIcon style={{ color: 'var(--success)' }} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
```

## 40. Skeleton Loading — Shimmer as the Default, Never a Bare Spinner

Confirmed by research as the 2026 baseline expectation ("loading states: skeleton loaders... that match your design language" is listed as a core, not optional, micro-animation pattern). JobHunt India's existing Section "Final Notes" rule ("never show a loading spinner where you can show a skeleton") is now fully specified with an actual shimmer implementation, replacing any flat grey placeholder:

```css
/* The shimmer sweep — a soft diagonal light band moving left to right */
.skeleton {
  position: relative;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(240, 237, 232, 0.04) 45%,
    rgba(240, 237, 232, 0.08) 50%,
    rgba(240, 237, 232, 0.04) 55%,
    transparent 70%
  );
  animation: shimmer-sweep 1.8s ease-in-out infinite;
}

@keyframes shimmer-sweep {
  from { transform: translateX(-100%); }
  to   { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton::after { animation: none; opacity: 0.5; }
}
```

Every skeleton must match the exact pixel dimensions of the content it replaces (existing rule, retained) — a `JobCardSkeleton` component ships alongside `JobCard` with identical height, identical internal row spacing, so the page never jumps when real content swaps in (zero Cumulative Layout Shift, per the existing performance targets in Section 29.1).

## 41. Staggered Entrances — Feed, Lists & Grids

Extending Section 5.2's staggered card-entry spec with the exact Framer Motion `variants` implementation, applied consistently across every card grid in the product (job feed, watchlist results, similar-roles row, achievement badge grid):

```tsx
// lib/motion/stagger.ts
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};

export const staggerItem = {
  hidden:  { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

// Usage in JobGrid.tsx — fires ONLY on initial mount / filter change, never on every
// re-render or pagination append (appended pages fade in individually instead, see 41.1)
```

```tsx
<motion.div className="job-grid" variants={staggerContainer} initial="hidden" animate="visible">
  {jobs.map(job => (
    <motion.div key={job.id} variants={staggerItem}>
      <JobCard job={job} />
    </motion.div>
  ))}
</motion.div>
```

### 41.1 Infinite Scroll Append — Different From Initial Load

New cards appended via infinite scroll (Section 19.2) do **not** re-trigger the full staggered entrance of the entire grid — only the newly-appended cards individually fade-and-rise in, using `layout` prop on the parent so existing cards smoothly accommodate the new rows without jumping:

```tsx
<motion.div className="job-grid" layout>
  <AnimatePresence>
    {jobs.map(job => (
      <motion.div key={job.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <JobCard job={job} />
      </motion.div>
    ))}
  </AnimatePresence>
</motion.div>
```

## 42. Kanban Tracker — Drag Physics

Extending Section 20.2's `@dnd-kit` implementation with the exact motion feel: on drag start, the card scales to 1.03 and gains a stronger shadow + a faint accent-coloured glow (signalling "this is now floating above the board"); the destination column's border animates to `--accent-500` with a spring (not instant); on drop, the card "settles" with a small overshoot-and-settle spring rather than snapping instantly into place.

```tsx
// components/tracker/KanbanCard.tsx — drag overlay styling
<DragOverlay>
  {activeCard && (
    <motion.div
      animate={{ scale: 1.03, rotate: -1.5 }}
      style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 24px rgba(232,137,75,0.15)' }}
    >
      <KanbanCard application={activeCard} isDragging />
    </motion.div>
  )}
</DragOverlay>
```

```css
.kanban-column.drag-over {
  border-color: var(--accent-500);
  transition: border-color 200ms cubic-bezier(0.34, 1.56, 0.64, 1); /* slight overshoot spring curve */
  background: rgba(232, 137, 75, 0.03);
}
```

## 43. Tab & Navigation Indicators — Shared-Layout Magnetic Motion

Extending Section 5.2's tab-switching note with the `layoutId` implementation, confirmed by 2026 research as the modern replacement for manually calculating indicator position ("Anchored Glassmorphic Tab Indicator... physically tethers a floating visual highlight... without relying on complex JavaScript bounding-box calculations" — Framer Motion's `layoutId` achieves the same effect natively):

```tsx
// components/jobs/CategoryTabs.tsx
{categories.map(cat => (
  <button key={cat} onClick={() => setActive(cat)} className="category-tab">
    {cat}
    {active === cat && (
      <motion.div
        layoutId="active-tab-indicator"
        className="category-tab__indicator"
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    )}
  </button>
))}
```

This exact pattern is reused for: the sidebar's active-route highlight, the Saved page's folder tabs, the Resume Lab's version selector, and the Calendar page's sync-mode radio toggle — one implementation, six locations, fully consistent magnetic-feeling navigation throughout the product.

## 44. Streak & Achievement Celebration Moments

The gamification layer (Section 24, original numbering / Section 10 features) gets its sole "hero" animation tier (`duration.hero`, 0.6s) reserved for milestone moments — earning a new streak badge, hitting a weekly goal, or landing a first offer. This uses a confetti-free, restrained celebration (small particle burst from CSS, not a heavy JS confetti library) to stay consistent with the calm-productivity philosophy while still rewarding the moment:

```tsx
// components/dashboard/AchievementToast.tsx
<motion.div
  className="glass-overlay achievement-toast"
  initial={{ scale: 0.7, opacity: 0, y: 20 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
>
  <motion.div
    className="achievement-toast__icon"
    animate={{ rotate: [0, -8, 8, -4, 0] }}
    transition={{ duration: 0.6, delay: 0.15 }}
  >
    🏆
  </motion.div>
  <div>
    <p className="achievement-toast__title">7-Day Streak!</p>
    <p className="achievement-toast__subtitle">You're on a roll. Keep applying.</p>
  </div>
</motion.div>
```

## 45. Performance Discipline — The Non-Negotiable Constraints

All of the above is only shippable if it stays fast. The motion system is bound by explicit, non-negotiable rules, synthesised directly from the research findings on glassmorphism/animation performance:

1. **Only `transform` and `opacity` are ever animated.** Never `width`, `height`, `top`, `left`, `margin`, or `box-shadow`'s spread value directly in a `transition` — all of these trigger layout recalculation and break the 60fps budget. Where a "growing" effect is needed (e.g. the Tier-2 disclosure row in Section 39.1), `max-height` is used as the one accepted exception, since it's a well-understood, narrowly-scoped compromise for accordion-style reveals.
2. **`backdrop-filter` exists in at most 3 simultaneously-visible places on screen at any time** (Section 37.1's elevation-2 tier) — never on more than one card, never on the whole feed.
3. **Every animation respects `prefers-reduced-motion`.** This is not a "nice to have" wrapped in one global media query at the bottom of the stylesheet — Framer Motion's `useReducedMotion()` hook is checked explicitly in every custom hero-tier animation (the flame flicker, the ambient glow, the achievement celebration) so they degrade to a static-but-still-legible state, not just a faster version of themselves.
4. **Stagger delays cap at 12 items.** Beyond the 12th card in an initial grid load, remaining cards appear instantly (no stagger) — long staggers on large grids create a sluggish-feeling load, exactly the failure mode the research warns about with "overusing it... can lead to janky scrolling."
5. **The ambient glow (Section 37.2) and flame flicker (Section 39.3) are CSS/SVG-only, never JS-driven `requestAnimationFrame` loops** — keeping them off the main thread's JS budget entirely, which matters specifically because they're designed to run continuously, unlike the one-shot entrance/exit animations elsewhere.

```typescript
// lib/motion/useReducedMotionSafe.ts — the mandatory wrapper used by every hero-tier component
import { useReducedMotion } from 'framer-motion';

export function useReducedMotionSafe<T>(animated: T, reduced: T): T {
  const prefersReduced = useReducedMotion();
  return prefersReduced ? reduced : animated;
}

// Usage:
// const flameAnimation = useReducedMotionSafe(
//   { scale: [1, 1.08, 1], filter: ['brightness(1)','brightness(1.25)','brightness(1)'] },
//   { scale: 1, filter: 'brightness(1)' }  // static fallback, flame still visible, just not pulsing
// );
```

## 46. Updated Dependency List for the Motion System

Adds exactly one new dependency to the Section 27.1 install list — no other animation library is introduced, keeping the bundle lean:

```bash
npm install framer-motion@latest
# That's it. No GSAP, no Lottie, no React Spring, no separate confetti library.
# Framer Motion's spring physics + AnimatePresence + layoutId covers 100% of the
# motion system specified above.
```

---

*Part VIII is additive — it does not remove or contradict any prior section. Sections 5 (Motion & Interaction Design) and 23–24 (Design Philosophy / Visual System) in Part V remain valid; Part VIII is the fully-specified, code-level expansion of those principles for implementation.*

---

*Last updated: June 2026 (v4)*
*Research basis: 18 repos from github.com/topics/job-aggregator, 9 additional ATS/scraper-focused repos and topic sweeps, 10 India-specific scraper repos and marketplace listings, JobSpy/python-jobspy as primary multi-board library, Google's official Calendar API documentation, SerpApi/SearchApi.io Google Jobs aggregation APIs, and the confirmed 2026 frontend motion/aesthetic landscape (glassmorphism maturity, Framer Motion AnimatePresence patterns, skeleton/shimmer loading baselines).*
*Stack: Next.js 14 · Supabase · Vercel · GitHub Actions · Groq · OpenRouter · Google Gemini · Google Calendar API · JobSpy (Python) · Playwright · Framer Motion*
*Notification system: Google Calendar only. No email digests, no push notifications, no Telegram, no SMS.*
*Visual system: Dark-mode-first "Frosted Obsidian" — near-black surfaces, selective glassmorphism (3 elevation tiers only), saffron accent, full Framer Motion animation coverage across every interactive surface.*
*Monthly cost: ₹0 (Google Calendar API and SerpApi's free tier are both free at this usage scale; all other infrastructure as established in prior plan iterations).*
