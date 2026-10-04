import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = 'https://subhash-jobhunt.vercel.app'

interface SitemapRoute {
  url: string
  changefreq: string
  priority: string
  lastmod?: string
}

export async function GET() {
  // Static routes
  const staticRoutes: SitemapRoute[] = [
    { url: '/',                     changefreq: 'hourly',  priority: '1.0' },
    { url: '/community/interview',  changefreq: 'daily',   priority: '0.8' },
    { url: '/community/oa-tracker', changefreq: 'daily',   priority: '0.8' },
    { url: '/community/referrals',  changefreq: 'daily',   priority: '0.7' },
    { url: '/community/ppo',        changefreq: 'weekly',  priority: '0.7' },
    { url: '/placement',            changefreq: 'daily',   priority: '0.7' },
    { url: '/insights',             changefreq: 'weekly',  priority: '0.6' },
    { url: '/discover',             changefreq: 'monthly', priority: '0.5' },
    { url: '/recruiter',            changefreq: 'monthly', priority: '0.6' },
  ]

  // Dynamic public profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('slug, updated_at')
    .not('slug', 'is', null)
    .limit(500)

  const profileUrls = (profiles ?? [])
    .filter(p => p.slug)
    .map(p => ({
      url:        `/u/${p.slug}`,
      changefreq: 'weekly',
      priority:   '0.5',
      lastmod:    p.updated_at?.split('T')[0]
    }))

  const allRoutes = [...staticRoutes, ...profileUrls]
  const now = new Date().toISOString().split('T')[0]

  const urlElements = allRoutes.map(r => `
  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    <lastmod>${r.lastmod ?? now}</lastmod>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlElements}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
