import { createClient } from '@/lib/supabase/server';
import { Building2, GraduationCap, MapPin, Sparkles } from 'lucide-react';
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
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-accent-500" />
            <span>Campus Hiring Feed</span>
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20">
            {collegeName}
          </span>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Opportunities specifically targeting students and alumni from {collegeName}.
        </p>
      </div>

      <section>
        <JobFeedList jobs={collegeJobs} />
      </section>
    </div>
  );
}
