import { exec } from 'child_process';
import { promisify } from 'util';
import { NormalizedJob } from './types';
import path from 'path';

const execAsync = promisify(exec);

export async function runJobSpy(searchTerm: string): Promise<NormalizedJob[]> {
  const runnerPath = path.join(__dirname, 'jobspy_runner.py');
  
  try {
    const pythonPath = path.resolve(process.cwd(), 'venv/bin/python');
    const { stdout } = await execAsync(`${pythonPath} ${runnerPath} "${searchTerm}"`);
    const jobs = JSON.parse(stdout);
    
    return jobs.map((j: any) => ({
      source_type: 'board',
      source_name: j.site?.toLowerCase() ?? 'unknown',
      source_url: j.job_url,
      external_id: String(j.id ?? ''),
      company: j.company,
      company_domain: null,
      title: j.title,
      description_raw: j.description,
      location_raw: j.location,
      work_mode: j.is_remote ? 'remote' : 'unknown',
      employment_type: j.job_type?.toLowerCase() ?? 'unknown',
      role_category: null,
      salary_raw: j.min_amount && j.max_amount ? `${j.min_amount}-${j.max_amount} ${j.currency}` : null,
      stipend_raw: null,
      posted_at: j.date_posted,
      deadline_raw: null,
      apply_url: j.job_url,
      is_early_applicant: null,
      is_ppo_mentioned: null,
      metadata_json: {
        skills: j.skills,
        experience_range: j.experience_range,
        company_rating: j.company_rating,
        company_reviews_count: j.company_reviews_count,
        vacancy_count: j.vacancy_count,
        work_from_home_type: j.work_from_home_type
      },
    }));
  } catch (error) {
    console.error('JobSpy runner failed:', error);
    return [];
  }
}
