'use client';
import React from 'react';

const SOURCE_STYLES: Record<string, string> = {
  internshala: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
  greenhouse: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  linkedin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  indeed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  unstop: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ashby: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  freshersworld: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export function SourceBadge({ source }: { source?: string | null }) {
  const norm = (source || 'verified').toLowerCase();
  const style = SOURCE_STYLES[norm] || 'bg-bg-elevated text-text-tertiary border-border-subtle';

  return (
    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style}`}>
      {norm}
    </span>
  );
}
