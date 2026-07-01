import { JobFeedList } from '@/components/jobs/JobFeedList';
import { FeedFilters } from '@/components/jobs/FeedFilters';
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import { SkeletonCard } from '@/components/jobs/SkeletonCard';

// Using the NormalizedJob signature from ingest, though from DB it would be the real schema type
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const ctcBucket = typeof params.ctc === 'string' ? params.ctc : 'All';
  const roleCategory = typeof params.role === 'string' ? params.role : 'All';
  const searchQuery = typeof params.q === 'string' ? params.q : '';

  const supabase = await createClient();

  let query = supabase.from('jobs').select('*');

  if (ctcBucket !== 'All') {
    query = query.eq('ctc_bucket', ctcBucket);
  }
  if (roleCategory !== 'All') {
    query = query.eq('role_category', roleCategory);
  }
  if (searchQuery) {
    // using the text search index created in schema
    query = query.textSearch('title', `'${searchQuery}'`);
  }

  // Order by posting date for now (intelligence ranking applies later)
  query = query.order('posted_at', { ascending: false }).limit(50);

  let jobs: any[] | null = null;
  let error: any = null;

  try {
    const res = await query;
    jobs = res.data;
    error = res.error;
  } catch (err: any) {
    console.error('Failed to load jobs from Supabase:', err);
    error = { message: err.message || 'Failed to connect to the database. The database may be paused.' };
  }

  // Retrieve user session and compute/fetch fit scores
  let jobsWithScores: any[] = [];
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
          jobsWithScores = await Promise.all(
            jobs.map(async (job: any) => {
              const scoreObj = await getOrComputeFitScore(job, profile, supabase, false);
              return {
                ...job,
                fitScore: scoreObj?.score ?? 50
              };
            })
          );
        }
      }
    } catch (err) {
      console.error('Failed to retrieve user profile or fit scores:', err);
    }
  }

  const displayJobs = jobsWithScores.length > 0 ? jobsWithScores : (jobs || []);

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-4 pt-10 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Job Feed</h1>
        <p className="text-gray-400">Discover handpicked opportunities matching your profile.</p>
      </header>

      <Suspense fallback={null}>
        <FeedFilters />
      </Suspense>

      <section className="flex flex-col gap-4">
        {displayJobs.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            {error ? `Error: ${error.message}` : 'No jobs found matching your criteria.'}
          </div>
        ) : (
          <JobFeedList jobs={displayJobs} />
        )}
      </section>
    </main>
  );
}
