import { supabaseAdmin } from '@/lib/supabase/server';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// Refresh Google OAuth token if expired
export async function getFreshAccessToken(userId: string): Promise<string | null> {
  const supabase = supabaseAdmin();
  
  // 1. Fetch calendar connection
  const { data: link, error } = await supabase
    .from('calendar_links')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !link) return null;

  // Check if token is still valid (with a 5-minute buffer)
  const isExpired = new Date(link.token_expiry).getTime() - 300000 < Date.now();
  if (!isExpired) {
    return link.access_token;
  }

  // Check if we have refresh token
  if (!link.refresh_token) {
    console.error('No refresh token available to refresh Google session.');
    return null;
  }

  // 2. Refresh token
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '',
        refresh_token: link.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to refresh Google OAuth token:', errText);
      // If the refresh token was revoked or expired, mark the account as needing reconnect
      if (errText.includes('invalid_grant')) {
        const supabaseForUpdate = supabaseAdmin();
        await supabaseForUpdate
          .from('calendar_links')
          .update({ needs_reconnect: true })
          .eq('user_id', userId);
        console.error('[calendar] invalid_grant — marked needs_reconnect for user', userId);
      }
      return null;
    }

    const tokens: GoogleTokenResponse = await res.json();
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // 3. Save new access token
    const { error: updateError } = await supabase
      .from('calendar_links')
      .update({
        access_token: tokens.access_token,
        token_expiry: tokenExpiry,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to save refreshed access token:', updateError);
    }

    return tokens.access_token;
  } catch (err) {
    console.error('Error refreshing token:', err);
    return null;
  }
}

// Sync job deadline to Google Calendar
export async function syncJobDeadline(userId: string, jobId: string): Promise<void> {
  const supabase = supabaseAdmin();

  // 1. Fetch Job details
  const { data: job, error: jobErr } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobErr || !job) {
    console.error('Job not found for calendar sync:', jobErr);
    return;
  }

  // Determine deadline date (fallback to 7 days from now if not specified, to serve as a tracker deadline)
  const deadlineVal = job.deadline || job.posted_at; 
  if (!deadlineVal) return;

  const deadlineDate = new Date(deadlineVal);
  // Ensure the date is valid
  if (isNaN(deadlineDate.getTime())) return;

  // 2. Fetch fresh access token
  const accessToken = await getFreshAccessToken(userId);
  if (!accessToken) return; // Google Calendar not connected/valid

  // 3. Check if already synced
  const { data: existingEvent } = await supabase
    .from('calendar_events_map')
    .select('*')
    .eq('user_id', userId)
    .eq('internal_ref_id', jobId)
    .eq('internal_type', 'deadline')
    .maybeSingle();

  if (existingEvent) {
    // Already synced, skip to avoid duplicates
    return;
  }

  // 4. Create calendar event in Google Calendar
  const start = deadlineDate.toISOString();
  const end = new Date(deadlineDate.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour duration

  const eventBody = {
    summary: `Deadline: Apply to ${job.title} at ${job.company}`,
    description: `Target Application Deadline for ${job.title}.\n\nApply here: ${job.apply_url || job.source_url}\n\nSynced via JobHunt India.`,
    start: { dateTime: start },
    end: { dateTime: end },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 1440 }, // 1 day before
        { method: 'email', minutes: 2880 }, // 2 days before (Section 32.4 requirement)
      ],
    },
  };

  try {
    const calendarResponse = await fetch(
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

    if (!calendarResponse.ok) {
      const errText = await calendarResponse.text();
      console.error('Google Calendar event creation failed:', errText);
      return;
    }

    const eventData = await calendarResponse.json();
    const googleEventId = eventData.id;

    // 5. Store relation map in Supabase
    const { error: insertError } = await supabase
      .from('calendar_events_map')
      .insert({
        user_id: userId,
        internal_ref_id: jobId,
        internal_type: 'deadline',
        google_event_id: googleEventId,
      });

    if (insertError) {
      console.error('Failed to map calendar event in DB:', insertError);
    }
  } catch (err) {
    console.error('Error syncing event:', err);
  }
}
