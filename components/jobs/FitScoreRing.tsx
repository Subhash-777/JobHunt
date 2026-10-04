'use client';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function FitScoreRing({ score }: { score: number | null | undefined }) {
  const numericScore = typeof score === 'number' ? score : 0;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  const progress = useSpring(0, { stiffness: 80, damping: 20 });
  const displayScore = useTransform(progress, v => Math.round(v));
  const dashOffset = useTransform(progress, v => circumference * (1 - v / 100));

  useEffect(() => {
    progress.set(numericScore);
  }, [numericScore, progress]);

  const ringColor = numericScore >= 75 ? 'var(--success)' : numericScore >= 50 ? 'var(--accent-500)' : 'var(--text-tertiary)';

  if (score == null) {
    return (
      <div className="relative flex items-center justify-center w-11 h-11 bg-bg-elevated border border-border-subtle rounded-full text-[10px] font-mono text-text-tertiary" title="Click to compute Fit Score">
        –
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-11 h-11" title={`Fit Score: ${numericScore}%`}>
      <svg width="44" height="44" viewBox="0 0 44 44" className="absolute inset-0">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
        <motion.circle
          cx="22" cy="22" r={radius} fill="none"
          stroke={ringColor} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset, rotate: -90, transformOrigin: '50% 50%' }}
        />
      </svg>
      <motion.span className="text-xs font-semibold font-mono text-text-primary">
        {displayScore}
      </motion.span>
    </div>
  );
}
