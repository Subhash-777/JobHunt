import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SavedJobsClient } from './SavedJobsClient';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login?next=/saved');
  }

  const { data: savedJobs, error } = await supabase
    .from('saved_jobs')
    .select('*, jobs(*)')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved jobs:', error);
  }

  // Filter out any entries where the referenced job might be missing/deleted
  const validSavedJobs = (savedJobs || []).filter(sj => sj.jobs !== null);

  return <SavedJobsClient initialSavedJobs={validSavedJobs} />;
}
