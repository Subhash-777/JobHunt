import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ResumeAnalyseClient } from './ResumeAnalyseClient';

export const dynamic = 'force-dynamic';

export default async function ResumeAnalysePage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?next=/ai/resume-analyse');
  }

  // Fetch saved jobs
  const { data: savedJobs } = await supabase
    .from('saved_jobs')
    .select('*, jobs(*)')
    .eq('user_id', user.id);

  // Fetch resume versions
  const { data: versions } = await supabase
    .from('resume_versions')
    .select('*')
    .eq('user_id', user.id);

  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-text-secondary">Loading analysis parameters...</div>}>
      <ResumeAnalyseClient 
        savedJobs={savedJobs || []} 
        versions={versions || []} 
      />
    </Suspense>
  );
}
