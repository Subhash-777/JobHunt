import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CoverLetterClient } from './CoverLetterClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI Cover Letter Generator — JobHunt India',
  description: 'Generate customized, role-tailored cover letters powered by multi-provider AI cascade for Indian tech applications.',
};

export default async function CoverLetterPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?next=/ai/cover-letter');
  }

  // Fetch user's saved jobs
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
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-text-secondary">Loading cover letter generator...</div>}>
      <CoverLetterClient 
        savedJobs={savedJobs || []} 
        versions={versions || []} 
      />
    </Suspense>
  );
}
