
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
