'use client';

import { useState, useEffect } from 'react';
import { Drawer } from '../shared/Drawer';
import { NormalizedJob } from '@/scripts/ingest/types';
import { createClient } from '@/lib/supabase/client';
import { 
  Building, MapPin, Briefcase, Calendar, CheckCircle2, 
  XCircle, AlertTriangle, ExternalLink, Bookmark, Trash2,
  Clock, ShieldAlert, Sparkles, GraduationCap, Users
} from 'lucide-react';
import { CalendarQuickAdd } from '../shared/CalendarQuickAdd';

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
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen || !job) return;

    // Fetch user profile and saved state
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Load Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(prof);

      // 2. Load Saved Stage
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

      // 3. Load/compute Fit Score
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
    }

    loadData();
  }, [isOpen, job]);

  if (!job) return null;

  // Compute Eligibility
  const eligibility = {
    cgpa: { required: job.cgpa_cutoff, user: profile?.cgpa, met: true },
    batch: { required: job.batch_years, user: profile?.graduation_year, met: true },
    branch: { required: job.branch_required, user: profile?.branch, met: true },
    degree: { required: job.degree_required, user: profile?.degree, met: true },
    eligible: true
  };

  if (job.cgpa_cutoff && profile?.cgpa) {
    eligibility.cgpa.met = Number(profile.cgpa) >= Number(job.cgpa_cutoff);
    if (!eligibility.cgpa.met) eligibility.eligible = false;
  }
  if (job.batch_years && job.batch_years.length > 0 && profile?.graduation_year) {
    eligibility.batch.met = job.batch_years.includes(Number(profile.graduation_year));
    if (!eligibility.batch.met) eligibility.eligible = false;
  }
  if (job.branch_required && job.branch_required.length > 0 && profile?.branch) {
    const userBranchLower = profile.branch.toLowerCase();
    eligibility.branch.met = job.branch_required.some((b: string) => 
      b.toLowerCase() === userBranchLower || userBranchLower.includes(b.toLowerCase())
    );
    if (!eligibility.branch.met) eligibility.eligible = false;
  }
  if (job.degree_required && job.degree_required.length > 0 && profile?.degree) {
    const userDegreeLower = profile.degree.toLowerCase();
    eligibility.degree.met = job.degree_required.some((d: string) => 
      d.toLowerCase() === userDegreeLower || userDegreeLower.includes(d.toLowerCase())
    );
    if (!eligibility.degree.met) eligibility.eligible = false;
  }

  // Handle bookmark toggle
  const handleSaveToggle = async () => {
    if (!savedState) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please login to save jobs.');
        return;
      }

      if (savedState.saved) {
        // Remove
        const res = await fetch(`/api/saved?jobId=${job.id}`, { method: 'DELETE' });
        if (res.ok) {
          setSavedState(prev => prev ? { ...prev, saved: false } : null);
        }
      } else {
        // Save
        const res = await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id, folder: 'shortlisted' }),
        });
        if (res.ok) {
          setSavedState(prev => prev ? { ...prev, saved: true, folder: 'shortlisted' } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle stage change
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Record Apply Click
  const handleApplyClick = async () => {
    try {
      await supabase.from('apply_clicks').insert({ job_id: job.id });
    } catch (err) {
      console.error('Error logging apply click:', err);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className="p-6 h-full flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-accent-500 bg-accent-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {job.source_name}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Just now'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 leading-snug">{job.title}</h2>
            <p className="text-lg text-gray-400 mb-4">{job.company}</p>

            <div className="flex flex-wrap gap-2 text-xs">
              {job.location && job.location.length > 0 && (
                <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md text-gray-300">
                  <MapPin size={12} />
                  {job.location.join(', ')}
                </span>
              )}
              {job.work_mode && (
                <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md text-gray-300 capitalize">
                  <Briefcase size={12} />
                  {job.work_mode}
                </span>
              )}
              {job.ctc_bucket && (
                <span className="bg-accent-500/10 border border-accent-500/20 text-accent-500 px-2.5 py-1 rounded-md font-semibold">
                  💰 {job.ctc_bucket} LPA
                </span>
              )}
            </div>
          </header>

          {/* Eligibility Panel */}
          {profile && (
            <section className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-accent-500" />
                Eligibility Check
              </h3>
              
              <div className="grid gap-2">
                {/* CGPA */}
                {job.cgpa_cutoff && (
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                    <span className="text-gray-400">CGPA Cutoff (Req: {job.cgpa_cutoff})</span>
                    <span className="flex items-center gap-1 font-semibold">
                      {profile.cgpa || 'Not Set'}
                      {eligibility.cgpa.met ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                    </span>
                  </div>
                )}

                {/* Batch */}
                {job.batch_years && job.batch_years.length > 0 && (
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Target Batch (Req: {job.batch_years.join(', ')})</span>
                    <span className="flex items-center gap-1 font-semibold">
                      {profile.graduation_year || 'Not Set'}
                      {eligibility.batch.met ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                    </span>
                  </div>
                )}

                {/* Branch */}
                {job.branch_required && job.branch_required.length > 0 && (
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Branches (Req: {job.branch_required.join(', ')})</span>
                    <span className="flex items-center gap-1 font-semibold max-w-[200px] truncate" title={profile.branch}>
                      {profile.branch || 'Not Set'}
                      {eligibility.branch.met ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <XCircle size={14} className="text-red-400" />
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-between items-center text-[10px]">
                <span className="text-gray-500 uppercase tracking-widest">Overall Status</span>
                {eligibility.eligible ? (
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Eligible
                  </span>
                ) : (
                  <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert size={10} />
                    Mismatch
                  </span>
                )}
              </div>
            </section>
          )}

          {/* Fit Score Panel */}
          {profile && (
            <section className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                <Sparkles size={14} className="text-accent-500" />
                AI Fit Score Analysis
              </h3>
              
              {fitLoading ? (
                <div className="flex flex-col gap-2 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2"></div>
                </div>
              ) : fitScore ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-extrabold text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-lg border border-accent-500/20">
                      {fitScore.score}%
                    </div>
                    <div className="text-xs text-gray-400">
                      Weighted score based on skills, projects, location, experience, and role preference match.
                    </div>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider text-gray-400 mt-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span>Skills Match</span>
                      <span className="text-white font-semibold">
                        {Math.round((fitScore.components?.skillOverlapRatio ?? 0.5) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Project Match</span>
                      <span className="text-white font-semibold">
                        {Math.round((fitScore.components?.projectOverlapSignal ?? 0.5) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between col-span-2 pt-1 border-t border-white/5">
                      <span>Role / Location / Exp</span>
                      <span className="text-white font-semibold">Matched</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">Could not calculate fit score.</div>
              )}
            </section>
          )}

          {/* Description */}
          <section className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-1">
              <Sparkles size={14} className="text-accent-500" />
              Role Description
            </h3>
            <div className="text-sm text-gray-300 leading-relaxed max-h-[300px] overflow-y-auto pr-1 bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-line">
              {job.description || 'No detailed description available.'}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/5 pt-4 flex flex-col gap-3 bg-bg-surface/90 sticky bottom-0">
          <div className="flex gap-2">
            {/* Save / Bookmark Button */}
            {savedState?.saved ? (
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Tracker Stage</label>
                <div className="flex gap-1.5">
                  <select
                    value={savedState.folder}
                    onChange={(e) => handleStageChange(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
                  >
                    <option value="shortlisted">Shortlist</option>
                    <option value="applied">Applied</option>
                    <option value="oa">Online Assess.</option>
                    <option value="interview">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={handleSaveToggle}
                    disabled={loading}
                    className="p-2 border border-red-500/20 hover:border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Remove from Saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSaveToggle}
                disabled={loading}
                className="flex-1 border border-white/10 hover:border-accent-500/20 hover:bg-accent-500/5 text-white py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Bookmark size={16} />
                Shortlist Role
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-white/5">
            <span>Deadline Reminders</span>
            <CalendarQuickAdd job={job} />
          </div>

          <a
            href={job.apply_url || job.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApplyClick}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white text-center py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-500/10 hover:shadow-accent-500/20"
          >
            Apply Directly
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </Drawer>
  );
}
