export interface NormalizedJob {
  source_type:      'ats' | 'board' | 'india_platform' | 'github_list' | 'community' | 'discovery';
  source_name:       string;          // 'greenhouse' | 'naukri' | 'internshala' | etc.
  source_url:        string;          // canonical dedup key
  external_id:       string | null;   // ATS-native job ID if available
  company:           string;
  company_domain:    string | null;
  title:             string;
  description_raw:   string;
  location_raw:      string | null;
  work_mode:         'remote' | 'hybrid' | 'onsite' | 'unknown';
  employment_type:   'internship' | 'full_time' | 'contract' | 'part_time' | 'unknown';
  role_category:     string | null;   // computed at normalisation, not adapter-level
  salary_raw:        string | null;
  stipend_raw:       string | null;
  posted_at:         string | null;
  deadline_raw:      string | null;
  apply_url:         string;
  is_early_applicant: boolean | null;  // from Internshala-style structured signal
  is_ppo_mentioned:   boolean | null;  // from Internshala's job_offer flag or regex
  metadata_json:     Record<string, unknown>;
}
