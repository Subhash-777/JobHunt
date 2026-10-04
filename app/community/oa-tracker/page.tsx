import { createClient } from '@/lib/supabase/server';
import OATrackerClient from './OATrackerClient';

export const metadata = {
  title: 'OA Pattern Tracker — JobHunt India',
  description: 'Track online assessment problem patterns, platforms, and difficulty breakdown for Indian tech roles.',
};

export default async function OATrackerPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let logs: any[] = [];
  let patterns: any[] = [];

  if (user) {
    const [logRes, patRes] = await Promise.all([
      supabase.from('oa_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('oa_patterns').select('*').limit(20)
    ]);
    logs = logRes.data || [];
    patterns = patRes.data || [];
  }

  return <OATrackerClient initialLogs={logs} initialPatterns={patterns} />;
}
