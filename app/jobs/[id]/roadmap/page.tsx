import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RoadmapClient } from './RoadmapClient';

export const dynamic = 'force-dynamic';

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/auth/login?next=/jobs/${id}/roadmap`);
  }

  // Fetch job
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (!job) {
    redirect('/');
  }

  return <RoadmapClient job={job} />;
}
