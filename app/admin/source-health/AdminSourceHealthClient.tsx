'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Authorization is enforced by proxy.ts middleware; no NEXT_PUBLIC_ADMIN_EMAIL needed here

interface SourceStat {
  source: string
  total_jobs: number
  last_ingested: string | null
  active_jobs: number
}

interface AIUsage {
  provider: string
  calls_today: number
  calls_week: number
  quota_daily: number
}

interface HealthLog {
  id: number
  source_name: string
  run_at: string
  jobs_fetched: number
  jobs_inserted: number
  duration_ms: number | null
  status: 'success' | 'partial' | 'error'
  error_message: string | null
}

const STATUS_COLOR: Record<string, string> = {
  success: '#22c55e',
  partial:  '#f59e0b',
  error:    '#ef4444'
}

const SOURCE_ICONS: Record<string, string> = {
  internshala:   '🎓',
  unstop:        '🏆',
  greenhouse:    '🌱',
  lever:         '🚀',
  ashby:         '⚡',
  linkedin:      '💼',
  indeed:        '🔍',
  freshersworld: '🌐',
  jobicy:        '🌍',
  arbeitnow:     '🖥️',
  wellfound:     '⚓',
}

const AI_QUOTAS: Record<string, number> = {
  groq:        14000,
  openrouter:  180,
  gemini:      900,
}

