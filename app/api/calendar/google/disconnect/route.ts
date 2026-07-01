import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = supabaseAdmin();

    // 1. Fetch access token to revoke it
    const { data: link } = await admin
      .from('calendar_links')
      .select('access_token')
      .eq('user_id', user.id)
      .maybeSingle();

    if (link?.access_token) {
      // Revoke the token with Google
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(link.access_token)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
      } catch (err) {
        console.error('Failed to revoke Google OAuth token:', err);
      }
    }

    // 2. Delete calendar link and mapped events
    await admin.from('calendar_links').delete().eq('user_id', user.id);
    await admin.from('calendar_events_map').delete().eq('user_id', user.id);

    return NextResponse.json({ disconnected: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
