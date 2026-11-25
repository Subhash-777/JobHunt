'use client';
import React from 'react';
import { Clock } from 'lucide-react';

export function DeadlineCountdown({ deadline }: { deadline?: string | null }) {
  if (!deadline) {
    return (
      <span className="text-[11px] text-text-tertiary flex items-center space-x-1 font-medium">
        <Clock className="w-3.5 h-3.5 text-text-tertiary" />
        <span>Rolling</span>
      </span>
    );
  }

  const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return <span className="text-[11px] text-text-tertiary font-medium">Deadline passed</span>;
  }

  const colorClass =
    daysLeft <= 2
      ? 'text-rose-600 font-semibold'
      : daysLeft <= 6
        ? 'text-amber-600 font-semibold'
        : 'text-emerald-700 font-medium';

  return (
    <span className={`text-[11px] flex items-center space-x-1 ${colorClass}`}>
      <Clock className="w-3.5 h-3.5" />
      <span>Closes in {daysLeft}d</span>
    </span>
  );
}
