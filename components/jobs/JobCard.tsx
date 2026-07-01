'use client';
import { NormalizedJob } from '@/scripts/ingest/types';
import { FitScoreRing } from './FitScoreRing';
import { CalendarQuickAdd } from '../shared/CalendarQuickAdd';
import { MapPin, Building, Clock, Users } from 'lucide-react';

// Using NormalizedJob directly for MVP. In production, this would be a DB `Job` type.
export function JobCard({ job, onClick }: { job: NormalizedJob, onClick?: () => void }) {
  // Load computed fit score from prop, fallback to 50
  const fitScore = (job as any).fitScore ?? 50; 
  const crowding = 'High';
  const reliability = 'Cross-Verified';
  
  return (
    <div 
      className="job-card p-5 flex flex-col gap-3 cursor-pointer group w-full"
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-accent-500 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
            <Building size={14} />
            <span>{job.company}</span>
            {job.location_raw && (
              <>
                <span className="text-gray-600">•</span>
                <MapPin size={14} />
                <span className="line-clamp-1">{job.location_raw}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <FitScoreRing score={fitScore} />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        {job.work_mode !== 'unknown' && (
          <span className="px-2 py-1 bg-white/5 text-gray-300 rounded-md capitalize">
            {job.work_mode}
          </span>
        )}
        {job.employment_type !== 'unknown' && job.employment_type && (
          <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300 capitalize">
            {job.employment_type.replace('_', ' ')}
          </span>
        )}
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md">
          {job.is_early_applicant ? 'Early Applicant' : 'Active'}
        </span>
      </div>

      {/* Tier-2 Disclosure Row: Animates in on hover (Section 23.1, 39.1) */}
      <div className="job-card__tier2-row flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users size={12} className={crowding === 'High' ? 'text-orange-400' : 'text-gray-400'}/>
            {crowding} Competition
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {reliability}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {job.posted_at && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(job.posted_at).toLocaleDateString()}
            </span>
          )}
          <CalendarQuickAdd job={job} />
        </div>
      </div>
    </div>
  );
}
