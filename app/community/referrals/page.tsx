import { createClient } from '@/lib/supabase/server';
import ReferralsClient from './ReferralsClient';

export const metadata = {
  title: 'Referral Exchange — JobHunt India',
  description: 'Connect directly with tech employees offering or seeking employee referrals across top Indian companies.',
};

export default async function ReferralsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: requests } = await supabase
    .from('referral_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  let userWeeklyCount = 0;
  if (user) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('referral_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo);
    userWeeklyCount = count || 0;
  }

  return <ReferralsClient initialRequests={requests || []} userWeeklyCount={userWeeklyCount} />;
}
