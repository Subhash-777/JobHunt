import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch profile, AI usage log, and saved jobs in parallel
  const [profileRes, aiRes, savedRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('ai_usage_log').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('saved_jobs').select('*, jobs(*)').eq('user_id', user.id).order('saved_at', { ascending: false }).limit(10)
  ]);

  const profile = profileRes.data || {};
  const aiUsage = aiRes.data || [];
  const savedJobs = savedRes.data || [];

  return (
    <DashboardClient
      profile={profile}
      aiUsage={aiUsage}
      savedJobs={savedJobs}
      activityCount={savedJobs.length}
    />
  );
}
