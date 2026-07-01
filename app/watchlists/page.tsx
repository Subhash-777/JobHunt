import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WatchlistClient } from './WatchlistClient';

export const dynamic = 'force-dynamic';

export default async function WatchlistsPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/auth/login?next=/watchlists');
  }

  // Fetch current watchlists
  const { data: watchlists } = await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <WatchlistClient initialWatchlists={watchlists || []} />;
}
