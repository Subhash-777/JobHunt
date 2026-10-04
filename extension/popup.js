/**
 * JobHunt India – Extension Popup Script
 * Handles: auth state display, profile stats, action buttons
 */

const APP_URL      = 'https://subhash-jobhunt.vercel.app';
const SUPABASE_URL = 'https://iiyuvwfjscqptxkpxqmv.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeXV2d2Zqc2NxcHR4a3B4cW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTYwMDIsImV4cCI6MjA5ODQ5MjAwMn0.z8jjfoRtgJIl-NAH8Uk4frU0NTjnQ7p523rStVUrxJs';

// DOM refs
const statusDot    = document.getElementById('status-dot');
const statusText   = document.getElementById('status-text');
const mainContent  = document.getElementById('main-content');
const loginPrompt  = document.getElementById('login-prompt');
const profileAvatar = document.getElementById('profile-avatar');
const profileName   = document.getElementById('profile-name');
const profileEmail  = document.getElementById('profile-email');
const profileScore  = document.getElementById('profile-score');
const statSaved     = document.getElementById('stat-saved');
const statApplied   = document.getElementById('stat-applied');
const statInterviews = document.getElementById('stat-interviews');
const toast         = document.getElementById('popup-toast');

function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = type;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function fetchStats(session) {
  if (!session?.access_token || !session?.user?.id) return;
  const uid = session.user.id;

  try {
    const [savedRes, appliedRes, interviewRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/saved_jobs?user_id=eq.${uid}&select=count`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${session.access_token}`, Prefer: 'count=exact', 'Range-Unit': 'items', Range: '0-0' }
      }),
      fetch(`${SUPABASE_URL}/rest/v1/applications?user_id=eq.${uid}&status=eq.applied&select=count`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${session.access_token}`, Prefer: 'count=exact', 'Range-Unit': 'items', Range: '0-0' }
      }),
      fetch(`${SUPABASE_URL}/rest/v1/applications?user_id=eq.${uid}&status=eq.interview&select=count`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${session.access_token}`, Prefer: 'count=exact', 'Range-Unit': 'items', Range: '0-0' }
      })
    ]);

    const getCount = r => parseInt(r.headers.get('Content-Range')?.split('/')?.[1] ?? '0', 10);
    statSaved.textContent     = getCount(savedRes);
    statApplied.textContent   = getCount(appliedRes);
    statInterviews.textContent = getCount(interviewRes);
  } catch { /* silent */ }
}

async function init() {
  // Try to get session
  const { session } = await chrome.runtime.sendMessage({ type: 'GET_SESSION' });

  if (!session?.access_token) {
    // Not authenticated
    statusDot.classList.add('offline');
    statusText.innerHTML = 'Not signed in';
    mainContent.style.display = 'none';
    loginPrompt.style.display = 'block';
    return;
  }

  // Authenticated — show main UI
  mainContent.style.display = 'block';
  loginPrompt.style.display = 'none';

  const user = session.user;
  statusText.innerHTML = `Signed in as <strong>${user.email?.split('@')[0]}</strong>`;

  // Load profile
  const { profile } = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });
  if (profile) {
    profileName.textContent  = profile.full_name || user.email || 'User';
    profileEmail.textContent = user.email || '';
    profileScore.textContent = profile.profile_completeness
      ? `${profile.profile_completeness}%`
      : '—%';

    // Avatar initial
    const initials = (profile.full_name || 'U')
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    profileAvatar.textContent = initials || '👤';
  } else {
    profileName.textContent  = user.email || 'User';
    profileEmail.textContent = '';
  }

  // Load stats
  await fetchStats(session);

  // ── Action handlers ──────────────────────────────────────────────────────

  // Save current job
  document.getElementById('btn-save-job').addEventListener('click', async () => {
    const tab = await getCurrentTab();
    if (!tab?.id) { showToast('No active tab found', 'error'); return; }

    showToast('⏳ Capturing job from page…');
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Same scrape logic (inline for isolated world)
          const get = s => document.querySelector(s)?.textContent?.trim() ?? '';
          return {
            title:       get('h1') || document.title,
            company:     get('[class*="company"]') || get('[class*="org"]') || '',
            location:    get('[class*="location"]') || '',
            description: (get('[class*="description"]') || get('[class*="detail"]') || '').substring(0, 1500),
            applyLink:   window.location.href,
            source:      'extension'
          };
        }
      });

      const jobMeta = results?.[0]?.result;
      if (!jobMeta?.title) { showToast('Could not detect job on this page', 'error'); return; }

      const res = await chrome.runtime.sendMessage({ type: 'CAPTURE_JOB', job: jobMeta });
      if (res?.success) {
        showToast('✅ Job saved to tracker!');
      } else {
        showToast(res?.error === 'not_authenticated'
          ? '🔐 Session expired — re-sync'
          : `❌ ${res?.error}`, 'error');
      }
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    }
  });

  // Autofill form on current page
  document.getElementById('btn-autofill').addEventListener('click', async () => {
    const tab = await getCurrentTab();
    if (!tab?.id) { showToast('No active tab found', 'error'); return; }

    const { profile } = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });
    if (!profile) { showToast('Profile not loaded', 'error'); return; }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (p) => {
          // Re-inject content script autofill inline
          const fillInput = (el, value) => {
            if (!el || !value) return;
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (setter) setter.call(el, value);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          };
          const tryFill = (sels, val) => { for (const s of sels) { const el = document.querySelector(s); if (el) { fillInput(el, val); return; } } };
          const [first, ...rest] = (p.full_name || '').split(' ');
          tryFill(['[name="first_name"]','[name="firstname"]','[autocomplete="given-name"]','#first_name'], first);
          tryFill(['[name="last_name"]','[name="lastname"]','[autocomplete="family-name"]','#last_name'], rest.join(' '));
          tryFill(['[name="email"]','[type="email"]','#email'], p.email || '');
          tryFill(['[name="phone"]','[name="mobile"]','[type="tel"]','#phone'], p.phone || '');
          tryFill(['[name="linkedin"]','[placeholder*="LinkedIn"]'], p.linkedin_url || '');
          tryFill(['[name="github"]','[placeholder*="GitHub"]'], p.github_username ? `https://github.com/${p.github_username}` : '');
        },
        args: [profile]
      });
      showToast('✅ Autofill complete!');
    } catch (err) {
      showToast(`❌ Cannot inject into this page`, 'error');
    }
  });

  // Open tracker
  document.getElementById('btn-tracker').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_APP', url: `${APP_URL}/tracker` });
  });

  // Browse jobs
  document.getElementById('btn-jobs').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_APP', url: APP_URL });
  });

  // Sync session
  document.getElementById('btn-sync').addEventListener('click', async () => {
    showToast('⏳ Syncing session…');
    await chrome.runtime.sendMessage({ type: 'SYNC_SESSION' });
    setTimeout(() => location.reload(), 500);
  });

  // Sign out
  document.getElementById('btn-signout').addEventListener('click', async () => {
    await chrome.storage.local.remove(['session', 'profile']);
    location.reload();
  });
}

// Open app button (not-logged-in state)
document.getElementById('btn-open-app')?.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'OPEN_APP' });
});

init();
