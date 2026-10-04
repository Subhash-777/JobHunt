# JobHunt India — Post-Launch Manual Tasks

## Immediate (before sharing the URL publicly)

- [ ] Run the v1.0 Journey Verification checklist from DEPLOYMENT_GUIDE.md manually on production.
- [ ] Apply migration `0010_rss_recruiter.sql` in Supabase SQL editor if not already applied:
      Open Supabase → SQL Editor → paste contents of `supabase/migrations/0010_rss_recruiter.sql` → Run.
- [ ] Set `NEXT_PUBLIC_ADMIN_EMAIL` in Vercel environment variables to your admin email address.
      Without this, `/admin/source-health` redirects everyone including you.
- [ ] Share the Vercel URL with 2–3 trusted Amrita final-year students to get first real user data.
      Specifically: ask them to try the eligibility chips and tell you if they show "Unknown" for
      most jobs (which would mean cgpa_cutoff data is sparse and needs the enrichment re-run).
      Run `node scripts/enrich_jobs.mjs` if eligibility chips are mostly Unknown.

## Within one week

- [ ] Post in your college WhatsApp/Telegram placement group:
      "Built a job aggregator specifically for Indian students — try it at subhash-jobhunt.vercel.app
       Feedback welcome. Features: AI fit scores, eligibility checker, Google Calendar deadlines,
       interview prep, PPO tracker, off-campus drives."
- [ ] Submit the project to:
      - Product Hunt (free listing at producthunt.com)
      - r/india (subreddit post)
      - LinkedIn post tagging Amrita Vishwa Vidyapeetham
- [ ] Register for Google Search Console (search.google.com/search-console) and submit the sitemap URL:
      `https://subhash-jobhunt.vercel.app/sitemap.xml`
- [ ] Add the project to your portfolio website with live demo link.
- [ ] Verify the ingestion GitHub Action ran at least once. Check the Actions tab on your repository.
      If the cron hasn't triggered yet, trigger it manually via "Run workflow."

## Within one month

- [ ] Chrome Web Store publication ($5 one-time fee).
      Guide: google.com/intl/en/chrome/webstore/publish/
      Load unpacked is sufficient for personal use — publish for external distribution.
- [ ] Check GitHub Actions ingestion cron — confirm it has run at least 4 times (every 6 hours).
- [ ] Monitor Supabase DB size: Project Settings → Usage. Alert threshold: 400MB.
- [ ] Check ai_usage_log to see if any provider is hitting daily quota:
      `select provider, count(*) from ai_usage_log where created_at > now() - interval '1 day' group by provider;`
      If OpenRouter (180/day) is saturating, rotate to a different free model slug.
- [ ] Seed the PPO tracker with your own placement data and ask 5–10 batchmates to add theirs.
      The tracker needs 3+ reports per company before it shows a meaningful conversion rate.

## Ongoing (monthly)

- [ ] Check OpenRouter free model availability — the free model roster changes frequently:
      ```
      curl https://openrouter.ai/api/v1/models -H "Authorization: Bearer $OPENROUTER_API_KEY" | jq '.data[] | select(.id | contains(":free")) | .id'
      ```
      If `qwen/qwen3.8-27b:free` disappears, update `lib/ai/cascade.ts` with a new free model slug.

- [ ] npm audit — update dependencies if any high/critical CVEs are found:
      `npm audit && npm audit fix`

- [ ] Review `source_health_log` for any sources with 0 jobs ingested in the past 7 days:
      ```sql
      select source_name, max(run_at) as last_run, sum(jobs_inserted) as total_inserted
      from source_health_log
      where run_at > now() - interval '7 days'
      group by source_name
      order by total_inserted asc;
      ```

- [ ] Verify Supabase is still on free tier limits (or upgrade if needed):
      - Database: 500MB limit on free tier
      - Auth: 50,000 MAU on free tier
      - Storage: 1GB on free tier

## Known non-urgent issues (monitor, fix when time permits)

- **Naukri adapter**: Currently parked due to HTTP 406 bot detection. Check quarterly if
  JobSpy adds native Naukri support. Command: `node scripts/ingest/sources/naukri.ts`
- **Hirist adapter**: Parked due to DOM obfuscation. Low priority — Naukri RSS may work.
- **Chrome Extension**: Loaded unpacked (Developer Mode). Needs Chrome Web Store publish for
  external users. One-time $5 fee.
- **OpenRouter free quota (180/day)**: Lowest of all three providers. Monitor closely once
  the app has real users. Upgrade point: switch `qwen3.8-27b:free` to a paid model when needed.
