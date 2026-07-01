'use client';

import { useState } from 'react';
import { Bookmark, Trash2, Folder, ExternalLink, Calendar, PlusCircle } from 'lucide-react';
import { NormalizedJob } from '@/scripts/ingest/types';
import { Drawer } from '@/components/shared/Drawer';

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
        const updated = await res.json();
        setSavedJobs(prev =>
          prev.map(sj => (sj.job_id === jobId ? { ...sj, folder: newFolder } : sj))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this job from your saved list?')) return;
    try {
      const res = await fetch(`/api/saved?jobId=${jobId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSavedJobs(prev => prev.filter(sj => sj.job_id !== jobId));
        if (selectedJob?.job_id === jobId) {
          setSelectedJob(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
          <Bookmark className="text-accent-500" />
          Job Shortlists & Tracking
        </h1>
        <p className="text-gray-400">
          Manage your pipeline from initial bookmark to interviews and offers.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-4">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFolder(f.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-150 ${
              activeFolder === f.id
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/10'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {f.label} ({f.id === 'all' ? savedJobs.length : savedJobs.filter(sj => sj.folder === f.id).length})
          </button>
        ))}
      </div>

      {/* List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
          <Folder className="mx-auto text-gray-600 mb-3" size={40} />
          <h3 className="text-lg font-medium text-white mb-1">No jobs in this section</h3>
          <p className="text-gray-400 text-sm">
            Jobs you shortlist or track will appear here. Go to the feed to save some!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((sj) => {
            const job = sj.jobs;
            if (!job) return null;
            return (
              <div
                key={sj.id}
                className="job-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedJob(sj)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-accent-500 bg-accent-500/10 px-2 py-0.5 rounded-full">
                      {job.source_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      Saved {new Date(sj.saved_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white hover:underline">{job.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{job.company}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {job.location && job.location.length > 0 && (
                      <span>📍 {job.location.join(', ')}</span>
                    )}
                    {job.work_mode && <span>• {job.work_mode}</span>}
                    {job.employment_type && <span>• {job.employment_type}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest">Stage</label>
                    <select
                      value={sj.folder}
                      disabled={isUpdating === sj.job_id}
                      onChange={(e) => handleUpdateFolder(sj.job_id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-md py-1 px-3 text-xs text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
                    >
                      <option value="shortlisted">Shortlist</option>
                      <option value="applied">Applied</option>
                      <option value="oa">Online Assess.</option>
                      <option value="interview">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleRemove(sj.job_id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors mt-4 md:mt-0"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simplified job details trigger inside drawer */}
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
                <span className="text-white font-medium">
                  {selectedJob.jobs.ctc_bucket ? `${selectedJob.jobs.ctc_bucket} LPA` : 'Not Disclosed'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-0.5">Employment Type</span>
                <span className="text-white font-medium capitalize">{selectedJob.jobs.employment_type || 'Full Time'}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Description</h3>
              <div className="text-sm text-gray-300 leading-relaxed max-h-[300px] overflow-y-auto pr-2 bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-line">
                {selectedJob.jobs.description || 'No description provided.'}
              </div>
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
              <button
                onClick={() => handleRemove(selectedJob.job_id)}
                className="w-full border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 py-2.5 rounded-lg text-sm transition-all"
              >
                Delete Bookmark
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
