'use client';
import React from 'react';

const SOURCE_STYLES: Record<string, string> = {
  internshala: 'bg-blue-50 text-blue-700 border-blue-200',
  greenhouse: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  linkedin: 'bg-sky-50 text-sky-700 border-sky-200',
  indeed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  unstop: 'bg-violet-50 text-violet-700 border-violet-200',
  ashby: 'bg-amber-50 text-amber-700 border-amber-200',
  freshersworld: 'bg-teal-50 text-teal-700 border-teal-200',
  lever: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function SourceBadge({ source }: { source?: string | null }) {
  const norm = (source || 'verified').toLowerCase();
  const style = SOURCE_STYLES[norm] || 'bg-bg-elevated text-text-secondary border-border-subtle';

  return (
    <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style}`}>
      {norm}
    </span>
  );
}
