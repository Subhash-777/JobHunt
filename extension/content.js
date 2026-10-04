/**
 * JobHunt India – Content Script
 * Runs on: Internshala, Unstop, Naukri, LinkedIn, Greenhouse, Lever, Ashby
 * Responsibilities:
 *   1. Auto-fill application forms with profile data
 *   2. Inject a "Save to JobHunt" floating button
 *   3. Capture job metadata from the page
 */

(function () {
  'use strict';

  const HOSTNAME = window.location.hostname;

  // ─── Detect platform ───────────────────────────────────────────────────────
  const PLATFORM = (() => {
    if (HOSTNAME.includes('internshala'))  return 'internshala';
    if (HOSTNAME.includes('unstop'))       return 'unstop';
    if (HOSTNAME.includes('naukri'))       return 'naukri';
    if (HOSTNAME.includes('linkedin'))     return 'linkedin';
    if (HOSTNAME.includes('greenhouse'))   return 'greenhouse';
    if (HOSTNAME.includes('lever'))        return 'lever';
    if (HOSTNAME.includes('ashbyhq'))      return 'ashby';
    return 'unknown';
  })();

  if (PLATFORM === 'unknown') return;

  // ─── Scrape job metadata from current page ────────────────────────────────
  function scrapeJobMeta() {
    const get = sel => document.querySelector(sel)?.textContent?.trim() ?? '';
    const meta = {
      title:     '',
      company:   '',
      location:  '',
      description: '',
      applyLink: window.location.href,
      source:    PLATFORM
    };

    switch (PLATFORM) {
      case 'internshala':
        meta.title     = get('.profile-heading') || get('h1');
        meta.company   = get('.company-name') || get('.heading_4_5');
        meta.location  = get('.location_link') || get('.location');
        meta.description = get('.internship_details') || get('.detail_view') || '';
        break;

      case 'unstop':
        meta.title     = get('h1.title') || get('[class*="title"]');
        meta.company   = get('[class*="company"]') || get('[class*="org"]');
        meta.location  = get('[class*="location"]');
        meta.description = get('[class*="description"]') || '';
        break;

      case 'naukri':
        meta.title     = get('h1.jd-header-title') || get('h1');
        meta.company   = get('.jd-header-comp-name a') || get('[class*="comp-name"]');
        meta.location  = get('.loc') || get('[class*="location"]');
        meta.description = get('#job-desc') || get('.dang-inner-html') || '';
        break;

      case 'linkedin':
        meta.title     = get('.job-details-jobs-unified-top-card__job-title h1') || get('h1');
        meta.company   = get('.job-details-jobs-unified-top-card__company-name a') || get('[class*="company"]');
        meta.location  = get('.job-details-jobs-unified-top-card__primary-description-container') || '';
        meta.description = get('.jobs-description__content') || '';
        break;

      case 'greenhouse':
        meta.title     = get('h1.app-title') || get('h1');
        meta.company   = get('.company-name') || document.title.split(' at ')?.[1] || '';
        meta.location  = get('.location') || '';
        meta.description = get('#content') || '';
        break;

      case 'lever':
        meta.title     = get('.posting-headline h2') || get('h2');
        meta.company   = window.location.hostname.split('.')[0] || '';
        meta.location  = get('.posting-categories .location') || '';
        meta.description = get('.posting-content') || '';
        break;

      case 'ashby':
        meta.title     = get('h1') || '';
        meta.company   = get('[class*="company"]') || '';
        meta.location  = get('[class*="location"]') || '';
        meta.description = get('[class*="description"]') || '';
        break;
    }

    // Truncate description to 2000 chars
    if (meta.description.length > 2000) {
      meta.description = meta.description.substring(0, 2000) + '…';
    }

    return meta;
  }

  // ─── Field fill helpers ────────────────────────────────────────────────────
  function fillInput(el, value) {
    if (!el || !value) return;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      el.value = value;
    }
  }

  function fillTextarea(el, value) {
    if (!el || !value) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      el.value = value;
    }
  }

  // ─── Autofill forms ────────────────────────────────────────────────────────
  function autofill(profile) {
    if (!profile) return;

    // Common name fields
    const nameFields = ['[name="first_name"]', '[name="firstname"]', '[placeholder*="First"]',
                        '[autocomplete="given-name"]', '#first_name', '#fname'];
    const lastNameFields = ['[name="last_name"]', '[name="lastname"]', '[placeholder*="Last"]',
                            '[autocomplete="family-name"]', '#last_name', '#lname'];
    const emailFields = ['[name="email"]', '[type="email"]', '#email', '[autocomplete="email"]'];
    const phoneFields = ['[name="phone"]', '[name="mobile"]', '[type="tel"]', '#phone',
                         '[autocomplete="tel"]', '[placeholder*="Phone"]', '[placeholder*="Mobile"]'];
    const linkedinFields = ['[name="linkedin"]', '[placeholder*="LinkedIn"]', '#linkedin_url'];
    const githubFields = ['[name="github"]', '[placeholder*="GitHub"]', '#github_url'];

    const fullName = profile.full_name || '';
    const [firstName, ...lastParts] = fullName.split(' ');
    const lastName = lastParts.join(' ');

    const tryFill = (selectors, value) => {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) { fillInput(el, value); return true; }
      }
      return false;
    };

    tryFill(nameFields,     firstName);
    tryFill(lastNameFields, lastName);
    tryFill(emailFields,    profile.email || '');
    tryFill(phoneFields,    profile.phone || '');
    tryFill(linkedinFields, profile.linkedin_url || '');
    tryFill(githubFields,   profile.github_username
      ? `https://github.com/${profile.github_username}` : '');

    // Cover letter / personal statement textarea
    const textareas = document.querySelectorAll('textarea');
    if (profile.bio && textareas.length > 0) {
      const covLetter = Array.from(textareas).find(
        t => /cover|letter|statement|introduce|about/i.test(t.name + t.placeholder + t.id)
      );
      if (covLetter) fillTextarea(covLetter, profile.bio);
    }

    showToast('✅ Autofill complete! Review before submitting.');
  }

  // ─── Toast notification ────────────────────────────────────────────────────
  function showToast(message, type = 'success') {
    const existing = document.getElementById('jh-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'jh-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 2147483647;
      background: ${type === 'success' ? '#1a1a2e' : '#3d0c02'};
      color: #fff;
      border: 1px solid ${type === 'success' ? '#FF6B35' : '#ef4444'};
      border-radius: 12px;
      padding: 12px 20px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      animation: jhSlideIn 0.3s ease;
      max-width: 320px;
    `;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes jhSlideIn {
        from { opacity: 0; transform: translateX(20px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ─── Floating action button ────────────────────────────────────────────────
  function injectFloatingButton() {
    if (document.getElementById('jh-fab')) return;

    const fab = document.createElement('div');
    fab.id = 'jh-fab';
    fab.innerHTML = `
      <div id="jh-fab-main" title="JobHunt India" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 2147483646;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF6B35, #FF8C42);
        box-shadow: 0 4px 24px rgba(255,107,53,0.5);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-size: 24px;
      " onmouseenter="this.style.transform='scale(1.1)';this.style.boxShadow='0 8px 32px rgba(255,107,53,0.7)'"
         onmouseleave="this.style.transform='scale(1)';this.style.boxShadow='0 4px 24px rgba(255,107,53,0.5)'">
        🎯
      </div>
      <div id="jh-menu" style="
        display: none;
        position: fixed;
        bottom: 84px;
        right: 20px;
        z-index: 2147483646;
        background: #1a1a2e;
        border: 1px solid rgba(255,107,53,0.3);
        border-radius: 16px;
        padding: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        min-width: 180px;
      ">
        <button id="jh-btn-save" style="
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          border-radius: 10px;
          text-align: left;
          font-size: 13px;
          font-family: Inter, sans-serif;
          display: flex;
          gap: 8px;
          align-items: center;
          transition: background 0.15s;
        " onmouseenter="this.style.background='rgba(255,107,53,0.15)'"
           onmouseleave="this.style.background='transparent'">
          📌 Save to Tracker
        </button>
        <button id="jh-btn-fill" style="
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          border-radius: 10px;
          text-align: left;
          font-size: 13px;
          font-family: Inter, sans-serif;
          display: flex;
          gap: 8px;
          align-items: center;
          transition: background 0.15s;
        " onmouseenter="this.style.background='rgba(255,107,53,0.15)'"
           onmouseleave="this.style.background='transparent'">
          ✍️ Autofill Form
        </button>
        <button id="jh-btn-open" style="
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          border-radius: 10px;
          text-align: left;
          font-size: 13px;
          font-family: Inter, sans-serif;
          display: flex;
          gap: 8px;
          align-items: center;
          transition: background 0.15s;
        " onmouseenter="this.style.background='rgba(255,107,53,0.15)'"
           onmouseleave="this.style.background='transparent'">
          🚀 Open JobHunt
        </button>
      </div>
    `;

    document.body.appendChild(fab);

    const mainBtn = document.getElementById('jh-fab-main');
    const menu    = document.getElementById('jh-menu');

    mainBtn.addEventListener('click', () => {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', e => {
      if (!fab.contains(e.target)) menu.style.display = 'none';
    });

    // Save to tracker
    document.getElementById('jh-btn-save').addEventListener('click', async () => {
      menu.style.display = 'none';
      const jobMeta = scrapeJobMeta();
      showToast('⏳ Saving job…');
      const res = await chrome.runtime.sendMessage({ type: 'CAPTURE_JOB', job: jobMeta });
      if (res?.success) {
        showToast('✅ Saved to your JobHunt tracker!');
      } else {
        showToast(res?.error === 'not_authenticated'
          ? '🔐 Please sign in to JobHunt first'
          : `❌ Failed: ${res?.error}`, 'error');
      }
    });

    // Autofill
    document.getElementById('jh-btn-fill').addEventListener('click', async () => {
      menu.style.display = 'none';
      const { profile } = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });
      if (!profile) {
        showToast('🔐 Please sign in to JobHunt first', 'error');
        return;
      }
      autofill(profile);
    });

    // Open app
    document.getElementById('jh-btn-open').addEventListener('click', () => {
      menu.style.display = 'none';
      chrome.runtime.sendMessage({ type: 'OPEN_APP' });
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  injectFloatingButton();

})();
