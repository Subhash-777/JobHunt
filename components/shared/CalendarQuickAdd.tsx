'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CalendarPlus, Check } from 'lucide-react';
import { NormalizedJob } from '@/scripts/ingest/types';

function buildQuickAddUrl(job: NormalizedJob): string {
  const deadline = job.deadline_raw || (job as any).deadline;
  if (!deadline) return '';
  const start = new Date(deadline);
  const end = new Date(start.getTime() + 30 * 60000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Apply: ${job.title} @ ${job.company}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Apply at: ${job.apply_url || job.source_url}\n\nAdded via JobHunt India.`,
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

export function CalendarQuickAdd({ job }: { job: NormalizedJob }) {
  const [state, setState] = useState<'idle' | 'success'>('idle');
  const deadline = job.deadline_raw || (job as any).deadline;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deadline) return;

    window.open(buildQuickAddUrl(job), '_blank');
    setState('success');
    setTimeout(() => setState('idle'), 1500);
  };

  if (!deadline) return null;

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg border border-border-subtle bg-white hover:bg-accent-50 hover:border-accent-200 transition-colors relative"
      aria-label="Add deadline to Google Calendar"
      title="Add deadline to Google Calendar"
    >
      <AnimatePresence mode="wait">
        {state === 'idle' ? (
          <motion.div key="icon" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <CalendarPlus size={16} className="text-text-secondary hover:text-accent-600 transition-colors" />
          </motion.div>
        ) : (
          <motion.div key="check" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
            <Check size={16} className="text-emerald-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
