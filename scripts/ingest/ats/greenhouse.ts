import { NormalizedJob } from '../types';

export async function fetchGreenhouse(boardToken: string): Promise<NormalizedJob[]> {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`);
  if (!res.ok) throw new Error(`Failed to fetch Greenhouse for ${boardToken}`);
  
  const { jobs } = await res.json();
  
  return jobs.map((j: any) => ({
    source_type: 'ats',
    source_name: 'greenhouse',
    source_url: j.absolute_url,
    external_id: String(j.id),
    company: boardToken,
    company_domain: null,
    title: j.title,
    description_raw: j.content,
    location_raw: j.location?.name ?? null,
    work_mode: 'unknown',
    employment_type: 'unknown',
    role_category: null,
    salary_raw: null,
    stipend_raw: null,
    posted_at: j.updated_at,
    deadline_raw: null,
    apply_url: j.absolute_url,
    is_early_applicant: null,
    is_ppo_mentioned: null,
    metadata_json: { departments: j.departments },
  }));
}
