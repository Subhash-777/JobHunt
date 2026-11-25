import { JobFeedList } from '@/components/jobs/JobFeedList';
import { FeedFilters } from '@/components/jobs/FeedFilters';
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  FileCode,
  Bookmark,
  Kanban
} from 'lucide-react';

function buildFilterUrl(
  current: { [key: string]: string | string[] | undefined },
  key: string,
  val: string
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    if (typeof v === 'string' && v && v !== 'All') sp.set(k, v);
  }
  if (val && val !== 'All') {
    sp.set(key, val);
  } else {
    sp.delete(key);
  }
  const qs = sp.toString();
  return qs ? `/?${qs}` : '/';
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const activeCategory = typeof params.category === 'string' ? params.category : 'All';
  const ctcBucket = typeof params.ctc === 'string' ? params.ctc : 'All';
  const roleCategory = typeof params.role === 'string' ? params.role : 'All';
  const workMode = typeof params.work_mode === 'string' ? params.work_mode : 'All';
  const experience = typeof params.experience === 'string' ? params.experience : 'All';
  const searchQuery = typeof params.q === 'string' ? params.q : '';

  const supabase = await createClient();
  let query = supabase.from('jobs').select('*');

  if (ctcBucket !== 'All') {
    query = query.eq('ctc_bucket', ctcBucket);
  }
  if (roleCategory !== 'All') {
    query = query.eq('role_category', roleCategory);
  }
  if (workMode !== 'All') {
    query = query.eq('work_mode', workMode);
  }
  if (activeCategory !== 'All') {
    if (activeCategory === 'Internships') {
      query = query.eq('employment_type', 'internship');
    } else if (activeCategory === 'Remote') {
      query = query.eq('work_mode', 'remote');
    } else if (activeCategory === 'Software') {
      query = query.in('role_category', ['Frontend', 'Backend', 'Fullstack', 'Other']);
    } else if (activeCategory === 'Data/ML') {
      query = query.eq('role_category', 'Data');
    } else {
      query = query.eq('role_category', activeCategory);
    }
  }
  if (experience === 'freshers') {
    query = query.lte('experience_min', 0);
  } else if (experience === '0-2') {
    query = query.lte('experience_max', 2);
  } else if (experience === '2-5') {
    query = query.gte('experience_min', 2).lte('experience_max', 5);
  }
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
  }

  query = query.order('posted_at', { ascending: false }).limit(60);

  let jobs: any[] | null = null;
  let error: any = null;

  try {
    const res = await query;
    jobs = res.data;
    error = res.error;
  } catch (err: any) {
    console.error('Failed to load jobs from Supabase:', err);
    error = { message: err.message || 'Database connection offline.' };
  }

  let userProfile: any = null;
  let savedCount = 0;
  let displayJobs: any[] = jobs || [];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [profRes, savedRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('saved_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);
      userProfile = profRes.data;
      savedCount = savedRes.count ?? 0;

      if (userProfile && jobs && jobs.length > 0) {
        const { getOrComputeFitScore } = await import('@/lib/intelligence/fit-score');
        displayJobs = await Promise.all(
          jobs.map(async (job: any) => {
            const scoreObj = await getOrComputeFitScore(job, userProfile, supabase, false);
            return {
              ...job,
              fitScore: scoreObj?.score ?? 65
            };
          })
        );
      }
    }
  } catch (err) {
    console.error('Failed to retrieve user profile or fit scores:', err);
  }

  // Profile completeness calculation for Career Companion Rail
  const profileFields = [
    userProfile?.full_name,
    userProfile?.college,
    userProfile?.cgpa,
    userProfile?.graduation_year,
    userProfile?.skills?.length > 0,
    userProfile?.github_url || userProfile?.linkedin_url
  ];
  const profileStrength = userProfile
    ? Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100)
    : 0;

  return (
    <div className="w-full space-y-6">
      {/* Hero Banner & Quick Search / Categories */}
      <Suspense fallback={<div className="h-44 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />}>
        <FeedFilters totalShown={displayJobs.length} />
      </Suspense>

      {/* 3-Zone Workspace: Left Filter Sidebar | Center Feed | Right Companion Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Filter Rail (Desktop) — Discrete Pill Options, NO sliders */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-xs font-display font-bold uppercase tracking-wider text-text-primary">
              Refine Results
            </h2>
            <Link href="/" className="text-[11px] font-semibold text-accent-600 hover:underline">
              Clear all
            </Link>
          </div>

          {/* Role Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-text-primary">Role Track</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                { val: 'All', label: 'All' },
                { val: 'Frontend', label: 'Frontend' },
                { val: 'Backend', label: 'Backend' },
                { val: 'Fullstack', label: 'Fullstack' },
                { val: 'Data', label: 'Data & ML' },
                { val: 'DevOps', label: 'DevOps' },
              ].map((opt) => (
                <Link
                  key={opt.val}
                  href={buildFilterUrl(params, 'role', opt.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    roleCategory === opt.val
                      ? 'bg-accent-50 border-accent-200 text-accent-600 font-semibold'
                      : 'bg-bg-elevated/60 border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Work Mode Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-text-primary">Work Mode</h3>
            <div className="space-y-1">
              {[
                { val: 'All', label: 'Any Work Mode' },
                { val: 'remote', label: 'Remote' },
                { val: 'hybrid', label: 'Hybrid' },
                { val: 'onsite', label: 'Work From Office' },
              ].map((opt) => (
                <Link
                  key={opt.val}
                  href={buildFilterUrl(params, 'work_mode', opt.val)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    workMode === opt.val
                      ? 'bg-accent-50 text-accent-600 font-semibold'
                      : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      workMode === opt.val ? 'border-accent-500 bg-accent-500' : 'border-border-default'
                    }`}
                  >
                    {workMode === opt.val && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Experience Level Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-text-primary">Experience Level</h3>
            <div className="space-y-1">
              {[
                { val: 'All', label: 'All Levels' },
                { val: 'freshers', label: 'Freshers (0 yrs)' },
                { val: '0-2', label: '0 – 2 Years' },
                { val: '2-5', label: '2 – 5 Years' },
              ].map((opt) => (
                <Link
                  key={opt.val}
                  href={buildFilterUrl(params, 'experience', opt.val)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    experience === opt.val
                      ? 'bg-accent-50 text-accent-600 font-semibold'
                      : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      experience === opt.val ? 'border-accent-500 bg-accent-500' : 'border-border-default'
                    }`}
                  >
                    {experience === opt.val && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Discrete CTC Buckets (No Sliders) */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-text-primary">Salary Bucket (LPA)</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                { val: 'All', label: 'Any' },
                { val: '<5', label: '< ₹5L' },
                { val: '5-10', label: '₹5–10L' },
                { val: '10-20', label: '₹10–20L' },
                { val: '20+', label: '₹20L+' },
              ].map((opt) => (
                <Link
                  key={opt.val}
                  href={buildFilterUrl(params, 'ctc', opt.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    ctcBucket === opt.val
                      ? 'bg-accent-50 border-accent-200 text-accent-600 font-semibold'
                      : 'bg-bg-elevated/60 border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Center Jobs Feed */}
        <section className="lg:col-span-9 xl:col-span-6">
          {displayJobs.length === 0 ? (
            <div className="py-16 text-center bg-bg-surface border border-border-subtle rounded-2xl p-8 space-y-3 shadow-2xs">
              <Sparkles className="w-8 h-8 text-accent-500 mx-auto" />
              <h2 className="text-base font-display font-bold text-text-primary">No matching opportunities found</h2>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {error ? `Error: ${error.message}` : 'Try broadening your search query or resetting filters.'}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold transition-colors"
              >
                <span>Reset Filters</span>
              </Link>
            </div>
          ) : (
            <JobFeedList jobs={displayJobs} userProfile={userProfile} />
          )}
        </section>

        {/* Right Career Companion Rail (Desktop XL) */}
        <aside className="hidden xl:flex xl:col-span-3 flex-col gap-4 sticky top-20">
          {/* Profile Strength Card */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-display font-bold uppercase tracking-wider text-text-tertiary">
                Profile Strength
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {userProfile ? `${profileStrength}%` : 'Guest'}
              </span>
            </div>

            {userProfile ? (
              <>
                <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${profileStrength}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary">
                  {profileStrength < 100
                    ? 'Add your CGPA, skills, and GitHub to unlock accurate eligibility chips & AI match %.'
                    : 'Your profile is complete for instant AI fit matching!'}
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:text-accent-700"
                >
                  <span>Update Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <p className="text-xs text-text-secondary">
                  Sign in to unlock AI Match %, eligibility checks, and 1-click Google Calendar deadline sync.
                </p>
                <Link
                  href="/auth/login"
                  className="w-full py-2 px-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Sign In / Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Pipeline Shortcut Card */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3 shadow-2xs">
            <h2 className="text-xs font-display font-bold uppercase tracking-wider text-text-tertiary">
              Your Job Workspace
            </h2>
            <div className="space-y-2 text-xs">
              <Link
                href="/saved"
                className="flex items-center justify-between p-2.5 rounded-xl bg-bg-base hover:bg-bg-elevated transition-colors"
              >
                <span className="flex items-center gap-2 font-medium text-text-primary">
                  <Bookmark className="w-4 h-4 text-accent-500" />
                  Saved Shortlist
                </span>
                <span className="font-mono font-bold text-text-secondary">{savedCount}</span>
              </Link>
              <Link
                href="/tracker"
                className="flex items-center justify-between p-2.5 rounded-xl bg-bg-base hover:bg-bg-elevated transition-colors"
              >
                <span className="flex items-center gap-2 font-medium text-text-primary">
                  <Kanban className="w-4 h-4 text-emerald-600" />
                  Application Pipeline
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
              </Link>
              <Link
                href="/profile"
                className="flex items-center justify-between p-2.5 rounded-xl bg-bg-base hover:bg-bg-elevated transition-colors"
              >
                <span className="flex items-center gap-2 font-medium text-text-primary">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Google Calendar Alerts
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-text-tertiary" />
              </Link>
            </div>
          </div>

          {/* Free AI Resume Lab Card (Zero Paid Upsells) */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-white border border-indigo-100 space-y-2.5 shadow-2xs">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-100">
              <Sparkles className="w-3 h-3" /> 100% Free AI Tool
            </div>
            <h3 className="text-sm font-display font-bold text-text-primary">
              Boost Your ATS Score
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Check keyword gaps against Indian tech roles and benchmark anonymously in Resume Lab.
            </p>
            <Link
              href="/resume-lab"
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Open Resume Lab</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
