'use client';
import React from 'react';
import { Clock } from 'lucide-react';

export function DeadlineCountdown({ deadline }: { deadline?: string | null }) {
  if (!deadline) {
    return (
      <span className="text-[10px] text-text-tertiary flex items-center space-x-1 font-mono">
        <Clock className="w-3 h-3 text-text-tertiary" />
        <span>Closes in 7d</span>
      </span>
    );
  }

  const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return <span className="text-[10px] text-text-tertiary font-mono">Deadline passed</span>;
  }

  const colorClass = daysLeft <= 2 ? 'text-red-400 font-bold' : daysLeft <= 6 ? 'text-amber-400 font-semibold' : 'text-emerald-400';

  return (
    <span className={`text-[10px] flex items-center space-x-1 font-mono ${colorClass}`}>
      <Clock className="w-3 h-3" />
      <span>Closes in {daysLeft}d</span>
    </span>
  );
}
