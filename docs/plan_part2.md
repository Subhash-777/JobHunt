
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
