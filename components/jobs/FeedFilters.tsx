'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Filter, X } from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'All', label: 'All Jobs' },
  { id: 'Software', label: 'Software' },
  { id: 'Data/ML', label: 'Data & AI' },
  { id: 'Design', label: 'Design' },
  { id: 'Product', label: 'Product' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Internships', label: 'Internships' },
  { id: 'Remote', label: 'Remote' }
];

export function FeedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeCategory = searchParams.get('category') || 'All';
  const ctcBucket = searchParams.get('ctc') || 'All';
  const roleCategory = searchParams.get('role') || 'All';
  const workMode = searchParams.get('work_mode') || 'All';
  const experience = searchParams.get('experience') || 'All';
  const searchQuery = searchParams.get('q') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <section className="mb-6 space-y-4">
      {/* Category Tabs Row (Horizontal scroll on mobile, zero scrollbar) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => updateParam('category', tab.id)}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-accent-400 bg-accent-500/10 border border-accent-500/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-category-tab"
                  className="absolute inset-0 bg-accent-500/15 border border-accent-500/40 rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="Search title, skills, or company..."
            className="w-full bg-bg-surface border border-border-subtle hover:border-border-default focus:border-accent-500 rounded-xl py-2 pl-9 pr-4 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => updateParam('q', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* CTC Bucket Dropdown */}
        <select
          value={ctcBucket}
          onChange={(e) => updateParam('ctc', e.target.value)}
          className="bg-bg-surface border border-border-subtle hover:border-border-default focus:border-accent-500 rounded-xl py-2 px-3 text-xs text-text-secondary focus:outline-none transition-colors cursor-pointer"
        >
          <option value="All">CTC: All Buckets</option>
          <option value="0-6">Under ₹6 LPA</option>
          <option value="6-12">₹6 - ₹12 LPA</option>
          <option value="12-25">₹12 - ₹25 LPA</option>
          <option value="25+">₹25+ LPA</option>
        </select>

        {/* Role Category Dropdown */}
        <select
          value={roleCategory}
          onChange={(e) => updateParam('role', e.target.value)}
          className="bg-bg-surface border border-border-subtle hover:border-border-default focus:border-accent-500 rounded-xl py-2 px-3 text-xs text-text-secondary focus:outline-none transition-colors cursor-pointer"
        >
          <option value="All">Role: All</option>
          <option value="Frontend">Frontend Dev</option>
          <option value="Backend">Backend Dev</option>
          <option value="Fullstack">Fullstack Dev</option>
          <option value="Data">Data & ML</option>
          <option value="DevOps">DevOps & Cloud</option>
        </select>

        {/* Work Mode Dropdown */}
        <select
          value={workMode}
          onChange={(e) => updateParam('work_mode', e.target.value)}
          className="hidden sm:block bg-bg-surface border border-border-subtle hover:border-border-default focus:border-accent-500 rounded-xl py-2 px-3 text-xs text-text-secondary focus:outline-none transition-colors cursor-pointer"
        >
          <option value="All">Mode: All</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-site</option>
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`p-2 rounded-xl border transition-colors ${
            showAdvanced || workMode !== 'All' || experience !== 'All'
              ? 'bg-accent-500/10 border-accent-500/40 text-accent-400'
              : 'bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default'
          }`}
          title="Toggle Filter Sheet"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Advanced Filters Row */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-2xl bg-bg-surface/80 border border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
        >
          <div>
            <label className="block text-[11px] text-text-tertiary mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => updateParam('work_mode', e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg p-2 text-text-secondary"
            >
              <option value="All">All Modes</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">In-Office / Onsite</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-text-tertiary mb-1">Experience Level</label>
            <select
              value={experience}
              onChange={(e) => updateParam('experience', e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg p-2 text-text-secondary"
            >
              <option value="All">All Experience</option>
              <option value="freshers">Freshers (0 yrs)</option>
              <option value="0-2">0 - 2 yrs (Junior)</option>
              <option value="2-5">2 - 5 yrs (Mid-level)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                router.push('/');
                setShowAdvanced(false);
              }}
              className="w-full p-2 rounded-lg bg-bg-elevated hover:bg-bg-border text-text-secondary text-center"
            >
              Reset All Filters
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
