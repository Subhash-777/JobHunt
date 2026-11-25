import { createClient } from '@/lib/supabase/server';
import { GraduationCap } from 'lucide-react';
import { JobFeedList } from '@/components/jobs/JobFeedList';

export default async function CollegeFeedPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let profile: any = null;
  let collegeJobs: any[] = [];

  if (user) {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    profile = prof;

    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .order('posted_at', { ascending: false })
      .limit(30);

    collegeJobs = jobs || [];
  }

  const collegeName = profile?.college || 'Amrita Vishwa Vidyapeetham';

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-accent-500" />
            <span>Campus Hiring Feed</span>
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-50 text-accent-600 border border-accent-100">
            {collegeName}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Opportunities targeting students and alumni from {collegeName}.
        </p>
      </div>

      <section>
        {collegeJobs.length === 0 ? (
          <div className="py-12 text-center bg-bg-surface border border-border-subtle rounded-2xl p-6 text-xs text-text-secondary">
            Sign in and set your college in Profile to view curated campus hiring roles.
          </div>
        ) : (
          <JobFeedList jobs={collegeJobs} userProfile={profile} />
        )}
      </section>
    </div>
  );
}
