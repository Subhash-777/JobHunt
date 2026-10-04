import { supabaseAdmin } from '@/lib/supabase/server';
import { getFreshAccessToken } from './sync';

export async function syncWatchlistDeltaToCalendar(userId: string, watchlist: any, newMatchCount: number) {
  if (newMatchCount === 0) return;

  const accessToken = await getFreshAccessToken(userId);
  if (!accessToken) return; // not connected

  const today = new Date().toISOString().split('T')[0];
  const eventBody = {
    summary: `🔔 ${newMatchCount} new match${newMatchCount > 1 ? 'es' : ''}: "${watchlist.name}"`,
    description: `Open JobHunt India to view your watchlist: ${process.env.NEXT_PUBLIC_APP_URL}/watchlists\n\nSynced via JobHunt India.`,
    start: { date: today },
    end: { date: today }
  };

  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      }
    );

    const text = await res.text();
    if (!res.ok) {
      console.error('Failed to sync watchlist event to Google Calendar:', text);
      return;
    }

    const eventData = JSON.parse(text);
    const sb = supabaseAdmin();

    if (eventData?.id) {
      await sb.from('calendar_events_map').upsert({
        user_id: userId,
        internal_type: 'watchlist_delta',
        internal_ref_id: watchlist.id,
        google_event_id: eventData.id
      }, { onConflict: 'user_id,internal_type,internal_ref_id' });
    }

    // Mark matched events as synced
    await sb
      .from('watchlist_events')
      .update({ synced_to_calendar: true })
      .eq('watchlist_id', watchlist.id)
      .eq('event_type', 'new_match')
      .eq('synced_to_calendar', false);
      
  } catch (err) {
    console.error('Error syncing watchlist delta to calendar:', err);
  }
}
