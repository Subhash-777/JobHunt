import { NormalizedJob } from './types';

export async function fetchGithubList(repoUrl: string, branch = 'main', filepath = 'README.md'): Promise<NormalizedJob[]> {
  // Convert https://github.com/User/Repo to https://raw.githubusercontent.com/User/Repo/main/README.md
  const rawUrl = repoUrl.replace('github.com', 'raw.githubusercontent.com') + `/${branch}/${filepath}`;
  
  const res = await fetch(rawUrl);
  if (!res.ok) throw new Error(`Failed to fetch GitHub list from ${rawUrl}`);
  
  const text = await res.text();
  const jobs: NormalizedJob[] = [];
  
  // Basic markdown table parser for standard GitHub internship lists
  // Format usually: | Company | Role | Location | Application/Link | Date Posted |
  const lines = text.split('\n');
  let inTable = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('| Company') || line.trim().startsWith('|Company')) {
      inTable = true;
      continue;
    }
    if (inTable && line.trim().startsWith('|---')) {
      continue;
    }
    if (inTable && line.trim().startsWith('|')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 5) {
        const companyStr = parts[1];
        const roleStr = parts[2];
        const locationStr = parts[3];
        const linkStr = parts[4];
        
        // Extract from markdown links [Name](url)
        const extractLink = (md: string) => {
          const match = md.match(/href="([^"]+)"/);
          if (match) return match[1];
          const mdMatch = md.match(/\[(.*?)\]\((.*?)\)/);
          return mdMatch ? mdMatch[2] : null;
        };
        
        const extractText = (md: string) => {
          const mdMatch = md.match(/\[(.*?)\]\((.*?)\)/);
          if (mdMatch) return mdMatch[1];
          return md.replace(/<[^>]*>?/gm, '').trim(); // strip html
        };

        const company = extractText(companyStr) || companyStr;
        const title = extractText(roleStr) || roleStr;
        const apply_url = extractLink(linkStr);
        
        if (company && title && apply_url && !apply_url.includes('🔒')) {
          jobs.push({
            source_type: 'github_list',
            source_name: repoUrl,
            source_url: apply_url,
            external_id: null,
            company,
            company_domain: null,
            title,
            description_raw: `Role: ${title} at ${company}. Location: ${locationStr}`,
            location_raw: locationStr,
            work_mode: locationStr.toLowerCase().includes('remote') ? 'remote' : 'unknown',
            employment_type: title.toLowerCase().includes('intern') ? 'internship' : 'full_time',
            role_category: null,
            salary_raw: null,
            stipend_raw: null,
            posted_at: new Date().toISOString(), // Use current date as we don't have historical
            deadline_raw: null,
            apply_url,
            is_early_applicant: null,
            is_ppo_mentioned: null,
            metadata_json: {},
          });
        }
      }
    } else if (inTable && line.trim() === '') {
      inTable = false; // End of table
    }
  }
  
  return jobs;
}
