'use client';

import { useState, useEffect } from 'react';
import { Drawer } from '../shared/Drawer';
import { createClient } from '@/lib/supabase/client';
import { 
  Building2, MapPin, Briefcase, Calendar, CheckCircle2, 
  XCircle, AlertTriangle, ExternalLink, Bookmark, Trash2,
  Clock, ShieldAlert, Sparkles, GraduationCap, Users, Flame, Copy, Check
} from 'lucide-react';
import { CalendarQuickAdd } from '../shared/CalendarQuickAdd';
import { toast } from 'sonner';

interface JobDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
}

export function JobDetailDrawer({ isOpen, onClose, job }: JobDetailDrawerProps) {
  const [profile, setProfile] = useState<any>(null);
  const [savedState, setSavedState] = useState<{ folder: string; saved: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fitScore, setFitScore] = useState<any>(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [tailoringResume, setTailoringResume] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [ppoData, setPpoData] = useState<any>(null);
  const supabase = createClient();

  const handleTailorResume = async () => {
    setTailoringResume(true);
    try {
      const res = await fetch('/api/ai/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTailoredResume(data.markdown);
      toast.success('Tailored resume generated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to tailor resume.');
    } finally {
      setTailoringResume(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !job) return;

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setProfile(prof);

      const { data: saved } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .maybeSingle();

      if (saved) {
        setSavedState({ folder: saved.folder, saved: true });
      } else {
        setSavedState({ folder: 'shortlisted', saved: false });
      }

      setFitLoading(true);
      try {
        const res = await fetch(`/api/jobs/${job.id}/fit`);
        if (res.ok) {
          const scoreData = await res.json();
          setFitScore(scoreData);
        }
      } catch (err) {
        console.error('Error fetching fit score:', err);
      } finally {
        setFitLoading(false);
      }

      if (job.company) {
        try {
          const ppoRes = await fetch(`/api/community/ppo/${encodeURIComponent(job.company)}`);
          if (ppoRes.ok) {
            const ppoJson = await ppoRes.json();
            if (ppoJson.company && ppoJson.company.ppo_reports >= 1) {
              setPpoData(ppoJson.company);
            }
          }
        } catch (err) {
          // silent fallback
        }
      }
    }

    loadData();
  }, [isOpen, job]);

  if (!job) return null;

  const currentFit = fitScore?.score ?? job.fitScore ?? 65;
  const isHiddenGem = currentFit >= 80;
  const userSkillsSet = new Set((profile?.skills || []).map((s: string) => s.toLowerCase()));

  const handleSaveToggle = async () => {
    if (!savedState) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to save jobs.');
        return;
      }

      if (savedState.saved) {
        const res = await fetch(`/api/saved?jobId=${job.id}`, { method: 'DELETE' });
        if (res.ok) {
          setSavedState(prev => prev ? { ...prev, saved: false } : null);
          toast.success('Job removed from saved.');
        }
      } else {
        const res = await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id, folder: 'shortlisted' }),
        });
        if (res.ok) {
          setSavedState(prev => prev ? { ...prev, saved: true, folder: 'shortlisted' } : null);
          toast.success('Job saved to Shortlisted!');
        }
      }
    } catch (err) {
      toast.error('Error updating saved state.');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newFolder: string) => {
    if (!savedState) return;
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, folder: newFolder }),
      });
      if (res.ok) {
        setSavedState(prev => prev ? { ...prev, folder: newFolder, saved: true } : null);
        toast.success(`Moved to ${newFolder.toUpperCase()}`);
      }
    } catch (err) {
      toast.error('Failed to change stage.');
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="p-6 h-full flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <header className="border-b border-border-subtle pb-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold text-accent-400 bg-accent-500/10 border border-accent-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {job.source_name || 'verified'}
              </span>
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Just now'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-primary leading-tight">{job.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm font-medium text-text-secondary">{job.company}</p>
              {ppoData && (
                <a
                  href={`/community/ppo?company=${encodeURIComponent(job.company)}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-saffron-500/10 text-saffron-400 border border-saffron-500/30 px-2 py-0.5 rounded-full hover:bg-saffron-500/20 transition-all"
                >
                  🎓 PPO: ~{ppoData.ppo_rate}% ({ppoData.ppo_reports} {ppoData.ppo_reports === 1 ? 'report' : 'reports'})
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs mt-3">
              {(job.location || job.location_raw) && (
                <span className="flex items-center gap-1 bg-bg-elevated border border-border-subtle px-2.5 py-1 rounded-lg text-text-secondary">
                  <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
                  {Array.isArray(job.location) ? job.location.join(', ') : job.location_raw}
                </span>
              )}
              {job.work_mode && (
                <span className="flex items-center gap-1 bg-bg-elevated border border-border-subtle px-2.5 py-1 rounded-lg text-text-secondary capitalize">
                  <Briefcase className="w-3.5 h-3.5 text-text-tertiary" />
                  {job.work_mode}
                </span>
              )}
              <span className="bg-accent-500/10 border border-accent-500/20 text-accent-400 px-2.5 py-1 rounded-lg font-semibold">
                💰 {job.ctc_text || job.salary_raw || 'Competitive Package'}
              </span>
            </div>
          </header>

          {/* Hidden Gem Banner (if score >= 80) */}
          {isHiddenGem && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-accent-500/20 to-accent-600/10 border border-accent-500/30 flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-accent-500/20 text-accent-400">
                <Flame className="w-5 h-5 fill-accent-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">Why this is a Hidden Gem</h4>
                <p className="text-[11px] text-text-secondary">High match score ({currentFit}%) with low applicant competition!</p>
              </div>
            </div>
          )}

          {/* Skills Breakdown (Highlighted matching skills) */}
          <section className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              Required Tech Stack
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(job.key_skills || ['React', 'TypeScript', 'Node.js']).map((skill: string, idx: number) => {
                const isMatch = userSkillsSet.has(skill.toLowerCase());
                return (
                  <span
                    key={idx}
                    className={`text-[11px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-colors ${
                      isMatch
                        ? 'bg-accent-500/20 text-accent-400 border-accent-500/40 font-semibold'
                        : 'bg-bg-elevated text-text-secondary border-border-subtle'
                    }`}
                  >
                    {skill} {isMatch && '✓'}
                  </span>
                );
              })}
            </div>
          </section>

          {/* AI Fit Analysis */}
          <section className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-500" />
              AI Candidate Alignment
            </h3>
            
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-extrabold text-accent-400 bg-accent-500/10 px-3.5 py-1.5 rounded-xl border border-accent-500/30">
                {currentFit}%
              </div>
              <p className="text-xs text-text-tertiary">
                Multi-vector alignment score computed across your profile skills, experience, and projects.
              </p>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Job Description</h3>
            <div className="text-xs text-text-secondary leading-relaxed bg-bg-surface p-4 rounded-2xl border border-border-subtle whitespace-pre-line max-h-60 overflow-y-auto">
              {job.description || 'No detailed description available.'}
            </div>
          </section>

          {/* Tailored Resume Output */}
          {tailoredResume && (
            <section className="p-4 rounded-2xl bg-bg-surface border border-accent-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-accent-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Customized Tailored Resume
                </h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tailoredResume);
                    setCopied(true);
                    toast.success('Copied tailored resume!');
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center space-x-1 text-xs text-text-secondary hover:text-white px-2 py-1 rounded bg-bg-elevated"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 bg-bg-elevated rounded-xl text-[11px] font-mono text-text-secondary max-h-48 overflow-y-auto whitespace-pre-wrap">
                {tailoredResume}
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border-subtle pt-4 mt-6 space-y-3 bg-bg-surface/90 sticky bottom-0">
          <div className="flex items-center justify-between gap-2">
            {savedState?.saved ? (
              <div className="flex-1 flex items-center space-x-2">
                <select
                  value={savedState.folder}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="flex-1 bg-bg-elevated border border-border-subtle rounded-xl py-2 px-3 text-xs text-text-secondary focus:outline-none"
                >
                  <option value="shortlisted">Stage: Shortlisted</option>
                  <option value="applied">Stage: Applied</option>
                  <option value="oa">Stage: Online Assessment</option>
                  <option value="interview">Stage: Interviewing</option>
                  <option value="offer">Stage: Offer Received</option>
                </select>
                <button
                  onClick={handleSaveToggle}
                  className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSaveToggle}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-border-default hover:border-accent-500/40 text-xs font-semibold text-text-primary hover:text-accent-400 flex items-center justify-center space-x-2 transition-all"
              >
                <Bookmark className="w-4 h-4" />
                <span>Bookmark Role</span>
              </button>
            )}

            <CalendarQuickAdd job={job} />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTailorResume}
              disabled={tailoringResume}
              className="flex-1 py-2.5 rounded-xl bg-accent-500/10 hover:bg-accent-500/20 text-accent-400 border border-accent-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{tailoringResume ? 'Tailoring...' : 'AI Tailor Resume'}</span>
            </button>

            <a
              href={job.apply_url || job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white text-xs font-bold text-center flex items-center justify-center space-x-1.5 shadow-md shadow-accent-500/20 transition-all"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
