import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch percentile stats for a job or role_tag
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jobId   = searchParams.get('job_id')
  const roleTag = searchParams.get('role_tag')
  const atsScore = parseInt(searchParams.get('ats_score') ?? '0', 10)

  if (!jobId && !roleTag) {
    return NextResponse.json({ error: 'job_id or role_tag required' }, { status: 400 })
  }

  let query = supabase
    .from('resume_benchmarks')
    .select('ats_score, got_interview, got_offer')

  if (jobId) query = query.eq('job_id', jobId)
  else       query = query.eq('role_tag', roleTag)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const scores  = (data ?? []).map(r => r.ats_score).filter(Boolean).sort((a, b) => a - b)
  const count   = scores.length

  if (count === 0) {
    return NextResponse.json({ count: 0, percentile: null, avg_score: null, interview_rate: null })
  }

  // Calculate percentile rank of atsScore
  const below   = scores.filter(s => s < atsScore).length
  const percentile = Math.round((below / count) * 100)
  const avg_score  = Math.round(scores.reduce((s, v) => s + v, 0) / count)
  const interviews = (data ?? []).filter(r => r.got_interview).length
  const interview_rate = Math.round((interviews / count) * 100)
  const offer_rate     = Math.round(((data ?? []).filter(r => r.got_offer).length / count) * 100)

  // Distribution buckets (0-20, 20-40, 40-60, 60-80, 80-100)
  const buckets = [0, 20, 40, 60, 80, 100]
  const distribution = buckets.slice(0, -1).map((lo, i) => ({
    range: `${lo}-${buckets[i + 1]}`,
    count: scores.filter(s => s >= lo && s < buckets[i + 1]).length
  }))

  return NextResponse.json({
    count,
    percentile,
    avg_score,
    interview_rate,
    offer_rate,
    distribution
  })
}

// POST — submit an anonymous benchmark data point
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { job_id, role_tag, ats_score, got_interview, got_offer, yoe_bucket } = body

  if (typeof ats_score !== 'number' || ats_score < 0 || ats_score > 100) {
    return NextResponse.json({ error: 'ats_score must be 0-100' }, { status: 422 })
  }

  const { error } = await supabase.from('resume_benchmarks').insert({
    job_id:       job_id   || null,
    role_tag:     role_tag || null,
    ats_score,
    got_interview: got_interview ?? null,
    got_offer:     got_offer     ?? null,
    yoe_bucket:    yoe_bucket    || null
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
