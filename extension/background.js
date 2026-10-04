/**
 * JobHunt India – Chrome Extension Background Service Worker
 * Handles: session sync, notification dispatch, cross-tab messaging
 */

const SUPABASE_URL  = 'https://iiyuvwfjscqptxkpxqmv.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeXV2d2Zqc2NxcHR4a3B4cW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTYwMDIsImV4cCI6MjA5ODQ5MjAwMn0.z8jjfoRtgJIl-NAH8Uk4frU0NTjnQ7p523rStVUrxJs';
const APP_URL       = 'https://subhash-jobhunt.vercel.app';

// ─── Session management ────────────────────────────────────────────────────────

/** Sync Supabase session from the main app tab to local storage */
async function syncSession() {
  try {
    const tabs = await chrome.tabs.query({ url: `${APP_URL}/*` });
    if (tabs.length === 0) return;

    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const key = Object.keys(localStorage).find(k => k.includes('auth-token'));
        return key ? localStorage.getItem(key) : null;
      }
    });

    const sessionStr = results?.[0]?.result;
    if (sessionStr) {
      await chrome.storage.local.set({ session: JSON.parse(sessionStr) });
      console.log('[JobHunt BG] Session synced');
    }
  } catch (err) {
    console.warn('[JobHunt BG] Session sync failed:', err.message);
  }
}

/** Get the stored session */
async function getSession() {
  const { session } = await chrome.storage.local.get('session');
  return session ?? null;
}

/** Get the stored profile */
async function getProfile() {
  const session = await getSession();
  if (!session?.access_token) return null;

  const userId = session.user?.id;
  if (!userId) return null;

  const { profile } = await chrome.storage.local.get('profile');
  // Return cached if fresh (< 10 min old)
  if (profile && Date.now() - profile._cached_at < 10 * 60 * 1000) return profile;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=*&limit=1`,
      {
        headers: {
          apikey:        SUPABASE_ANON,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await res.json();
    if (data?.[0]) {
      const p = { ...data[0], _cached_at: Date.now() };
      await chrome.storage.local.set({ profile: p });
      return p;
    }
  } catch (err) {
    console.warn('[JobHunt BG] Profile fetch failed:', err.message);
  }
  return null;
}

// ─── Job capture ───────────────────────────────────────────────────────────────

/** Save a captured job to the user_submitted_jobs table and also saved_jobs */
async function saveJobToWatchlist(jobData) {
  const session = await getSession();
  if (!session?.access_token) {
    return { error: 'not_authenticated' };
  }

  try {
    const userId = session.user?.id;
    if (!userId) return { error: 'not_authenticated' };

    // Insert into user_submitted_jobs (designed for lightweight user/extension submissions)
    const jobRes = await fetch(`${SUPABASE_URL}/rest/v1/user_submitted_jobs`, {
      method: 'POST',
      headers: {
        apikey:          SUPABASE_ANON,
        Authorization:   `Bearer ${session.access_token}`,
        'Content-Type':  'application/json',
        Prefer:          'return=representation'
      },
      body: JSON.stringify({
        user_id:     userId,
        title:       jobData.title || 'Untitled Job',
        company:     jobData.company || 'Unknown Company',
        apply_url:   jobData.applyLink || window?.location?.href || '',
        location:    jobData.location || '',
        description: jobData.description || ''
      })
    });

    const [job] = await jobRes.json();
    if (!job?.id) {
      const errText = JSON.stringify(job);
      return { error: `insert_failed: ${errText}` };
    }

    return { success: true, jobId: job.id };
  } catch (err) {
    return { error: err.message };
  }
}

// ─── Message router ────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  switch (msg.type) {
    case 'SYNC_SESSION':
      syncSession().then(() => sendResponse({ ok: true }));
      return true;

    case 'GET_SESSION':
      getSession().then(session => sendResponse({ session }));
      return true;

    case 'GET_PROFILE':
      getProfile().then(profile => sendResponse({ profile }));
      return true;

    case 'CAPTURE_JOB':
      saveJobToWatchlist(msg.job).then(result => {
        if (result.success) {
          chrome.notifications.create({
            type:    'basic',
            iconUrl: 'icons/icon48.png',
            title:   'Job Saved! ✅',
            message: `"${msg.job.title}" at ${msg.job.company} added to your JobHunt tracker.`
          });
        }
        sendResponse(result);
      });
      return true;

    case 'OPEN_APP':
      chrome.tabs.create({ url: msg.url || APP_URL });
      sendResponse({ ok: true });
      return true;
  }
});

// ─── Alarm: periodic session refresh ──────────────────────────────────────────

chrome.alarms.create('sync-session', { periodInMinutes: 10 });
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'sync-session') syncSession();
});

// Initial sync on install/update
chrome.runtime.onInstalled.addListener(() => {
  syncSession();
  console.log('[JobHunt] Extension installed/updated');
});
