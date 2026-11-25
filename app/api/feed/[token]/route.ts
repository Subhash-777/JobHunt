import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Uses the service role to look up profiles by RSS token (token is NOT a secret
// that grants write access — it just identifies which watchlist to expose as RSS).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token: rawToken } = await params
  // Strip .xml extension if present (profile shows URL as /feed/{token}.xml)
  const token = rawToken.replace(/\.xml$/i, '')

  if (!token || token.length < 10) {
    return new NextResponse('Invalid token', { status: 400 })
  }

  // Resolve profile by rss_feed_token (live DB column; rss_token was renamed)
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .eq('rss_feed_token', token)
    .single()

  if (profileErr || !profile) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Fetch saved jobs for this user (most recent 50)
  const { data: savedJobs, error: jobsErr } = await supabase
    .from('saved_jobs')
    .select(`
      created_at,
      stage,
      jobs (
        id,
        title,
        company,
        location,
        apply_link,
        description,
        ingested_at,
        job_type,
        source
      )
    `)
    .eq('user_id', profile.user_id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (jobsErr) {
    console.error('[RSS] Jobs fetch error:', jobsErr.message)
    return new NextResponse('Internal error', { status: 500 })
  }

  const items = (savedJobs ?? []).map(row => {
    const job = row.jobs as unknown as Record<string, string>
    if (!job) return ''

    const pub = new Date(row.created_at).toUTCString()
    const link = job.apply_link || `https://subhash-jobhunt.vercel.app/jobs/${job.id}`
    const desc = escapeXml(
      (job.description || '').substring(0, 500) + (job.description?.length > 500 ? '…' : '')
    )

    return `
    <item>
      <title>${escapeXml(`${job.title} @ ${job.company}`)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">jobhunt-${job.id}</guid>
      <pubDate>${pub}</pubDate>
      <category>${escapeXml(row.stage || 'saved')}</category>
      <description>${desc}</description>
      <jobhunt:location>${escapeXml(job.location || 'Remote')}</jobhunt:location>
      <jobhunt:type>${escapeXml(job.job_type || 'full-time')}</jobhunt:type>
      <jobhunt:source>${escapeXml(job.source || '')}</jobhunt:source>
    </item>`
  }).filter(Boolean).join('\n')

  const feedName = escapeXml(profile.full_name || 'JobHunt') + ' – Watchlist'
  const now = new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:jobhunt="https://subhash-jobhunt.vercel.app/ns/1.0">
  <channel>
    <title>${feedName}</title>
    <link>https://subhash-jobhunt.vercel.app</link>
    <description>Personalised job feed from JobHunt India</description>
    <language>en-in</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://subhash-jobhunt.vercel.app/api/feed/${token}.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://subhash-jobhunt.vercel.app/icon.png</url>
      <title>${feedName}</title>
      <link>https://subhash-jobhunt.vercel.app</link>
    </image>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
