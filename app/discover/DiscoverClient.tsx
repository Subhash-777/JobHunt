'use client';

import { useState } from 'react';
import { Eye, Globe, Clock } from 'lucide-react';
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
    } catch {
      toast.error('Failed to submit discovery URL.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
          <Eye className="w-6 h-6 text-accent-500" />
          <span>Company Careers Discovery Queue</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Submit any Indian tech company&apos;s careers domain to queue automated ATS scraping.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-bg-surface border border-border-subtle shadow-2xs space-y-3">
        <label htmlFor="disc-url" className="block text-xs font-bold text-text-primary uppercase tracking-wider">
          Submit Careers Domain or ATS Link
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              id="disc-url"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://boards.greenhouse.io/razorpay or https://company.com/careers"
              className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl py-2.5 pl-9 pr-4 text-xs sm:text-sm text-text-primary focus:border-accent-500 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            {submitting ? 'Validating...' : 'Queue Scrape'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Recent Discovery Requests</h2>
        {requests.length === 0 ? (
          <div className="py-12 text-center bg-bg-surface border border-border-subtle rounded-2xl p-6 text-xs text-text-tertiary">
            No company requests queued yet. Paste a careers URL above to queue automated crawling.
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="p-4 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="truncate min-w-0">
                <span className="text-xs font-bold text-accent-600 truncate block">{r.url}</span>
                <span className="text-[11px] text-text-tertiary font-mono">Detected: {r.ats_type}</span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-50 text-accent-600 border border-accent-100 flex items-center space-x-1">
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
