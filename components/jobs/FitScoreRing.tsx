'use client';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function FitScoreRing({ score }: { score: number | null | undefined }) {
  const numericScore = typeof score === 'number' ? score : 0;
  const radius = 17;
  const circumference = 2 * Math.PI * radius;

  const progress = useSpring(0, { stiffness: 80, damping: 20 });
  const displayScore = useTransform(progress, v => Math.round(v));
  const dashOffset = useTransform(progress, v => circumference * (1 - v / 100));

  useEffect(() => {
    progress.set(numericScore);
  }, [numericScore, progress]);

  const ringColor =
    numericScore >= 75
      ? '#059669'
      : numericScore >= 50
        ? '#2563EB'
        : '#94A3B8';

  if (score == null) {
    return (
      <div
        className="relative flex items-center justify-center w-10 h-10 bg-bg-elevated border border-border-subtle rounded-full text-[10px] font-mono text-text-tertiary"
        title="Sign in & complete profile to compute Fit Score"
      >
        –
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-10 h-10 shrink-0" title={`AI Match Score: ${numericScore}%`}>
      <svg width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="3" />
        <motion.circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset, rotate: -90, transformOrigin: '50% 50%' }}
        />
      </svg>
      <motion.span className="text-[11px] font-bold font-mono text-text-primary">
        {displayScore}
      </motion.span>
    </div>
  );
}
