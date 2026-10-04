export async function fetchArbeitnow() {
  try {
    const res = await fetch('https://arbeitnow.com/api/job-board-api', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobHuntBot/1.0; +https://jobhuntindia.in)'
      }
    });

    if (!res.ok) {
      console.warn(`Arbeitnow fetch failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs = data.data || [];

    return jobs.slice(0, 50).map(j => ({
      source_type: 'board',
      source_name: 'arbeitnow',
      source_url: j.url,
      canonical_apply_url: (j.url || '').split('?')[0],
      company: j.company_name || 'Tech Company',
      title: j.title || 'Software Engineer',
      description_raw: j.description || '',
      location_raw: j.location || 'Remote',
      work_mode: j.remote ? 'remote' : 'onsite',
      employment_type: (j.job_types || []).some(t => t.toLowerCase().includes('intern')) ? 'internship' : 'full_time',
      apply_url: j.url,
      posted_at: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
      metadata_json: { tags: j.tags || [] }
    }));
  } catch (err) {
    console.error('Arbeitnow ingestion error:', err.message);
    return [];
  }
}
