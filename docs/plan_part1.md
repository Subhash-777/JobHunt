# JobHunt India — Godmode Blueprint (plan.md v3)

> The complete, research-grounded master plan for JobHunt India.
> Synthesises the original spec, the v2 free-AI spec, the master implementation plan, the India-first intelligence update, and a full competitive sweep of every GitHub job-aggregator/scraper repo discovered across three research passes.
> Calendar and reminders run on **Google Calendar only** — no Telegram, no Web Push, no third-party notification service.

---

## Table of Contents

**Part 0 — Research Ledger**
0. [Every Source Repo & API Discovered, and What We Took From Each](#part-0--research-ledger)

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
