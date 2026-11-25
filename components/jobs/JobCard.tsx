'use client';

import React, { useState } from 'react';
import { FitScoreRing } from './FitScoreRing';
import { CompanyLogo } from './CompanyLogo';
import { DeadlineCountdown } from './DeadlineCountdown';
import { SourceBadge } from './SourceBadge';
import { evaluateEligibility } from '@/lib/intelligence/eligibility';
import { CalendarQuickAdd } from '../shared/CalendarQuickAdd';
import {
  MapPin,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Briefcase,
  Sparkles
} from 'lucide-react';
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
  if (job.ctc_bucket && job.ctc_bucket !== 'unknown') return `${job.ctc_bucket} LPA`;
  if (job.ctc_text || job.salary_raw) return job.ctc_text || job.salary_raw;
  return 'Competitive CTC';
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
    fetch(`/api/jobs/${job.id}/click`, { method: 'POST' }).catch(() => {});
    if (job.apply_url || job.source_url) {
      window.open(job.apply_url || job.source_url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('Applying via internal portal...');
    }
  };

  return (
    <article
      onClick={onClick}
      className="job-card p-4 sm:p-5 flex flex-col justify-between cursor-pointer group relative"
    >
      {/* Top Row: Logo + Title/Company + FitScore/Match + Bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3 min-w-0">
          <CompanyLogo domain={job.company_domain} name={job.company} size={42} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[15px] font-display font-bold text-text-primary group-hover:text-accent-600 transition-colors line-clamp-2 leading-snug tracking-tight">
                {job.title}
              </h2>
            </div>
            <p className="text-xs font-medium text-text-secondary truncate mt-0.5">
              {job.company}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          <FitScoreRing score={fitScore} />
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
              saved
                ? 'text-accent-600 bg-accent-50 border-accent-200'
                : 'text-text-tertiary border-transparent hover:text-text-primary hover:bg-bg-elevated'
            }`}
            title={saved ? 'Remove bookmark' : 'Save job'}
            aria-label={saved ? 'Remove bookmark' : 'Save job'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-accent-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metadata Pills Row */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-secondary mt-3.5">
        <span className="inline-flex items-center space-x-1 bg-bg-elevated px-2.5 py-1 rounded-lg font-medium">
          <MapPin className="w-3 h-3 text-text-tertiary shrink-0" />
          <span className="truncate max-w-[140px]">
            {Array.isArray(job.location) && job.location.length > 0
              ? job.location.join(', ')
              : job.location_raw || 'India (Remote/Hybrid)'}
          </span>
        </span>
        {job.work_mode && job.work_mode.toLowerCase() !== 'unknown' && (
          <span className="capitalize px-2.5 py-1 rounded-lg bg-bg-elevated font-medium">
            {job.work_mode}
          </span>
        )}
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-bg-elevated font-medium">
          <Briefcase className="w-3 h-3 text-text-tertiary shrink-0" />
          <span>{job.experience_max != null ? `0–${job.experience_max} yrs` : '0–2 yrs / Fresher'}</span>
        </span>
      </div>

      {/* Compensation + Optional Match / Gem Strip */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          {ctcDisplay}
        </span>

        {isHiddenGem && (
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-accent-600 bg-accent-50 border border-accent-100 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>{fitScore ? `${fitScore}% Match` : 'Top Pick'}</span>
          </span>
        )}
      </div>

      {/* Skills Row */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {(job.key_skills && job.key_skills.length > 0 ? job.key_skills : ['Engineering', 'Software', 'Problem Solving'])
          .slice(0, 4)
          .map((skill: string, idx: number) => (
            <span
              key={idx}
              className="bg-bg-elevated border border-border-subtle text-text-secondary text-[11px] font-medium px-2 py-0.5 rounded-md"
            >
              {skill}
            </span>
          ))}
      </div>

      {/* Eligibility & Source Footer */}
      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border-subtle text-[11px]">
        {eligibility.status === 'eligible' && (
          <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Eligible</span>
          </span>
        )}
        {eligibility.status === 'partial' && (
          <span className="inline-flex items-center space-x-1 text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            <span>Partial Match</span>
          </span>
        )}
        {eligibility.status === 'high_bar' && (
          <span className="inline-flex items-center space-x-1 text-text-secondary font-medium bg-bg-elevated border border-border-subtle px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-text-tertiary" />
            <span>High Bar</span>
          </span>
        )}
        {eligibility.status === 'unknown' && (
          <span className="inline-flex items-center space-x-1 text-text-tertiary font-medium bg-bg-elevated border border-border-subtle px-2.5 py-0.5 rounded-full">
            <span>Verify Eligibility</span>
          </span>
        )}

        <SourceBadge source={job.source_name} />
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between mt-3 pt-2">
        <div className="flex items-center space-x-2">
          <CalendarQuickAdd job={job} />
          <DeadlineCountdown deadline={job.deadline} />
        </div>

        <button
          onClick={handleApply}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-accent-500 hover:bg-accent-600 px-3.5 py-2 rounded-xl transition-colors shadow-xs shadow-accent-500/20"
        >
          <span>Apply Now</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}
