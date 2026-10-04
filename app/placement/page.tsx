import { createClient } from '@/lib/supabase/server';
import PlacementClient from './PlacementClient';

export default async function PlacementPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let profile: any = null;
  let collegeHires: any[] = [];
  let eligibleCount = 0;

  if (user) {
    const [profRes, hiresRes, jobsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('college_hires').select('*').limit(20),
      supabase.from('jobs').select('id', { count: 'exact', head: true }).gte('experience_max', 1)
    ]);
    profile = profRes.data || {};
    collegeHires = hiresRes.data || [];
    eligibleCount = jobsRes.count || 45;
  }

  return (
    <PlacementClient
      profile={profile}
      collegeHires={collegeHires}
      eligibleCount={eligibleCount}
    />
  );
}
