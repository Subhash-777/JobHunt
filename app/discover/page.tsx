import { createClient } from '@/lib/supabase/server';
import DiscoverClient from './DiscoverClient';

export default async function DiscoverPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from('company_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  return <DiscoverClient initialRequests={requests || []} />;
}
