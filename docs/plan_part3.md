
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
