import * as cheerio from 'cheerio';
import { NormalizedJob } from '../types';

export async function fetchHirist(keyword = 'software-engineer'): Promise<NormalizedJob[]> {
  // Try common Hirist URL patterns. e.g. https://www.hirist.tech/search/software-engineer-0.html
  // or https://www.hirist.tech/search/software-engineer-jobs.html
  // Using a broad search URL
  const url = `https://www.hirist.tech/search/${keyword}-jobs.html`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });

  if (!res.ok) {
    if (res.status === 404) {
      // 404 on hirist might just mean no results for this exact format, return empty.
      return [];
    }
    throw new Error(`Hirist fetch failed with status ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const jobs: NormalizedJob[] = [];

  $('.job-item').each((_, el) => {
    const $el = $(el);
    const title = $el.find('.title, .job-title').text().trim();
    const company = $el.find('.company, .company-name').text().trim();
    const link = $el.find('a').first().attr('href');
    const fullLink = link ? (link.startsWith('http') ? link : `https://www.hirist.tech${link}`) : '';
    const loc = $el.find('.location').text().trim();
    
    // Extract key skills based on the reference implementation reading .skill-tag
    const skills: string[] = [];
    $el.find('.skill-tag').each((_, skillEl) => {
      skills.push($(skillEl).text().trim());
    });

    const expText = $el.find('.experience').text().trim();

    if (title && company && fullLink) {
      jobs.push({
        source_type: 'india_platform',
        source_name: 'hirist',
        source_url: fullLink,
        external_id: null,
        company,
        company_domain: null,
        title,
        description_raw: '', // Requires detail page, omitted in list
        location_raw: loc || null,
        work_mode: loc.toLowerCase().includes('remote') ? 'remote' : 'unknown',
        employment_type: 'full_time',
        role_category: null,
        salary_raw: null,
        stipend_raw: null,
        posted_at: new Date().toISOString(),
        deadline_raw: null,
        apply_url: fullLink,
        is_early_applicant: null,
        is_ppo_mentioned: null,
        metadata_json: {
          skills,
          experience_range: expText || undefined,
        }
      });
    }
  });

  return jobs;
}
