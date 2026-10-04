export async function fetchJobicy() {
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=20', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobHuntBot/1.0; +https://jobhuntindia.in)'
      }
    });

    if (!res.ok) {
      console.warn(`Jobicy fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs = data.jobs || [];

    return jobs.map(j => {
      const typeStr = Array.isArray(j.jobType) ? j.jobType.join(' ') : String(j.jobType || '');
      return {
        source_type: 'board',
        source_name: 'jobicy',
        source_url: j.url || j.jobGeo,
        canonical_apply_url: (j.url || '').split('?')[0],
        company: j.companyName || 'Remote Tech Co',
        title: j.jobTitle || 'Software Engineer',
        description_raw: j.jobDescription || j.jobExcerpt || '',
        location_raw: j.jobGeo || 'Remote',
        work_mode: 'remote',
        employment_type: typeStr.toLowerCase().includes('intern') ? 'internship' : 'full_time',
        apply_url: j.url,
        posted_at: j.pubDate || new Date().toISOString(),
        metadata_json: { category: j.jobCategory }
      };
    });
  } catch (err) {
    console.error('Jobicy ingestion error:', err.message);
    return [];
  }
}
