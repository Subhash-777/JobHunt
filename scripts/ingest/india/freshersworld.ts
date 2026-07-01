import * as cheerio from 'cheerio';
import { NormalizedJob } from '../types';

export async function fetchFreshersworld(keyword = 'software engineer', location = ''): Promise<NormalizedJob[]> {
  // Freshersworld typically uses search URLs like:
  // https://www.freshersworld.com/jobs/jobsearch/software-engineer-jobs
  const formattedKeyword = keyword.toLowerCase().replace(/\s+/g, '-');
  const url = `https://www.freshersworld.com/jobs/jobsearch/${formattedKeyword}-jobs`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });

  if (!res.ok) {
    throw new Error(`Freshersworld fetch failed with status ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const jobs: NormalizedJob[] = [];

  $('.job-container').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.seo_title, .job-title-new').text().trim();
    const company = $el.find('.company-name, .latest-jobs-title').text().trim();
    const link = $el.find('a').first().attr('href');
    const loc = $el.find('.job-location').text().trim();
    const desc = $el.find('.job-desc').text().trim();
    const eligibility = $el.find('.eligibility').text().trim();
    
    if (title && company && link) {
      const fullLink = link.startsWith('http') ? link : `https://www.freshersworld.com${link}`;
      jobs.push({
        source_type: 'india_platform',
        source_name: 'freshersworld',
        source_url: fullLink,
        external_id: null,
        company,
        company_domain: null,
        title,
        description_raw: desc, 
        location_raw: loc || null,
        work_mode: loc.toLowerCase().includes('work from home') ? 'remote' : 'onsite',
        employment_type: 'full_time',
        role_category: null,
        salary_raw: null, // Usually hidden behind login on freshersworld
        stipend_raw: null,
        posted_at: new Date().toISOString(),
        deadline_raw: null,
        apply_url: fullLink,
        is_early_applicant: null,
        is_ppo_mentioned: null,
        metadata_json: {
          eligibility_raw: eligibility || undefined,
        }
      });
    }
  });

  return jobs;
}
