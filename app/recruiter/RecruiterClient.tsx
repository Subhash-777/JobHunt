'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: '#0F241D',
    fontFamily: 'inherit'
  },
  hero: {
    background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 55%, #FEF3C7 100%)',
    border: '1px solid #D5E1DA',
    borderRadius: 20,
    padding: '44px 24px',
    textAlign: 'center',
    marginBottom: 24
  },
  heroTitle: { fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, marginBottom: 12, color: '#0F241D' },
  heroSub: { fontSize: 15, color: '#435D52', maxWidth: 540, margin: '0 auto 24px' },
  heroChips: { display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  chip: {
    background: '#FFFFFF',
    border: '1px solid #D1FAE5',
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    color: '#065F46'
  },
  container: { maxWidth: 920, margin: '0 auto', padding: '8px 0 40px' },
  card: {
    background: '#FFFFFF',
    border: '1px solid #D5E1DA',
    borderRadius: 18,
    padding: 28,
    marginBottom: 20,
    boxShadow: '0 1px 3px rgba(15,23,42,0.05)'
  },
  h2: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#0F241D' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: 700, color: '#435D52', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: {
    background: '#F3F7F4',
    border: '1px solid #D5E1DA',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#0F241D',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  btnPrimary: {
    background: '#047857',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    padding: '11px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%'
  },
  btnSecondary: {
    background: '#F1F5F9',
    color: '#0F241D',
    border: '1px solid #CBD5E1',
    borderRadius: 10,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },
  verifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#ECFDF5',
    border: '1px solid #A7F3D0',
    color: '#047857',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600
  },
  pendingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#FFFBEB',
    border: '1px solid #FDE68A',
    color: '#B45309',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600
  },
  jobCard: {
    background: '#FFFFFF',
    border: '1px solid #D5E1DA',
    borderRadius: 14,
    padding: '18px 20px',
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)'
  },
  skillChip: {
    background: '#ECFDF5',
    border: '1px solid #D1FAE5',
    color: '#065F46',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600
  },
  toast: {
    position: 'fixed' as const,
    bottom: 24,
    right: 24,
    padding: '12px 18px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    zIndex: 9999,
    maxWidth: 320,
    boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
  }
}

export default function RecruiterClient() {
  const supabase = createClient()
  const [user, setUser]           = useState<Record<string, string> | null>(null)
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null)
  const [jobs, setJobs]           = useState<RecruiterJob[]>([])
  const [tab, setTab]             = useState<'signup' | 'dashboard' | 'post'>('signup')
  const [loading, setLoading]     = useState(true)
  const [toastMsg, setToastMsg]   = useState<{ text: string; type: 'ok' | 'err' } | null>(null)

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
    showToast('Recruiter account created! Verification pending.')
  }

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

    showToast('Job posted successfully!')
    setJobForm({ title: '', location: '', job_type: 'full-time', skills: '', cgpa_cutoff: '', apply_link: '', description: '' })
    setTab('dashboard')
    await fetchRecruiterData(user!.id)
  }

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#5C756B' }}>Loading recruiter panel…</p>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <h1 style={S.heroTitle}>
          Find India&apos;s Best <span style={{ color: '#047857' }}>Engineering Talent</span>
        </h1>
        <p style={S.heroSub}>
          Post jobs, verify your company, and connect with motivated candidates from top Indian engineering colleges.
        </p>
        <div style={S.heroChips}>
          {['Active Candidates', 'Top College Talent', 'Zero Listing Fee', 'Verified Companies Only'].map(c => (
            <span key={c} style={S.chip}>{c}</span>
          ))}
        </div>
      </div>

      <div style={S.container}>
        {!user && (
          <div style={{ ...S.card, textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sign In Required</h2>
            <p style={{ color: '#435D52', marginBottom: 24, fontSize: 14 }}>
              Please sign in with your company email to access the Recruiter Panel.
            </p>
            <button
              style={{ ...S.btnPrimary, width: 'auto', display: 'inline-block' }}
              onClick={() => window.location.href = '/auth/login?next=/recruiter'}
            >
              Sign In / Register →
            </button>
          </div>
        )}

        {user && !recruiter && (
          <div style={S.card}>
            <h2 style={S.h2}>Create Recruiter Account</h2>
            <p style={{ color: '#435D52', marginBottom: 24, fontSize: 13 }}>
              Your account will be reviewed before public listings go live. Once verified, you can publish roles directly to the feed.
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

        {recruiter && (
          <>
            <div style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                  {recruiter.company_name}
                </h2>
                <p style={{ color: '#435D52', fontSize: 13, marginBottom: 12 }}>
                  {recruiter.designation} • {recruiter.full_name}
                </p>
                <span style={recruiter.verified ? S.verifiedBadge : S.pendingBadge}>
                  {recruiter.verified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={S.btnSecondary} onClick={() => setTab('post')}>
                  + Post Job
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {(['dashboard', 'post'] as const).map(t => (
                <button
                  key={t}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 10,
                    border: tab === t ? '1px solid #A7F3D0' : '1px solid #D5E1DA',
                    background: tab === t ? '#ECFDF5' : '#FFFFFF',
                    color: tab === t ? '#065F46' : '#435D52',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => setTab(t)}
                >
                  {t === 'dashboard' ? 'My Postings' : '+ Post Job'}
                </button>
              ))}
            </div>

            {tab === 'dashboard' && (
              <div>
                <h2 style={S.h2}>My Job Postings ({jobs.length})</h2>
                {jobs.length === 0 ? (
                  <div style={{ ...S.card, textAlign: 'center' }}>
                    <p style={{ color: '#435D52' }}>No jobs posted yet.</p>
                    <button
                      style={{ ...S.btnPrimary, marginTop: 16, width: 'auto', display: 'inline-block' }}
                      onClick={() => setTab('post')}
                    >
                      Post Your First Job →
                    </button>
                  </div>
                ) : jobs.map(job => (
                  <div key={job.id} style={S.jobCard}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: '#435D52', marginBottom: 8 }}>
                        {job.location || 'Remote'} • {job.job_type}
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
                        background: job.is_active ? '#ECFDF5' : '#FEF2F2',
                        color: job.is_active ? '#047857' : '#DC2626',
                        border: `1px solid ${job.is_active ? '#A7F3D0' : '#FECACA'}`,
                        borderRadius: 20,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 600
                      }}>
                        {job.is_active ? 'Active' : 'Closed'}
                      </span>
                      <div style={{ fontSize: 11, color: '#5C756B', marginTop: 8 }}>
                        {new Date(job.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'post' && (
              <div style={S.card}>
                <h2 style={S.h2}>Post a New Job</h2>
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

      {toastMsg && (
        <div style={{
          ...S.toast,
          background: toastMsg.type === 'ok' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${toastMsg.type === 'ok' ? '#A7F3D0' : '#FECACA'}`,
          color: toastMsg.type === 'ok' ? '#047857' : '#DC2626'
        }}>
          {toastMsg.text}
        </div>
      )}
    </div>
  )
}
