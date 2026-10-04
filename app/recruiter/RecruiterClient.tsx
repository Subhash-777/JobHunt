'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Recruiter {
  id: string
  full_name: string
  company_name: string
  company_domain: string
  designation: string
  verified: boolean
}

interface RecruiterJob {
  id: string
  title: string
  location: string
  job_type: string
  skills: string[]
  cgpa_cutoff: number | null
  apply_link: string
  is_active: boolean
  created_at: string
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0a0a12',
    color: '#e8e6e3',
    fontFamily: "'Inter', sans-serif"
  },
  hero: {
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0f00 100%)',
    borderBottom: '1px solid rgba(255,107,53,0.15)',
    padding: '60px 24px',
    textAlign: 'center'
  },
  heroTitle: { fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, marginBottom: 16 },
  heroSub: { fontSize: 16, color: '#9a9896', maxWidth: 520, margin: '0 auto 32px' },
  heroChips: { display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  chip: {
    background: 'rgba(255,107,53,0.1)',
    border: '1px solid rgba(255,107,53,0.25)',
    borderRadius: 20,
    padding: '6px 16px',
    fontSize: 13,
    color: '#FF8C42'
  },
  container: { maxWidth: 960, margin: '0 auto', padding: '40px 24px' },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 20,
    padding: 32,
    marginBottom: 24
  },
  h2: { fontSize: 20, fontWeight: 700, marginBottom: 24 },
  h3: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 600, color: '#9a9896', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#e8e6e3',
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 28px',
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%'
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.06)',
    color: '#e8e6e3',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 20px',
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer'
  },
  verifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#22c55e',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600
  },
  pendingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(245,158,11,0.12)',
    border: '1px solid rgba(245,158,11,0.3)',
    color: '#f59e0b',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600
  },
  jobCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '18px 20px',
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16
  },
  skillChip: {
    background: 'rgba(59,130,246,0.12)',
    border: '1px solid rgba(59,130,246,0.25)',
    color: '#60a5fa',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 500
  },
  toast: {
    position: 'fixed' as const,
    bottom: 24,
    right: 24,
    padding: '14px 20px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    zIndex: 9999,
    maxWidth: 320
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function RecruiterClient() {
  const supabase = createClient()
  const [user, setUser]           = useState<Record<string, string> | null>(null)
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null)
  const [jobs, setJobs]           = useState<RecruiterJob[]>([])
  const [tab, setTab]             = useState<'signup' | 'dashboard' | 'post'>('signup')
  const [loading, setLoading]     = useState(true)
  const [toastMsg, setToastMsg]   = useState<{ text: string; type: 'ok' | 'err' } | null>(null)

  // Form state
  const [signupForm, setSignupForm] = useState({
    full_name: '', company_name: '', company_domain: '', designation: ''
  })
  const [jobForm, setJobForm] = useState({
    title: '', location: '', job_type: 'full-time',
    skills: '', cgpa_cutoff: '', apply_link: '', description: ''
  })

  const showToast = (text: string, type: 'ok' | 'err' = 'ok') => {
    setToastMsg({ text, type })
    setTimeout(() => setToastMsg(null), 3500)
  }

  const fetchRecruiterData = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('recruiters')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) {
      setRecruiter(data as Recruiter)
      setTab('dashboard')

      const { data: jobsData } = await supabase
        .from('recruiter_jobs')
        .select('*')
        .eq('recruiter_id', data.id)
        .order('created_at', { ascending: false })

      setJobs((jobsData ?? []) as RecruiterJob[])
    }
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        setUser({ id: u.id, email: u.email ?? '' })
        await fetchRecruiterData(u.id)
      }
      setLoading(false)
    }
    init()
  }, [supabase, fetchRecruiterData])

  // ── Signup handler ─────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!user?.id) { showToast('Please sign in first', 'err'); return }
    if (!signupForm.full_name || !signupForm.company_name) {
      showToast('Full name and company name are required', 'err'); return
    }

    const { data, error } = await supabase
      .from('recruiters')
      .insert({
        user_id:        user.id,
        full_name:      signupForm.full_name,
        company_name:   signupForm.company_name,
        company_domain: signupForm.company_domain || null,
        designation:    signupForm.designation || null,
        verified:       false
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        showToast('You already have a recruiter account', 'err')
        await fetchRecruiterData(user.id)
      } else {
        showToast(`Error: ${error.message}`, 'err')
      }
      return
    }

    setRecruiter(data as Recruiter)
    setTab('dashboard')
    showToast('🎉 Recruiter account created! Verification pending.')
  }

  // ── Post job handler ───────────────────────────────────────────────────────
  const handlePostJob = async () => {
    if (!recruiter?.id) return
    if (!jobForm.title || !jobForm.apply_link) {
      showToast('Job title and apply link are required', 'err'); return
    }

    const skills = jobForm.skills.split(',').map(s => s.trim()).filter(Boolean)
    const { error } = await supabase
      .from('recruiter_jobs')
      .insert({
        recruiter_id: recruiter.id,
        title:        jobForm.title,
        location:     jobForm.location || null,
        job_type:     jobForm.job_type,
        skills,
        cgpa_cutoff:  jobForm.cgpa_cutoff ? parseFloat(jobForm.cgpa_cutoff) : null,
        apply_link:   jobForm.apply_link
      })

    if (error) { showToast(`Error: ${error.message}`, 'err'); return }

    showToast('✅ Job posted successfully!')
    setJobForm({ title: '', location: '', job_type: 'full-time', skills: '', cgpa_cutoff: '', apply_link: '', description: '' })
    setTab('dashboard')
    await fetchRecruiterData(user!.id)
  }

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#9a9896' }}>Loading…</p>
      </div>
    )
  }

  return (
    <div style={S.page}>
      {/* Hero */}
      <div style={S.hero}>
        <h1 style={S.heroTitle}>
          Find India&apos;s Best <span style={{ color: '#FF6B35' }}>Engineering Talent</span>
        </h1>
        <p style={S.heroSub}>
          Post jobs, verify your company, and connect directly with motivated candidates from IITs, NITs, and top engineering colleges.
        </p>
        <div style={S.heroChips}>
          {['🎓 1,000+ active candidates', '🏆 Top college talent', '⚡ 48h avg response', '🔒 Verified companies only'].map(c => (
            <span key={c} style={S.chip}>{c}</span>
          ))}
        </div>
      </div>

      <div style={S.container}>
        {/* Not signed in */}
        {!user && (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sign In Required</h2>
            <p style={{ color: '#9a9896', marginBottom: 24 }}>Please sign in with your company email to access the Recruiter Panel.</p>
            <button style={{ ...S.btnPrimary, width: 'auto', display: 'inline-block' }}
              onClick={() => window.location.href = '/auth'}>
              Sign In / Register →
            </button>
          </div>
        )}

        {/* Recruiter signup */}
        {user && !recruiter && (
          <div style={S.card}>
            <h2 style={S.h2}>🏢 Create Recruiter Account</h2>
            <p style={{ color: '#9a9896', marginBottom: 24, fontSize: 13 }}>
              Your account will be reviewed within 24 hours. Once verified, you can post jobs and browse candidates.
            </p>
            <div style={S.grid2}>
              {[
                { key: 'full_name',      label: 'Your Full Name *',    placeholder: 'Priya Sharma' },
                { key: 'company_name',   label: 'Company Name *',       placeholder: 'Acme Corp' },
                { key: 'company_domain', label: 'Company Domain',       placeholder: 'acmecorp.com' },
                { key: 'designation',    label: 'Your Designation',      placeholder: 'HR Manager / Talent Acquisition' }
              ].map(f => (
                <div key={f.key} style={S.field}>
                  <label style={S.label}>{f.label}</label>
                  <input
                    style={S.input}
                    value={signupForm[f.key as keyof typeof signupForm]}
                    placeholder={f.placeholder}
                    onChange={e => setSignupForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button style={S.btnPrimary} onClick={handleSignup}>
              Create Recruiter Account →
            </button>
          </div>
        )}

        {/* Recruiter dashboard */}
        {recruiter && (
          <>
            {/* Profile header */}
            <div style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                  {recruiter.company_name}
                </h2>
                <p style={{ color: '#9a9896', fontSize: 13, marginBottom: 12 }}>
                  {recruiter.designation} • {recruiter.full_name}
                </p>
                <span style={recruiter.verified ? S.verifiedBadge : S.pendingBadge}>
                  {recruiter.verified ? '✅ Verified' : '⏳ Pending Verification'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={S.btnSecondary} onClick={() => setTab('post')}>
                  + Post Job
                </button>
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {(['dashboard', 'post'] as const).map(t => (
                <button
                  key={t}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: tab === t ? 'rgba(255,107,53,0.15)' : 'transparent',
                    color: tab === t ? '#FF6B35' : '#9a9896',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => setTab(t)}
                >
                  {t === 'dashboard' ? '📊 My Postings' : '➕ Post Job'}
                </button>
              ))}
            </div>

            {/* My Postings */}
            {tab === 'dashboard' && (
              <div>
                <h2 style={S.h2}>My Job Postings ({jobs.length})</h2>
                {jobs.length === 0 ? (
                  <div style={{ ...S.card, textAlign: 'center' }}>
                    <p style={{ color: '#9a9896' }}>No jobs posted yet.</p>
                    <button style={{ ...S.btnPrimary, marginTop: 16, width: 'auto', display: 'inline-block' }}
                      onClick={() => setTab('post')}>
                      Post Your First Job →
                    </button>
                  </div>
                ) : jobs.map(job => (
                  <div key={job.id} style={S.jobCard}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: '#9a9896', marginBottom: 8 }}>
                        📍 {job.location || 'Remote'} • {job.job_type}
                        {job.cgpa_cutoff ? ` • CGPA ≥ ${job.cgpa_cutoff}` : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(job.skills ?? []).slice(0, 5).map(sk => (
                          <span key={sk} style={S.skillChip}>{sk}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{
                        background: job.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: job.is_active ? '#22c55e' : '#ef4444',
                        border: `1px solid ${job.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        borderRadius: 20,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 600
                      }}>
                        {job.is_active ? 'Active' : 'Closed'}
                      </span>
                      <div style={{ fontSize: 11, color: '#9a9896', marginTop: 8 }}>
                        {new Date(job.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Post job form */}
            {tab === 'post' && (
              <div style={S.card}>
                <h2 style={S.h2}>➕ Post a New Job</h2>
                <div style={S.grid2}>
                  {[
                    { key: 'title',       label: 'Job Title *',       placeholder: 'Software Engineer Intern' },
                    { key: 'location',    label: 'Location',           placeholder: 'Bangalore / Remote' },
                    { key: 'apply_link',  label: 'Apply Link *',       placeholder: 'https://…' },
                    { key: 'cgpa_cutoff', label: 'CGPA Cutoff',        placeholder: '7.5' }
                  ].map(f => (
                    <div key={f.key} style={S.field}>
                      <label style={S.label}>{f.label}</label>
                      <input
                        style={S.input}
                        value={jobForm[f.key as keyof typeof jobForm]}
                        placeholder={f.placeholder}
                        type={f.key === 'cgpa_cutoff' ? 'number' : 'text'}
                        onChange={e => setJobForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                <div style={S.field}>
                  <label style={S.label}>Job Type</label>
                  <select
                    style={{ ...S.input }}
                    value={jobForm.job_type}
                    onChange={e => setJobForm(prev => ({ ...prev, job_type: e.target.value }))}
                  >
                    {['full-time', 'internship', 'part-time', 'contract', 'remote'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div style={S.field}>
                  <label style={S.label}>Required Skills (comma-separated)</label>
                  <input
                    style={S.input}
                    value={jobForm.skills}
                    placeholder="React, Node.js, PostgreSQL"
                    onChange={e => setJobForm(prev => ({ ...prev, skills: e.target.value }))}
                  />
                </div>

                <button style={S.btnPrimary} onClick={handlePostJob}>
                  Publish Job Posting →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          ...S.toast,
          background: toastMsg.type === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toastMsg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: toastMsg.type === 'ok' ? '#22c55e' : '#ef4444'
        }}>
          {toastMsg.text}
        </div>
      )}
    </div>
  )
}
