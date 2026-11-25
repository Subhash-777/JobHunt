'use client';
import React, { useState } from 'react';

interface CompanyLogoProps {
  domain?: string | null;
  name: string;
  size?: number;
}

export function CompanyLogo({ domain, name, size = 40 }: CompanyLogoProps) {
  const [error, setError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : 'C';

  if (!domain || error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center font-display font-bold text-accent-600 text-sm shrink-0"
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
        className="w-full h-full rounded-xl object-contain bg-white border border-border-subtle p-1"
        onError={() => setError(true)}
      />
    </div>
  );
}
