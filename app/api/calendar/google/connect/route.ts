import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';

export async function GET(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'Google Calendar Client ID is not configured' }, { status: 500 });
    }

    const { origin } = new URL(request.url);
    const redirectUri = `${origin}/api/calendar/google/callback`;

    // Request calendar.events scope for creating/updating deadlines and events
    // Request userinfo.email scope to know which Google Account connected
    const scope = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email';
    
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` + // crucial to get refresh token
      `&prompt=consent`;       // forces google to send refresh token again

    return NextResponse.redirect(oauthUrl);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
