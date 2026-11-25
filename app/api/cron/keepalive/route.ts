import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Vercel Cron keep-alive: fires daily to keep the Supabase project active
// and prevent GitHub Actions 60-day inactivity disable.
// Protected by CRON_SECRET env var (set in Vercel dashboard, never committed).
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Lightweight ping — just confirm DB is reachable
  const { error } = await supabase
    .from('jobs')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[keepalive] DB ping failed:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
