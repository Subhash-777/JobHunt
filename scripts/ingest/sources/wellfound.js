import * as cheerio from 'cheerio';

export async function fetchWellfound(role = 'software-engineer') {
  try {
    const res = await fetch(`https://wellfound.com/role/r/${role}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) {
      console.warn(`Wellfound returned status ${res.status}. Parking source per decision framework.`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const jobs = [];

    $('[data-test="StartupResult"]').slice(0, 30).each((_, el) => {
      const company = $(el).find('h2, [class*="name"]').first().text().trim();
      const title = $(el).find('[class*="title"], h3').first().text().trim() || 'Software Engineer';
      const link = $(el).find('a[href*="/jobs"]').first().attr('href');
      const location = $(el).find('[class*="location"]').first().text().trim() || 'Remote';

      if (company && link) {
        const fullUrl = link.startsWith('http') ? link : `https://wellfound.com${link}`;
        jobs.push({
          source_type: 'board',
          source_name: 'wellfound',
          source_url: fullUrl,
          canonical_apply_url: fullUrl.split('?')[0],
          company,
          title,
          description_raw: `Startup tech role at ${company}.`,
          location_raw: location,
          work_mode: location.toLowerCase().includes('remote') ? 'remote' : 'hybrid',
          employment_type: title.toLowerCase().includes('intern') ? 'internship' : 'full_time',
          apply_url: fullUrl,
          posted_at: new Date().toISOString(),
          metadata_json: { platform: 'wellfound' }
        });
      }
    });

    return jobs;
  } catch (err) {
    console.warn(`Wellfound scrape blocked or error: ${err.message}. Parking source.`);
    return [];
  }
}
