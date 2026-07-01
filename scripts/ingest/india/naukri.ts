import { NormalizedJob } from '../types';

// Pattern confirmed by Rockposedon/WebScraping (internal API) + pawan941394 (headers/cookies)
export async function fetchNaukri(keyword = 'software engineer', location = 'india'): Promise<NormalizedJob[]> {
  const url = `https://www.naukri.com/jobapi/v3/search?noOfResults=50&keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'appid': '109', 
      'systemid': '109',
    },
  });

  if (!res.ok) {
    throw new Error(`Naukri fetch failed with status ${res.status}`);
  }

  const data = await res.json();
  const jobs: NormalizedJob[] = [];

  for (const j of data.jobDetails || []) {
    jobs.push({
      source_type: 'india_platform',
      source_name: 'naukri',
      source_url: `https://www.naukri.com${j.jdURL}`,
      external_id: j.jobId || null,
      company: j.companyName || 'Unknown',
      company_domain: null,
      title: j.title || 'Unknown',
      description_raw: j.jobDescription || '',
      location_raw: j.placeholders?.find((p: any) => p.type === 'location')?.label || null,
      work_mode: j.tagsAndSkills?.toLowerCase().includes('remote') || j.tagsAndSkills?.toLowerCase().includes('work from home') ? 'remote' : 'onsite', // Basic inference
      employment_type: 'full_time',
      role_category: null,
      salary_raw: j.placeholders?.find((p: any) => p.type === 'salary')?.label || null,
      stipend_raw: null,
      posted_at: j.createdDate ? new Date(j.createdDate).toISOString() : new Date().toISOString(),
      deadline_raw: null,
      apply_url: `https://www.naukri.com${j.jdURL}`,
      is_early_applicant: null,
      is_ppo_mentioned: null,
      metadata_json: {
        skills: j.tagsAndSkills?.split(',') || [],
        experience_range: j.placeholders?.find((p: any) => p.type === 'experience')?.label,
        company_rating: j.ambitionBoxData?.AggregateRating,
        vacancy_count: j.vacancy,
      },
    });
  }

  return jobs;
}
