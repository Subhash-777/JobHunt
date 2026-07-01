'use client';

import { useState } from 'react';
import { Kanban, ExternalLink, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import { NormalizedJob } from '@/scripts/ingest/types';
import { Drawer } from '@/components/shared/Drawer';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 'shortlisted', label: 'Shortlist', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
  { id: 'applied', label: 'Applied', color: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' },
  { id: 'oa', label: 'Online Assess.', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
  { id: 'interview', label: 'Interviewing', color: 'border-orange-500/20 text-orange-400 bg-orange-500/5' },
  { id: 'offer', label: 'Offer', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
  { id: 'rejected', label: 'Rejected', color: 'border-red-500/20 text-red-400 bg-red-500/5' },
];

export function TrackerClient({ initialSavedJobs }: TrackerClientProps) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(initialSavedJobs);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<SavedJob | null>(null);
  const [activeOverColumn, setActiveOverColumn] = useState<string | null>(null);

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

    // Check if stage actually changed
    const currentJob = savedJobs.find(sj => sj.job_id === jobId);
    if (currentJob?.folder === targetFolder) return;

    // Optimistically update state
    setSavedJobs(prev =>
      prev.map(sj => (sj.job_id === jobId ? { ...sj, folder: targetFolder } : sj))
    );

    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, folder: targetFolder }),
      });
      if (!res.ok) {
        // Rollback state if server error
        setSavedJobs(initialSavedJobs);
      }
    } catch (err) {
      console.error(err);
      setSavedJobs(initialSavedJobs);
    } finally {
      setDraggedJobId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 overflow-x-auto min-h-screen">
      <header className="mb-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
          <Kanban className="text-accent-500" />
          Application Pipeline
        </h1>
        <p className="text-gray-400">
          Drag and drop cards across columns to progress your job applications.
        </p>
      </header>

      {/* Kanban Board */}
      <div className="flex gap-4 min-w-[1000px] items-stretch h-[calc(100vh-200px)]">
        {COLUMNS.map((col) => {
          const colJobs = savedJobs.filter((sj) => sj.folder === col.id);
          const isOver = activeOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex-1 flex flex-col rounded-xl border p-4 transition-all duration-200 bg-bg-surface/40 min-h-[400px] ${
                isOver ? 'border-accent-500/40 bg-accent-500/5 shadow-md shadow-accent-500/5' : 'border-white/5'
              }`}
            >
              {/* Column Title */}
              <div className={`flex items-center justify-between pb-3 mb-4 border-b border-white/5 font-semibold text-xs tracking-wider uppercase ${col.color.split(' ')[1]}`}>
                <span>{col.label}</span>
                <span className="bg-white/5 px-2 py-0.5 rounded-full text-[10px]">
                  {colJobs.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                {colJobs.map((sj) => {
                  const job = sj.jobs;
                  if (!job) return null;
                  const isBeingDragged = draggedJobId === sj.job_id;

                  return (
                    <div
                      key={sj.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, sj.job_id)}
                      onClick={() => setSelectedJob(sj)}
                      className={`job-card p-4 cursor-grab active:cursor-grabbing border bg-bg-surface ${
                        isBeingDragged ? 'opacity-40 border-accent-500/20' : 'border-white/5'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-accent-500/80 bg-accent-500/5 px-2 py-0.5 rounded-full mb-2 inline-block">
                        {job.source_name}
                      </span>
                      <h4 className="text-sm font-bold text-white mb-1 hover:underline truncate" title={job.title}>
                        {job.title}
                      </h4>
                      <p className="text-gray-400 text-xs mb-3 truncate">{job.company}</p>

                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span>{job.work_mode || 'unknown'}</span>
                        {job.ctc_bucket && (
                          <span className="text-accent-500/90 font-semibold">{job.ctc_bucket} LPA</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colJobs.length === 0 && (
                  <div className="flex-1 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center p-4 text-center">
                    <span className="text-xs text-gray-600">Drag jobs here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Drawer */}
      <Drawer isOpen={selectedJob !== null} onClose={() => setSelectedJob(null)}>
        {selectedJob && (
          <div className="p-6 text-gray-200">
            <span className="text-xs font-bold text-accent-500 uppercase tracking-widest bg-accent-500/10 px-2.5 py-1 rounded-full mb-3 inline-block">
              {selectedJob.jobs.source_name}
            </span>
            <h2 className="text-2xl font-bold text-white mb-1">{selectedJob.jobs.title}</h2>
            <p className="text-gray-400 text-lg mb-4">{selectedJob.jobs.company}</p>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-white/5 p-4 rounded-xl border border-white/10 text-sm">
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-0.5">Location</span>
                <span className="text-white font-medium">{selectedJob.jobs.location?.join(', ') || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-0.5">Work Mode</span>
                <span className="text-white font-medium capitalize">{selectedJob.jobs.work_mode}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-0.5">Salary / CTC</span>
                <span className="text-white font-medium text-accent-500">
                  {selectedJob.jobs.ctc_bucket ? `${selectedJob.jobs.ctc_bucket} LPA` : 'Not Disclosed'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-0.5">Employment Type</span>
                <span className="text-white font-medium capitalize">{selectedJob.jobs.employment_type || 'Full Time'}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Stage Notes</h3>
              <textarea
                value={selectedJob.notes || ''}
                placeholder="Add notes about interviews, salary negotiation, etc."
                onChange={async (e) => {
                  const val = e.target.value;
                  setSavedJobs(prev =>
                    prev.map(sj => (sj.job_id === selectedJob.job_id ? { ...sj, notes: val } : sj))
                  );
                  setSelectedJob(prev => prev ? { ...prev, notes: val } : null);
                  // Save debounced or immediately
                  await fetch('/api/saved', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId: selectedJob.job_id, notes: val }),
                  });
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors h-24 resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={selectedJob.jobs.apply_url || selectedJob.jobs.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-accent-500 hover:bg-accent-600 text-white text-center py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                Apply Now
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
