'use client';

import { useState } from 'react';
import { Kanban } from 'lucide-react';
import { Drawer } from '@/components/shared/Drawer';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  folder: string;
  notes: string | null;
  ignored: boolean;
  saved_at: string;
  jobs: any;
}

interface TrackerClientProps {
  initialSavedJobs: SavedJob[];
}

const COLUMNS = [
  { id: 'shortlisted', label: 'Shortlisted', color: 'border-emerald-200 text-emerald-700 bg-emerald-50' },
  { id: 'applied', label: 'Applied', color: 'border-amber-200 text-amber-700 bg-amber-50' },
  { id: 'oa', label: 'Online Assess.', color: 'border-purple-200 text-purple-700 bg-purple-50' },
  { id: 'interview', label: 'Interviewing', color: 'border-teal-200 text-teal-700 bg-teal-50' },
  { id: 'offer', label: 'Offer Received', color: 'border-emerald-200 text-emerald-700 bg-emerald-50' },
  { id: 'rejected', label: 'Rejected', color: 'border-rose-200 text-rose-700 bg-rose-50' },
];

export function TrackerClient({ initialSavedJobs }: TrackerClientProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(initialSavedJobs);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [activeOverColumn, setActiveOverColumn] = useState<string | null>(null);

  const [outcomePrompt, setOutcomePrompt] = useState<{
    job: any;
    outcome: 'offer' | 'rejected';
  } | null>(null);

  const totalCount = savedJobs.length;
  const appliedCount = savedJobs.filter(s => s.folder === 'applied').length;
  const interviewCount = savedJobs.filter(s => s.folder === 'interview' || s.folder === 'oa').length;
  const offerCount = savedJobs.filter(s => s.folder === 'offer').length;

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    setDraggedJobId(jobId);
    e.dataTransfer.setData('text/plain', jobId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (activeOverColumn !== columnId) {
      setActiveOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setActiveOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    setActiveOverColumn(null);
    const jobId = e.dataTransfer.getData('text/plain') || draggedJobId;
    if (!jobId) return;

    const currentJob = savedJobs.find(sj => sj.job_id === jobId);
    if (currentJob?.folder === targetFolder) return;

    setSavedJobs(prev =>
      prev.map(sj => (sj.job_id === jobId ? { ...sj, folder: targetFolder } : sj))
    );
    toast.success(`Moved to ${targetFolder.toUpperCase()}`);

    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, folder: targetFolder }),
      });
      if (!res.ok) {
        setSavedJobs(initialSavedJobs);
        toast.error('Failed to persist stage change.');
      } else if (targetFolder === 'offer' || targetFolder === 'rejected') {
        if (currentJob?.jobs) {
          setOutcomePrompt({
            job: currentJob.jobs,
            outcome: targetFolder === 'offer' ? 'offer' : 'rejected'
          });
        }
      }
    } catch {
      setSavedJobs(initialSavedJobs);
      toast.error('Network error during stage update.');
    } finally {
      setDraggedJobId(null);
    }
  };

  const handleShareOutcome = async () => {
    if (!outcomePrompt) return;
    try {
      await fetch('/api/community/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: outcomePrompt.job.company,
          role_category: outcomePrompt.job.role_category || 'general',
          outcome: outcomePrompt.outcome,
          got_oa: true,
          got_interview: outcomePrompt.outcome === 'offer',
          anonymous: true
        })
      });
      toast.success('Thank you for contributing to community outcomes!');
    } catch (err) {
      console.error('Failed to share outcome:', err);
    } finally {
      setOutcomePrompt(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
            <Kanban className="w-6 h-6 text-accent-500" />
            <span>Application Pipeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Drag and drop applications across stages from Shortlisted to Offer.
          </p>
        </div>
      </div>

      {/* Stats Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Total Saved</span>
          <p className="text-2xl font-display font-extrabold text-text-primary">{totalCount}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Applied</span>
          <p className="text-2xl font-display font-extrabold text-amber-700">{appliedCount}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-accent-600 uppercase tracking-wider">In Progress</span>
          <p className="text-2xl font-display font-extrabold text-accent-600">{interviewCount}</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Offers Received</span>
          <p className="text-2xl font-display font-extrabold text-emerald-700">{offerCount}</p>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar min-h-[560px] items-stretch">
        {COLUMNS.map((col) => {
          const colJobs = savedJobs.filter((sj) => sj.folder === col.id);
          const isOver = activeOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex-1 min-w-[260px] max-w-[320px] flex flex-col rounded-2xl border p-3.5 transition-all ${
                isOver
                  ? 'border-accent-400 bg-accent-50/70 shadow-md'
                  : 'border-border-subtle bg-bg-elevated/50'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs font-mono font-bold text-text-secondary px-2 py-0.5 rounded-md bg-white border border-border-subtle">
                  {colJobs.length}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5">
                {colJobs.map((sj) => {
                  const job = sj.jobs;
                  if (!job) return null;
                  const isBeingDragged = draggedJobId === sj.job_id;

                  return (
                    <motion.div
                      key={sj.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, sj.job_id)}
                      onClick={() => setSelectedJob(sj)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-3.5 rounded-xl border bg-bg-surface shadow-2xs cursor-grab active:cursor-grabbing transition-all space-y-2 ${
                        isBeingDragged
                          ? 'opacity-40 border-accent-400 ring-2 ring-accent-500/20'
                          : 'border-border-subtle hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-semibold text-accent-600 bg-accent-50 border border-accent-100 px-2 py-0.5 rounded uppercase">
                          {job.source_name || 'job'}
                        </span>
                        {job.ctc_bucket && job.ctc_bucket !== 'unknown' && (
                          <span className="text-[10px] font-semibold text-emerald-700">{job.ctc_bucket} LPA</span>
                        )}
                      </div>

                      <h2 className="text-xs font-bold text-text-primary line-clamp-1">
                        {job.title}
                      </h2>
                      <p className="text-[11px] text-text-secondary truncate">{job.company}</p>
                    </motion.div>
                  );
                })}

                {colJobs.length === 0 && (
                  <div className="flex-1 border-2 border-dashed border-border-default/60 rounded-xl flex items-center justify-center p-6 text-center bg-white/40">
                    <span className="text-xs text-text-tertiary">Drag jobs here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Drawer */}
      <Drawer isOpen={selectedJob !== null} onClose={() => setSelectedJob(null)}>
        {selectedJob && selectedJob.jobs && (
          <div className="p-6 text-text-primary space-y-4">
            <h2 className="text-lg font-display font-bold">{selectedJob.jobs.title}</h2>
            <p className="text-xs font-medium text-text-secondary">{selectedJob.jobs.company}</p>

            <div className="space-y-2">
              <label htmlFor="tracker-notes" className="block text-xs font-semibold text-text-tertiary uppercase">
                Application Notes
              </label>
              <textarea
                id="tracker-notes"
                value={selectedJob.notes || ''}
                placeholder="Add interview notes, recruiter contacts, or referral links..."
                onChange={async (e) => {
                  const val = e.target.value;
                  setSavedJobs(prev =>
                    prev.map(sj => (sj.job_id === selectedJob.job_id ? { ...sj, notes: val } : sj))
                  );
                  setSelectedJob(prev => prev ? { ...prev, notes: val } : null);
                  await fetch('/api/saved', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId: selectedJob.job_id, notes: val }),
                  });
                }}
                className="w-full bg-white border border-border-subtle rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-accent-500 h-32 resize-none"
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Outcome Prompt Banner */}
      {outcomePrompt && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-accent-200 rounded-2xl p-4 shadow-xl flex items-center gap-4 max-w-md w-[92vw]"
        >
          <div className="flex-1">
            <h4 className="text-xs font-bold text-text-primary">Help the community</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Share outcome for <strong className="text-text-primary">{outcomePrompt.job.company}</strong> anonymously?
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOutcomePrompt(null)}
              className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
            >
              No thanks
            </button>
            <button
              onClick={handleShareOutcome}
              className="px-4 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Share
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
