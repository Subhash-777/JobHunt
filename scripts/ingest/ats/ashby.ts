import { NormalizedJob } from '../types';

export async function fetchAshby(orgSlug: string, daysBack = 7): Promise<NormalizedJob[]> {
  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${orgSlug}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to fetch Ashby for ${orgSlug}`);

  const { jobs } = await res.json();
  const cutoff = Date.now() - daysBack * 86400000;

  return jobs
    .filter((j: any) => new Date(j.publishedAt).getTime() >= cutoff)
    .map((j: any) => ({
      source_type: 'ats',
      source_name: 'ashby',
      source_url: j.jobUrl,
      external_id: j.id,
      company: orgSlug,
      company_domain: null,
      title: j.title,
      description_raw: j.descriptionHtml,
      location_raw: j.location,
      work_mode: j.isRemote ? 'remote' : 'onsite',
      employment_type: j.employmentType?.toLowerCase() ?? 'unknown',
      role_category: null,
      salary_raw: null,
      stipend_raw: null,
      posted_at: j.publishedAt,
      deadline_raw: null,
      apply_url: j.applyUrl,
      is_early_applicant: null,
      is_ppo_mentioned: null,
      metadata_json: { department: j.department },
    }));
}
