import { chromium } from 'playwright';
import { NormalizedJob } from '../types';

export async function fetchUnstop(keyword = 'software engineer', location = ''): Promise<NormalizedJob[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  
  const page = await context.newPage();
  const jobs: NormalizedJob[] = [];
  
  try {
    const formattedKeyword = encodeURIComponent(keyword);
    // Standard unstop URL pattern for searching jobs
    await page.goto(`https://unstop.com/jobs?searchTerm=${formattedKeyword}`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for the job cards to load (they usually have 'job' or similar in class names, or 'opportunity-card')
    // Let's use a more generic selector like 'div.listing-card', 'a' with '/job/' or just sleep briefly
    await page.waitForTimeout(3000); 

    const jobElements = page.locator('a[href*="/jobs/"], a[href*="/job-"], a.listing-card, div.listing-card a');
    const count = await jobElements.count();
    
    // Extract info
    for (let i = 0; i < Math.min(count, 20); i++) {
      const el = jobElements.nth(i);
      const link = await el.getAttribute('href').catch(() => null);
      const title = await el.locator('h2, .title, .card-title').first().textContent().catch(() => null);
      const company = await el.locator('.company-name, .org-name, h3').first().textContent().catch(() => null);
      const loc = await el.locator('.location, .place').first().textContent().catch(() => null);
      const stipend = await el.locator('.stipend, .salary').first().textContent().catch(() => null);
      
      if (title && company && link) {
        const fullLink = link.startsWith('http') ? link : `https://unstop.com${link}`;
        jobs.push({
          source_type: 'india_platform',
          source_name: 'unstop',
          source_url: fullLink,
          external_id: null,
          company: company.trim(),
          company_domain: null,
          title: title.trim(),
          description_raw: '', // Deferred to detail view
          location_raw: loc ? loc.trim() : null,
          work_mode: loc && loc.toLowerCase().includes('remote') ? 'remote' : 'onsite',
          employment_type: 'full_time',
          role_category: null,
          salary_raw: stipend ? stipend.trim() : null,
          stipend_raw: null,
          posted_at: new Date().toISOString(),
          deadline_raw: null,
          apply_url: fullLink,
          is_early_applicant: null,
          is_ppo_mentioned: null,
          metadata_json: {}
        });
      }
    }
  } catch (error) {
    console.error('Unstop Playwright error:', error);
  } finally {
    await browser.close();
  }

  // Deduplicate by URL since querySelectors might overlap
  const uniqueJobs = Array.from(new Map(jobs.map(j => [j.source_url, j])).values());
  return uniqueJobs;
}
