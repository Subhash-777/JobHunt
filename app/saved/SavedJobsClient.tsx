'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, Folder, CheckSquare, Square } from 'lucide-react';
import { Drawer } from '@/components/shared/Drawer';
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

interface SavedJobsClientProps {
  initialSavedJobs: SavedJob[];
}

const FOLDERS = [
  { id: 'all', label: 'All Saved' },
  { id: 'shortlisted', label: 'Shortlist' },
  { id: 'applied', label: 'Applied' },
  { id: 'oa', label: 'Online Assess.' },
  { id: 'interview', label: 'Interviewing' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

export function SavedJobsClient({ initialSavedJobs }: SavedJobsClientProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(initialSavedJobs);
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredJobs = savedJobs.filter((sj) => {
    if (activeFolder === 'all') return true;
    return sj.folder === activeFolder;
  });

  const handleUpdateFolder = async (jobId: string, newFolder: string) => {
    setIsUpdating(jobId);
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, folder: newFolder }),
      });
      if (res.ok) {
        setSavedJobs(prev =>
          prev.map(sj => (sj.job_id === jobId ? { ...sj, folder: newFolder } : sj))
        );
        toast.success(`Moved to ${newFolder.toUpperCase()}`);
      }
    } catch {
      toast.error('Failed to update stage.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (jobId: string) => {
    try {
      const res = await fetch(`/api/saved?jobId=${jobId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSavedJobs(prev => prev.filter(sj => sj.job_id !== jobId));
        if (selectedJob?.job_id === jobId) {
          setSelectedJob(null);
        }
        toast.success('Removed from saved jobs.');
      }
    } catch {
      toast.error('Failed to remove saved job.');
    }
  };

  const toggleSelect = (jobId: string) => {
    setSelectedIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleBulkMove = async (targetFolder: string) => {
    if (selectedIds.length === 0 || !targetFolder) return;
    try {
      await Promise.all(
        selectedIds.map(jobId =>
          fetch('/api/saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, folder: targetFolder }),
          })
        )
      );
      setSavedJobs(prev =>
        prev.map(sj => (selectedIds.includes(sj.job_id) ? { ...sj, folder: targetFolder } : sj))
      );
      setSelectedIds([]);
      toast.success(`Moved ${selectedIds.length} jobs to ${targetFolder.toUpperCase()}`);
    } catch {
      toast.error('Bulk move failed.');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-accent-500" />
            <span>Saved Jobs & Shortlists</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review bookmarked roles, filter by pipeline stage, or perform bulk stage updates.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
        {FOLDERS.map((f) => {
          const isActive = activeFolder === f.id;
          const count = f.id === 'all' ? savedJobs.length : savedJobs.filter(sj => sj.folder === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                isActive
                  ? 'bg-accent-500 text-white border-accent-500 shadow-xs'
                  : 'bg-white text-text-secondary border-border-subtle hover:border-border-default hover:text-text-primary'
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-bg-surface border border-border-subtle rounded-2xl p-8 space-y-3 shadow-2xs">
          <Folder className="mx-auto text-text-tertiary w-10 h-10 opacity-60" />
          <h2 className="text-sm font-semibold text-text-primary">No saved jobs in this category</h2>
          <p className="text-xs text-text-secondary">
            Jobs you bookmark from the main opportunity feed will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((sj) => {
            const job = sj.jobs;
            if (!job) return null;
            const isChecked = selectedIds.includes(sj.job_id);

            return (
              <div
                key={sj.id}
                className={`p-4 rounded-2xl bg-bg-surface border shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isChecked ? 'border-accent-400 bg-accent-50/40' : 'border-border-subtle hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <button
                    onClick={() => toggleSelect(sj.job_id)}
                    className="mt-1 text-text-tertiary hover:text-accent-600"
                    aria-label="Select job"
                  >
                    {isChecked ? <CheckSquare className="w-4 h-4 text-accent-500" /> : <Square className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedJob(sj)}>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-accent-600 bg-accent-50 border border-accent-100 px-2 py-0.5 rounded uppercase">
                        {job.source_name || 'verified'}
                      </span>
                      <span className="text-[11px] text-text-tertiary">
                        Saved {new Date(sj.saved_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-text-primary hover:text-accent-600 transition-colors mt-1 truncate">
                      {job.title}
                    </h2>
                    <p className="text-xs text-text-secondary truncate mt-0.5">{job.company}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 shrink-0">
                  <select
                    aria-label="Move job to stage"
                    value={sj.folder}
                    disabled={isUpdating === sj.job_id}
                    onChange={(e) => handleUpdateFolder(sj.job_id, e.target.value)}
                    className="bg-bg-elevated border border-border-subtle rounded-xl py-1.5 px-3 text-xs font-medium text-text-primary focus:outline-none focus:border-accent-500"
                  >
                    <option value="shortlisted">Stage: Shortlist</option>
                    <option value="applied">Stage: Applied</option>
                    <option value="oa">Stage: Online Assess.</option>
                    <option value="interview">Stage: Interviewing</option>
                    <option value="offer">Stage: Offer</option>
                  </select>

                  <button
                    onClick={() => handleRemove(sj.job_id)}
                    className="p-2 rounded-xl text-text-tertiary hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    aria-label="Remove saved job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-accent-200 rounded-2xl px-5 py-3 shadow-xl flex items-center space-x-4"
        >
          <span className="text-xs font-bold text-accent-600">{selectedIds.length} Selected</span>
          <div className="h-4 w-[1px] bg-border-subtle" />
          <select
            aria-label="Bulk move selected jobs"
            onChange={(e) => handleBulkMove(e.target.value)}
            className="bg-bg-elevated border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none"
          >
            <option value="">Move selected to...</option>
            <option value="shortlisted">Shortlist</option>
            <option value="applied">Applied</option>
            <option value="oa">Online Assessment</option>
            <option value="interview">Interviewing</option>
          </select>
          <button
            onClick={() => setSelectedIds([])}
            className="text-xs font-medium text-text-secondary hover:text-text-primary"
          >
            Clear
          </button>
        </motion.div>
      )}

      {/* Drawer */}
      <Drawer isOpen={selectedJob !== null} onClose={() => setSelectedJob(null)}>
        {selectedJob && selectedJob.jobs && (
          <div className="p-6 text-text-primary space-y-4">
            <h2 className="text-lg font-display font-bold">{selectedJob.jobs.title}</h2>
            <p className="text-xs font-medium text-text-secondary">{selectedJob.jobs.company}</p>
            <div className="p-4 bg-white rounded-xl border border-border-subtle text-xs text-text-secondary leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line">
              {selectedJob.jobs.description || 'No description available.'}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
