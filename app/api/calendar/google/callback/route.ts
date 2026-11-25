import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      return NextResponse.redirect(`${origin}/profile?calendar_error=${encodeURIComponent(errorParam)}`);
    }

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'OAuth credentials not configured' }, { status: 500 });
    }

    const redirectUri = `${origin}/api/calendar/google/callback`;

    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      return NextResponse.json({ error: 'Failed to exchange token', details: errBody }, { status: 500 });
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // 2. Fetch User Email from Google
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let googleEmail = '';
    if (userinfoResponse.ok) {
      const userinfo = await userinfoResponse.json();
      googleEmail = userinfo.email || '';
    }

    // Calculate absolute expiration timestamp
    const tokenExpiry = new Date(Date.now() + expires_in * 1000).toISOString();

    const payload: any = {
      user_id: user.id,
      google_email: googleEmail,
      access_token,
      token_expiry: tokenExpiry,
      needs_reconnect: false,
    };

    // Note: Google only sends the refresh_token on the first authorization.
    // If the user connects again, refresh_token might be undefined.
    if (refresh_token) {
      payload.refresh_token = refresh_token;
    }

    // 3. Upsert to calendar_links (service-role required since client SELECT/write RLS locked down)
    const admin = supabaseAdmin();
    const { error: upsertError } = await admin
      .from('calendar_links')
      .upsert(payload, { onConflict: 'user_id' });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.redirect(`${origin}/profile?calendar_status=success`);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
