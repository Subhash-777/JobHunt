'use client';

import { useState } from 'react';
import { Eye, Search, Plus, Globe, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DiscoverClientProps {
  initialRequests: any[];
}

export default function DiscoverClient({ initialRequests }: DiscoverClientProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setSubmitting(true);
    try {
      let atsType = 'Custom / Web';
      const lower = url.toLowerCase();
      if (lower.includes('greenhouse.io')) atsType = 'Greenhouse ATS';
      else if (lower.includes('lever.co')) atsType = 'Lever ATS';
      else if (lower.includes('ashbyhq.com')) atsType = 'Ashby ATS';

      const newReq = {
        id: Math.random().toString(),
        url,
        ats_type: atsType,
        status: 'Queued for Scraping',
        created_at: new Date().toISOString()
      };

      setRequests([newReq, ...requests]);
      setUrl('');
      toast.success(`Company careers URL added to discovery queue (${atsType})!`);
    } catch (err) {
      toast.error('Failed to submit discovery URL.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Eye className="w-6 h-6 text-accent-500" />
          <span>Company Careers Discovery Queue</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Submit any Indian tech company's careers domain to queue automated ATS scraping.
        </p>
      </div>

      {/* Submission Card */}
      <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-3">
        <label className="block text-xs font-bold text-text-primary uppercase tracking-wider">
          Submit Careers Domain or ATS Link
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://boards.greenhouse.io/stripe or https://company.com/careers"
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl py-2.5 pl-9 pr-4 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-accent-500/20 disabled:opacity-50"
          >
            {submitting ? 'Validating...' : 'Queue Scrape'}
          </button>
        </div>
      </form>

      {/* Requests Feed */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Recent Discovery Requests</h3>
        {requests.length === 0 ? (
          <div className="py-12 text-center bg-bg-surface border border-border-subtle rounded-2xl p-6 text-xs text-text-tertiary">
            No company requests queued yet. Paste a careers URL above to queue automated crawling.
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="p-4 bg-bg-surface border border-border-subtle rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="truncate min-w-0">
                <span className="text-xs font-bold text-accent-400 truncate block">{r.url}</span>
                <span className="text-[10px] text-text-tertiary font-mono">Detected: {r.ats_type}</span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{r.status || 'Queued'}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
