import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TrackerClient } from './TrackerClient';

export const dynamic = 'force-dynamic';

export default async function TrackerPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login?next=/tracker');
  }

  const { data: savedJobs, error } = await supabase
    .from('saved_jobs')
    .select('*, jobs(*)')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error fetching tracker saved jobs:', error);
  }

  const validSavedJobs = (savedJobs || []).filter(sj => sj.jobs !== null);

  return <TrackerClient initialSavedJobs={validSavedJobs} />;
}