export default function AdminSourceHealthClient() {
  const supabase = createClient()
  const [authorized, setAuthorized]   = useState<boolean | null>(null)
  const [sourceStats, setSourceStats] = useState<SourceStat[]>([])
  const [aiUsage, setAiUsage]         = useState<AIUsage[]>([])
  const [healthLogs, setHealthLogs]   = useState<HealthLog[]>([])
  const [loading, setLoading]         = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    // Authorization gate is enforced by proxy.ts middleware.
    // Client-side check only verifies the user is logged in at all.
    if (!user?.email) {
      setAuthorized(false)
      return false
    }
    setAuthorized(true)
    return true
  }, [supabase])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Source stats from jobs table
      const { data: stats } = await supabase
        .from('job_sources')
        .select('name')

      const sourceNames = stats?.map(s => s.name) ?? []

      // Get per-source job counts
      const sourcePromises = sourceNames.map(async (src: string) => {
        const { count: total } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('source', src)

        const { count: active } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('source', src)
          .eq('status', 'active')

        const { data: last } = await supabase
          .from('jobs')
          .select('ingested_at')
          .eq('source', src)
          .order('ingested_at', { ascending: false })
          .limit(1)

        return {
          source:        src,
          total_jobs:    total ?? 0,
          active_jobs:   active ?? 0,
          last_ingested: last?.[0]?.ingested_at ?? null
        } as SourceStat
      })

      const resolvedStats = await Promise.all(sourcePromises)
      setSourceStats(resolvedStats.sort((a, b) => b.total_jobs - a.total_jobs))

      // AI usage — today and this week
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)

      const { data: aiLogs } = await supabase
        .from('ai_usage_log')
        .select('provider, calls, created_at')
        .gte('created_at', weekStart.toISOString())

      const aiMap: Record<string, { today: number; week: number }> = {}
      for (const log of aiLogs ?? []) {
        if (!aiMap[log.provider]) aiMap[log.provider] = { today: 0, week: 0 }
        aiMap[log.provider].week += log.calls ?? 1
        if (new Date(log.created_at) >= todayStart) {
          aiMap[log.provider].today += log.calls ?? 1
        }
      }

      const aiRows: AIUsage[] = Object.entries(aiMap).map(([provider, counts]) => ({
        provider,
        calls_today: counts.today,
        calls_week:  counts.week,
        quota_daily: AI_QUOTAS[provider] ?? 0
      }))
      setAiUsage(aiRows)

      // Recent health logs (last 30)
      const { data: logs } = await supabase
        .from('source_health_log')
        .select('*')
        .order('run_at', { ascending: false })
        .limit(30)

      setHealthLogs((logs ?? []) as HealthLog[])
      setLastRefresh(new Date())
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    checkAuth().then(ok => { if (ok) fetchData() })
  }, [checkAuth, fetchData])

  if (authorized === false) {
    return (
      <div style={styles.accessDenied}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔐</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>Access Denied</h1>
        <p style={{ color: '#64748B', marginTop: 8 }}>This page is restricted to administrators only.</p>
      </div>
    )
  }

  if (authorized === null || loading) {
    return (
      <div style={styles.accessDenied}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <p style={{ color: '#64748B' }}>Loading admin dashboard…</p>
      </div>
    )
  }

  const totalJobs   = sourceStats.reduce((s, r) => s + r.total_jobs, 0)
  const activeJobs  = sourceStats.reduce((s, r) => s + r.active_jobs, 0)
  const errorSources = healthLogs.filter(l => l.status === 'error').length

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>🛡️ Source Health Dashboard</h1>
          <p style={styles.subtitle}>
            Last refreshed: {lastRefresh.toLocaleTimeString('en-IN')}
          </p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchData} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* KPI strip */}
      <div style={styles.kpiStrip}>
        {[
          { label: 'Total Jobs',     value: totalJobs.toLocaleString(),  icon: '💼', color: '#2563EB' },
          { label: 'Active Jobs',    value: activeJobs.toLocaleString(), icon: '✅', color: '#059669' },
          { label: 'Active Sources', value: sourceStats.length,          icon: '📡', color: '#2563EB' },
          { label: 'Recent Errors',  value: errorSources,                icon: '❌', color: errorSources > 0 ? '#DC2626' : '#059669' }
        ].map(kpi => (
          <div key={kpi.label} style={styles.kpiCard}>
            <div style={{ fontSize: 28 }}>{kpi.icon}</div>
            <div style={{ ...styles.kpiValue, color: kpi.color }}>{kpi.value}</div>
            <div style={styles.kpiLabel}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Source stats table */}
      <section style={styles.section}>
        <h2 style={styles.h2}>📡 Ingestion Sources</h2>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Source', 'Total Jobs', 'Active', 'Last Run', 'Health'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sourceStats.map(row => {
                const lastRun = row.last_ingested ? new Date(row.last_ingested) : null
                const hoursAgo = lastRun
                  ? Math.floor((Date.now() - lastRun.getTime()) / 3_600_000)
                  : null
                const health = hoursAgo === null ? 'unknown'
                  : hoursAgo < 2  ? 'healthy'
                  : hoursAgo < 24 ? 'stale'
                  : 'offline'
                const healthColor = health === 'healthy' ? '#22c55e'
                  : health === 'stale' ? '#f59e0b' : '#ef4444'

                return (
                  <tr key={row.source} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{ marginRight: 8 }}>{SOURCE_ICONS[row.source] ?? '📦'}</span>
                      <strong>{row.source}</strong>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      {row.total_jobs.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#22c55e' }}>
                      {row.active_jobs.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, color: '#64748B', fontSize: 12 }}>
                      {lastRun
                        ? `${lastRun.toLocaleDateString('en-IN')} ${lastRun.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                        : '—'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        background: `${healthColor}22`,
                        color: healthColor,
                        border: `1px solid ${healthColor}44`,
                        borderRadius: 20,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        {health === 'healthy' ? '✅ Healthy' : health === 'stale' ? '⚠️ Stale' : health === 'offline' ? '❌ Offline' : '❓ Unknown'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI usage cards */}
      <section style={styles.section}>
        <h2 style={styles.h2}>🤖 AI Cascade Usage</h2>
        <div style={styles.aiGrid}>
          {['groq', 'openrouter', 'gemini'].map(provider => {
            const usage = aiUsage.find(u => u.provider === provider)
            const quota = AI_QUOTAS[provider] ?? 0
            const todayCalls = usage?.calls_today ?? 0
            const pct = quota > 0 ? Math.min(100, Math.round((todayCalls / quota) * 100)) : 0
            const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e'

            return (
              <div key={provider} style={styles.aiCard}>
                <div style={styles.aiCardHeader}>
                  <div>
                    <div style={styles.aiProvider}>{provider.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {provider === 'groq' ? 'llama-3.3-70b-versatile'
                        : provider === 'openrouter' ? 'qwen/qwen3.8-27b:free'
                        : 'gemini-2.5-flash'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: barColor }}>
                      {pct}%
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>of daily quota</div>
                  </div>
                </div>

                <div style={styles.progressTrack}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: barColor,
                    borderRadius: 4,
                    transition: 'width 0.5s ease'
                  }} />
                </div>

                <div style={styles.aiStats}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{todayCalls.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>calls today</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{quota.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>daily limit</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{(usage?.calls_week ?? 0).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>this week</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent health logs */}
      <section style={styles.section}>
        <h2 style={styles.h2}>📋 Recent Ingestion Logs</h2>
        {healthLogs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No ingestion logs yet. Run the ingest script to populate.</p>
            <code style={styles.codeBlock}>npx tsx scripts/ingest/run-all.ts</code>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Source', 'Run At', 'Fetched', 'Inserted', 'Duration', 'Status'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {healthLogs.map(log => (
                  <tr key={log.id} style={styles.tr}>
                    <td style={styles.td}>
                      {SOURCE_ICONS[log.source_name] ?? '📦'} {log.source_name}
                    </td>
                    <td style={{ ...styles.td, fontSize: 11, color: '#64748B' }}>
                      {new Date(log.run_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{log.jobs_fetched}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#22c55e' }}>{log.jobs_inserted}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontSize: 11, color: '#64748B' }}>
                      {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        background: `${STATUS_COLOR[log.status]}22`,
                        color: STATUS_COLOR[log.status],
                        border: `1px solid ${STATUS_COLOR[log.status]}44`,
                        borderRadius: 20,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 600
                      }}>
                        {log.status}
                      </span>
                      {log.error_message && (
                        <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4, maxWidth: 200 }}>
                          {log.error_message.substring(0, 80)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: '#0F172A',
    padding: '8px 0 32px',
    maxWidth: 1200,
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  h1: { fontSize: 24, fontWeight: 800, marginBottom: 4, color: '#0F172A' },
  h2: { fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#475569' },
  refreshBtn: {
    padding: '8px 18px',
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600
  },
  kpiStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14,
    marginBottom: 28
  },
  kpiCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: '18px',
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)'
  },
  kpiValue: { fontSize: 26, fontWeight: 800, margin: '6px 0 4px' },
  kpiLabel: { fontSize: 12, color: '#64748B', fontWeight: 600 },
  section: { marginBottom: 36 },
  tableWrap: {
    overflowX: 'auto',
    borderRadius: 14,
    border: '1px solid #E2E8F0',
    background: '#FFFFFF',
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0'
  },
  tr: { borderBottom: '1px solid #F1F5F9' },
  td: { padding: '12px 16px', verticalAlign: 'middle', color: '#0F172A' },
  aiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 },
  aiCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)'
  },
  aiCardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 14 },
  aiProvider: { fontSize: 14, fontWeight: 700, color: '#0F172A' },
  progressTrack: {
    height: 8,
    background: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14
  },
  aiStats: { display: 'flex', justifyContent: 'space-between' },
  accessDenied: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    color: '#0F172A',
    textAlign: 'center',
    padding: 40
  },
  emptyState: {
    padding: 36,
    textAlign: 'center',
    color: '#475569',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 14
  },
  codeBlock: {
    display: 'inline-block',
    marginTop: 12,
    padding: '8px 16px',
    background: '#EFF6FF',
    border: '1px solid #DBEAFE',
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#1D4ED8'
  }
}
