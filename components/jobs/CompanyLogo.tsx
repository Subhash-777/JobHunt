'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface CompanyLogoProps {
  domain?: string | null;
  name: string;
  size?: number;
}

export function CompanyLogo({ domain, name, size = 36 }: CompanyLogoProps) {
  const [error, setError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : 'C';

  if (!domain || error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center font-bold text-accent-400 text-xs shrink-0 font-mono shadow-sm"
      >
        {initial}
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={`${name} logo`}
        className="w-full h-full rounded-xl object-contain bg-bg-elevated border border-border-subtle p-0.5"
        onError={() => setError(true)}
      />
    </div>
  );
}
