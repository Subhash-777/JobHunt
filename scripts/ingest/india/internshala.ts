import * as cheerio from 'cheerio';
import { NormalizedJob } from '../types';

export async function fetchInternshala(category = 'software-development', location = ''): Promise<NormalizedJob[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (location) params.append('location', location);
  
  // The 'job_offer' param flags internships with PPO (Pre-Placement Offer)
  // But wait, the URL structure for Internshala changed recently. Usually it's /internships/keywords/
  // But we'll follow the plan's exact URL pattern: `https://internshala.com/internships/${params}`
  // Wait, let's just use `https://internshala.com/internships/work-from-home-internships/` or similar for testing if needed.
  // Actually, let's use the provided query-driven pattern:
  const url = `https://internshala.com/internships/${params.toString() ? '?' + params.toString() : ''}`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    }
  });

  if (!res.ok) {
    throw new Error(`Internshala fetch failed with status ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const jobs: NormalizedJob[] = [];

  $('.internship_meta').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.job-internship-name').text().trim() || $el.find('.profile').text().trim();
    const company = $el.find('.company-name').text().trim();
    const stipend = $el.find('.stipend').text().trim();
    
    // Find duration. It might be in the item_body with class 'duration'
    // Let's use text match or look for 'data-duration'
    const durationText = $el.text(); // full text of the card
    const loc = $el.find('.locations').text().trim();
    const link = $el.find('a.view_detail_button').attr('href') || $el.find('a').first().attr('href');
    const fullLink = link ? `https://internshala.com${link}` : '';

    const isPPO = /job offer|ppo/i.test(durationText) || /job offer/i.test($el.html() || '');
    const isEarly = /early applicant/i.test(durationText) || /be an early applicant/i.test($el.html() || '');
    const workMode = /work from home/i.test(loc) ? 'remote' : 'onsite';

    if (title && company && fullLink) {
      jobs.push({
        source_type: 'india_platform',
        source_name: 'internshala',
        source_url: fullLink,
        external_id: null,
        company,
        company_domain: null,
        title,
        description_raw: '', // Requires deeper scrape per page, not needed at index level
        location_raw: loc,
        work_mode: workMode,
        employment_type: 'internship',
        role_category: null, // Computed downstream
        salary_raw: null,
        stipend_raw: stipend,
        posted_at: new Date().toISOString(), // Fallback
        deadline_raw: null,
        apply_url: fullLink,
        is_early_applicant: isEarly,
        is_ppo_mentioned: isPPO,
        metadata_json: { duration_raw: durationText.includes('Months') ? durationText : undefined }
      });
    }
  });

  return jobs;
}
