'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FitScoreRing } from './FitScoreRing';
import { CompanyLogo } from './CompanyLogo';
import { DeadlineCountdown } from './DeadlineCountdown';
import { SourceBadge } from './SourceBadge';
import { evaluateEligibility } from '@/lib/intelligence/eligibility';
import { CalendarQuickAdd } from '../shared/CalendarQuickAdd';
import { MapPin, Bookmark, ExternalLink, Flame, CheckCircle2, AlertTriangle, XCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export interface JobCardProps {
  job: any;
  userProfile?: any;
  onClick?: () => void;
  onSaveToggle?: (jobId: string, saved: boolean) => void;
  isSaved?: boolean;
}

export function formatCompensation(job: any): string {
  if (job.ctc_max) return `₹${job.ctc_min ?? 0}–${job.ctc_max} LPA`;
  if (job.stipend_max) return `₹${(job.stipend_min ?? 0).toLocaleString('en-IN')}–${job.stipend_max.toLocaleString('en-IN')}/mo`;
  if (job.ctc_bucket && job.ctc_bucket !== 'unknown') return `CTC: ${job.ctc_bucket} LPA`;
  if (job.ctc_text || job.salary_raw) return job.ctc_text || job.salary_raw;
  return '₹8.5L - ₹14L PA (Estimated)';
}

export function JobCard({ job, userProfile, onClick, onSaveToggle, isSaved: initialSaved = false }: JobCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const fitScore = job.fitScore ?? null;
  const isHiddenGem = (fitScore && fitScore >= 80) || (job.hidden_gem_score && job.hidden_gem_score >= 70);

  const eligibility = evaluateEligibility(job, userProfile);
  const ctcDisplay = formatCompensation(job);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !saved;
    setSaved(nextSaved);
    if (onSaveToggle) {
      onSaveToggle(job.id, nextSaved);
    } else {
      toast.success(nextSaved ? 'Job saved to bookmarks' : 'Job removed from bookmarks');
    }
  };

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Log apply click in background
    fetch(`/api/jobs/${job.id}/click`, { method: 'POST' }).catch(() => {});
    if (job.apply_url || job.source_url) {
      window.open(job.apply_url || job.source_url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('Applying via internal portal...');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="bg-bg-surface hover:bg-bg-elevated border border-border-subtle hover:border-border-default rounded-[14px] p-4 flex flex-col justify-between cursor-pointer group transition-all shadow-sm hover:shadow-accent-500/5 relative overflow-hidden"
    >
      {/* ROW 1: [Company Logo 36px] [Title] [FitScoreRing] [🔥 Gem] */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          <CompanyLogo domain={job.company_domain} name={job.company} size={36} />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-400 transition-colors line-clamp-1 tracking-tight">
              {job.title}
            </h3>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {job.company}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {isHiddenGem && (
            <span className="p-1 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20" title="Hidden Gem - High Match">
              <Flame className="w-3.5 h-3.5 fill-accent-500/20" />
            </span>
          )}
          <FitScoreRing score={fitScore} />
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
              saved
                ? 'text-accent-500 bg-accent-500/10 border border-accent-500/30'
                : 'text-text-tertiary hover:text-text-primary hover:bg-bg-elevated'
            }`}
            title={saved ? 'Remove bookmark' : 'Bookmark job'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-accent-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ROW 2: Location · Work Mode · Experience */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-secondary mt-3">
        <span className="flex items-center space-x-1 bg-bg-elevated px-2 py-0.5 rounded-md border border-border-subtle">
          <MapPin className="w-3 h-3 text-text-tertiary" />
          <span className="truncate max-w-[120px]">
            {Array.isArray(job.location) ? job.location.join(', ') : job.location_raw || 'India (Remote/Hybrid)'}
          </span>
        </span>
        {job.work_mode && (
          <span className="capitalize px-2 py-0.5 rounded-md bg-bg-elevated border border-border-subtle">
            {job.work_mode}
          </span>
        )}
        <span className="px-2 py-0.5 rounded-md bg-bg-elevated border border-border-subtle">
          {job.experience_max != null ? `0-${job.experience_max} yrs` : 'Freshers / 0-2 yrs'}
        </span>
      </div>

      {/* ROW 3: CTC / Stipend */}
      {ctcDisplay && (
        <div className="mt-2.5 text-xs font-medium text-emerald-400 flex items-center space-x-1.5">
          <span className="text-[11px] text-text-tertiary font-mono">CTC:</span>
          <span className="tracking-tight">{ctcDisplay}</span>
        </div>
      )}

      {/* ROW 4: Skill Chips */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {(job.key_skills || ['React', 'TypeScript', 'Node.js', 'Python']).slice(0, 4).map((skill: string, idx: number) => (
          <span
            key={idx}
            className="bg-bg-elevated border border-border-default text-text-secondary text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-[4px]"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* ROW 5: Eligibility Badge + Source Badge */}
      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-border-subtle text-[11px]">
        {eligibility.status === 'eligible' && (
          <span className="flex items-center space-x-1 text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Eligible</span>
          </span>
        )}
        {eligibility.status === 'partial' && (
          <span className="flex items-center space-x-1 text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            <span>Partial Match</span>
          </span>
        )}
        {eligibility.status === 'high_bar' && (
          <span className="flex items-center space-x-1 text-text-tertiary font-medium bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            <span>High Bar</span>
          </span>
        )}
        {eligibility.status === 'unknown' && (
          <span className="flex items-center space-x-1 text-text-tertiary font-medium bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded-full">
            <span>Verify Eligibility</span>
          </span>
        )}

        <SourceBadge source={job.source_name} />
      </div>

      {/* ROW 6: Deadline + Calendar + Apply */}
      <div className="flex items-center justify-between mt-3 pt-2">
        <div className="flex items-center space-x-2">
          <CalendarQuickAdd job={job} />
          <DeadlineCountdown deadline={job.deadline} />
        </div>

        <button
          onClick={handleApply}
          className="flex items-center space-x-1 text-xs font-semibold text-white bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 px-3 py-1.5 rounded-xl transition-all shadow-sm shadow-accent-500/20 min-h-[36px]"
        >
          <span>Apply</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
