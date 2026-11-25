'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Drawer } from '../shared/Drawer';
import { createClient } from '@/lib/supabase/client';
import {
  MapPin,
  Briefcase,
  ExternalLink,
  Bookmark,
  Trash2,
  Clock,
  Sparkles,
  Flame,
  Copy,
  Check,
  X,
  Map,
  Mic,
  GraduationCap
} from 'lucide-react';
import { CalendarQuickAdd } from '../shared/CalendarQuickAdd';
import { CompanyLogo } from './CompanyLogo';
import { formatCompensation } from './JobCard';
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
    setTailoredResume(null);

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

      try {
        const res = await fetch(`/api/jobs/${job.id}/fit`);
        if (res.ok) {
          const scoreData = await res.json();
          setFitScore(scoreData);
        }
      } catch (err) {
        console.error('Error fetching fit score:', err);
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
        } catch {
          // silent fallback
        }
      }
    }

    loadData();
  }, [isOpen, job, supabase]);

  if (!job) return null;

  const currentFit = fitScore?.score ?? job.fitScore ?? null;
  const isHiddenGem = currentFit !== null && currentFit >= 80;
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
    } catch {
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
    } catch {
      toast.error('Failed to change stage.');
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="p-5 sm:p-6 min-h-full flex flex-col justify-between bg-white/60">
        <div className="space-y-5">
          {/* Header */}
          <header className="border-b border-border-subtle pb-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-accent-600 bg-accent-50 border border-accent-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {job.source_name || 'verified'}
                </span>
                <span className="text-xs text-text-tertiary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {job.posted_at ? new Date(job.posted_at).toLocaleDateString('en-IN') : 'Recently posted'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                aria-label="Close job details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start gap-3.5">
              <CompanyLogo domain={job.company_domain} name={job.company} size={48} />
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-display font-bold text-text-primary leading-tight">{job.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-sm font-semibold text-text-secondary">{job.company}</p>
                  {ppoData && (
                    <Link
                      href={`/community/ppo?company=${encodeURIComponent(job.company)}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-all"
                    >
                      <GraduationCap className="w-3 h-3" />
                      PPO: ~{ppoData.ppo_rate}% ({ppoData.ppo_reports})
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs mt-4">
              {(job.location || job.location_raw) && (
                <span className="flex items-center gap-1 bg-bg-elevated border border-border-subtle px-2.5 py-1 rounded-lg text-text-secondary font-medium">
                  <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
                  {Array.isArray(job.location) && job.location.length > 0 ? job.location.join(', ') : (job.location_raw || 'India')}
                </span>
              )}
              {job.work_mode && (
                <span className="flex items-center gap-1 bg-bg-elevated border border-border-subtle px-2.5 py-1 rounded-lg text-text-secondary capitalize font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-text-tertiary" />
                  {job.work_mode}
                </span>
              )}
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold">
                {formatCompensation(job)}
              </span>
            </div>

            {/* Quick Prep Links */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link
                href={`/jobs/${job.id}/roadmap`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-border-subtle hover:border-accent-200 hover:bg-accent-50 text-xs font-semibold text-text-primary transition-colors"
              >
                <Map className="w-3.5 h-3.5 text-accent-500" />
                <span>Skill Roadmap</span>
              </Link>
              <Link
                href={`/jobs/${job.id}/interview`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-border-subtle hover:border-accent-200 hover:bg-accent-50 text-xs font-semibold text-text-primary transition-colors"
              >
                <Mic className="w-3.5 h-3.5 text-accent-500" />
                <span>Mock Interview</span>
              </Link>
            </div>
          </header>

          {/* Hidden Gem Banner */}
          {isHiddenGem && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-accent-50 to-amber-50/60 border border-accent-100 flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-white text-accent-500 border border-accent-100 shadow-2xs">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-primary">Strong Profile Match</h3>
                <p className="text-[11px] text-text-secondary">
                  {currentFit}% alignment with your skills and eligibility!
                </p>
              </div>
            </div>
          )}

          {/* Skills Breakdown */}
          <section className="bg-white border border-border-subtle rounded-2xl p-4 space-y-2.5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Required Tech Stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(job.key_skills && job.key_skills.length > 0 ? job.key_skills : ['Software Engineering', 'Problem Solving', 'Git']).map((skill: string, idx: number) => {
                const isMatch = userSkillsSet.has(skill.toLowerCase());
                return (
                  <span
                    key={idx}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                      isMatch
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
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
          <section className="bg-white border border-border-subtle rounded-2xl p-4 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-500" />
              AI Candidate Alignment
            </h3>

            <div className="flex items-center space-x-4">
              <div className="text-2xl font-display font-extrabold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                {currentFit !== null ? `${currentFit}%` : '—'}
              </div>
              <p className="text-xs text-text-secondary">
                {currentFit !== null
                  ? 'Multi-vector alignment score computed across your profile skills, experience, and eligibility.'
                  : 'Complete your skills & CGPA on your Profile page to compute a personalised fit score.'}
              </p>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">About the Role</h3>
            <div className="text-xs text-text-secondary leading-relaxed bg-white p-4 rounded-2xl border border-border-subtle whitespace-pre-line max-h-60 overflow-y-auto shadow-2xs">
              {job.description || 'No detailed description available.'}
            </div>
          </section>

          {/* Tailored Resume Output */}
          {tailoredResume && (
            <section className="p-4 rounded-2xl bg-accent-50/50 border border-accent-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-accent-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Tailored Resume Draft
                </h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tailoredResume);
                    setCopied(true);
                    toast.success('Copied tailored resume!');
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center space-x-1 text-xs text-text-secondary hover:text-text-primary px-2.5 py-1 rounded-lg bg-white border border-border-subtle"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 bg-white border border-border-subtle rounded-xl text-[11px] font-mono text-text-secondary max-h-48 overflow-y-auto whitespace-pre-wrap">
                {tailoredResume}
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border-subtle pt-4 mt-6 space-y-3 bg-white/95 sticky bottom-0">
          <div className="flex items-center justify-between gap-2">
            {savedState?.saved ? (
              <div className="flex-1 flex items-center space-x-2">
                <select
                  aria-label="Application pipeline stage"
                  value={savedState.folder}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="flex-1 bg-bg-elevated border border-border-subtle rounded-xl py-2 px-3 text-xs font-medium text-text-primary focus:outline-none focus:border-accent-500"
                >
                  <option value="shortlisted">Stage: Shortlisted</option>
                  <option value="applied">Stage: Applied</option>
                  <option value="oa">Stage: Online Assessment</option>
                  <option value="interview">Stage: Interviewing</option>
                  <option value="offer">Stage: Offer Received</option>
                </select>
                <button
                  onClick={handleSaveToggle}
                  className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                  aria-label="Remove saved job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSaveToggle}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border border-border-default bg-white hover:bg-bg-elevated hover:border-accent-400 text-xs font-semibold text-text-primary flex items-center justify-center space-x-2 transition-all"
              >
                <Bookmark className="w-4 h-4 text-text-secondary" />
                <span>Save Job</span>
              </button>
            )}

            <CalendarQuickAdd job={job} />
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleTailorResume}
              disabled={tailoringResume}
              className="flex-1 py-2.5 rounded-xl bg-accent-50 hover:bg-accent-100 text-accent-600 border border-accent-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{tailoringResume ? 'Tailoring...' : 'AI Tailor Resume'}</span>
            </button>

            <a
              href={job.apply_url || job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold text-center flex items-center justify-center space-x-1.5 shadow-sm shadow-accent-500/20 transition-all"
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
