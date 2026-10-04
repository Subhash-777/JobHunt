import { JobFeedList } from '@/components/jobs/JobFeedList';
import { FeedFilters } from '@/components/jobs/FeedFilters';
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const ctcBucket = typeof params.ctc === 'string' ? params.ctc : 'All';
  const roleCategory = typeof params.role === 'string' ? params.role : 'All';
  const workMode = typeof params.work_mode === 'string' ? params.work_mode : 'All';
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
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
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

  // Retrieve user session and compute/fetch fit scores
  let displayJobs: any[] = jobs || [];
  if (jobs && jobs.length > 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          const { getOrComputeFitScore } = await import('@/lib/intelligence/fit-score');
          displayJobs = await Promise.all(
            jobs.map(async (job: any) => {
              const scoreObj = await getOrComputeFitScore(job, profile, supabase, false);
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
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Opportunity Feed</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20">
              Live Ingest
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Zero-cost aggregated opportunities across Indiatech, ATS feeds, and direct portals.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-text-tertiary">
          <TrendingUp className="w-4 h-4 text-accent-500" />
          <span>Showing <strong className="text-text-primary">{displayJobs.length}</strong> active roles</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Suspense fallback={<div className="h-12 bg-bg-surface rounded-xl animate-pulse" />}>
        <FeedFilters />
      </Suspense>

      {/* Jobs Grid */}
      <section>
        {displayJobs.length === 0 ? (
          <div className="py-16 text-center bg-bg-surface border border-border-subtle rounded-2xl p-8 space-y-3">
            <Sparkles className="w-8 h-8 text-accent-500 mx-auto opacity-50" />
            <h3 className="text-sm font-semibold text-text-primary">No matching opportunities found</h3>
            <p className="text-xs text-text-tertiary max-w-sm mx-auto">
              {error ? `Error: ${error.message}` : 'Try broadening your search query or resetting filters.'}
            </p>
          </div>
        ) : (
          <JobFeedList jobs={displayJobs} />
        )}
      </section>
    </div>
  );
}
