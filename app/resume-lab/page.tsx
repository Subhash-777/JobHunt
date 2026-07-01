import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ResumeLabClient } from './ResumeLabClient';

export const dynamic = 'force-dynamic';

export default async function ResumeLabPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?next=/resume-lab');
  }

  // Fetch resume versions
  const { data: versions } = await supabase
    .from('resume_versions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch outcomes
  const { data: outcomes } = await supabase
    .from('resume_outcomes')
    .select('*, resume_versions!inner(version_name, user_id)')
    .eq('resume_versions.user_id', user.id);

  return (
    <ResumeLabClient 
      initialVersions={versions || []} 
      initialOutcomes={outcomes || []}
    />
  );
}
