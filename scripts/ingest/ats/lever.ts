import { NormalizedJob } from '../types';

export async function fetchLever(company: string): Promise<NormalizedJob[]> {
  const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`);
  if (!res.ok) throw new Error(`Failed to fetch Lever for ${company}`);

  const jobs = await res.json();

  return jobs.map((j: any) => ({
    source_type: 'ats',
    source_name: 'lever',
    source_url: j.hostedUrl,
    external_id: j.id,
    company,
    company_domain: null,
    title: j.text,
    description_raw: j.descriptionPlain,
    location_raw: j.categories?.location ?? null,
    work_mode: /remote/i.test(j.categories?.location ?? '') ? 'remote' : 'onsite',
    employment_type: 'unknown',
    role_category: null,
    posted_at: new Date(j.createdAt).toISOString(),
    apply_url: j.applyUrl,
    salary_raw: j.salaryRange ? `${j.salaryRange.min}-${j.salaryRange.max} ${j.salaryRange.currency}` : null,
    stipend_raw: null,
    deadline_raw: null,
    is_early_applicant: null,
    is_ppo_mentioned: null,
    metadata_json: { team: j.categories?.team },
  }));
}
