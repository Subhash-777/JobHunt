'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, Sparkles, RotateCcw } from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'All', label: 'All Opportunities' },
  { id: 'Software', label: 'Software Dev' },
  { id: 'Data/ML', label: 'Data & AI' },
  { id: 'Frontend', label: 'Frontend' },
  { id: 'Backend', label: 'Backend' },
  { id: 'Internships', label: 'Internships' },
  { id: 'Remote', label: 'Remote' }
];

const TRENDING_TERMS = ['SDE', 'React', 'Python', 'Backend', 'Data Science', 'Internship'];

export function FeedFilters({ totalShown }: { totalShown?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeCategory = searchParams.get('category') || 'All';
  const ctcBucket = searchParams.get('ctc') || 'All';
  const roleCategory = searchParams.get('role') || 'All';
  const workMode = searchParams.get('work_mode') || 'All';
  const experience = searchParams.get('experience') || 'All';
  const searchQuery = searchParams.get('q') || '';
  const [draftQuery, setDraftQuery] = useState(searchQuery);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', draftQuery.trim());
  };

  const hasActiveFilters =
    activeCategory !== 'All' ||
    ctcBucket !== 'All' ||
    roleCategory !== 'All' ||
    workMode !== 'All' ||
    experience !== 'All' ||
    searchQuery !== '';

  return (
    <section className="space-y-4">
      {/* Hero Banner inspired by reference layouts */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 border border-border-subtle p-5 sm:p-7 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-accent-100 text-[11px] font-semibold text-accent-600 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>Zero-Cost AI Job Aggregator for India</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-text-primary">
              Find Your <span className="text-accent-500">Dream Job</span> in India
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
              Discover curated tech roles across Indian boards and company ATS feeds, check eligibility instantly, and sync deadlines to Google Calendar.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="Search job titles, companies, or skills (e.g. Backend, React, Cred)..."
                aria-label="Search jobs, companies, or skills"
                className="w-full bg-white border border-border-subtle hover:border-border-default focus:border-accent-500 rounded-xl py-2.5 pl-10 pr-9 text-xs sm:text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500/15 shadow-2xs transition-all"
              />
              {draftQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftQuery('');
                    updateParam('q', '');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-accent-500/20 transition-colors"
              >
                Search Jobs
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`lg:hidden p-2.5 rounded-xl border transition-colors ${
                  showMobileFilters || hasActiveFilters
                    ? 'bg-accent-50 border-accent-200 text-accent-600'
                    : 'bg-white border-border-subtle text-text-secondary hover:bg-bg-elevated'
                }`}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Trending Quick Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
            <span className="font-semibold text-text-tertiary mr-1">Trending:</span>
            {TRENDING_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setDraftQuery(term);
                  updateParam('q', term);
                }}
                className={`px-2.5 py-1 rounded-full border transition-colors ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? 'bg-accent-500 text-white border-accent-500 font-semibold'
                    : 'bg-white/90 text-text-secondary border-border-subtle hover:border-accent-200 hover:text-accent-600'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Tabs Strip */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => updateParam('category', tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                  isActive
                    ? 'bg-accent-500 text-white border-accent-500 shadow-xs shadow-accent-500/20'
                    : 'bg-white text-text-secondary border-border-subtle hover:border-border-default hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-3 text-xs text-text-secondary ml-auto">
          {typeof totalShown === 'number' && (
            <span>
              Showing <strong className="text-text-primary font-semibold">{totalShown}</strong> roles
            </span>
          )}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setDraftQuery('');
                router.push('/');
              }}
              className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Inline Filter Panel (Hidden on Desktop where Left Filter Rail is shown) */}
      {showMobileFilters && (
        <div className="lg:hidden p-4 rounded-2xl bg-white border border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shadow-sm">
          <div>
            <label htmlFor="mob-ctc" className="block text-[11px] font-semibold text-text-secondary mb-1">
              CTC Bucket
            </label>
            <select
              id="mob-ctc"
              value={ctcBucket}
              onChange={(e) => updateParam('ctc', e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2 text-text-primary"
            >
              <option value="All">All CTC Buckets</option>
              <option value="<5">Under ₹5 LPA</option>
              <option value="5-10">₹5 – ₹10 LPA</option>
              <option value="10-20">₹10 – ₹20 LPA</option>
              <option value="20+">₹20+ LPA</option>
            </select>
          </div>

          <div>
            <label htmlFor="mob-role" className="block text-[11px] font-semibold text-text-secondary mb-1">
              Role Category
            </label>
            <select
              id="mob-role"
              value={roleCategory}
              onChange={(e) => updateParam('role', e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2 text-text-primary"
            >
              <option value="All">All Roles</option>
              <option value="Frontend">Frontend Dev</option>
              <option value="Backend">Backend Dev</option>
              <option value="Fullstack">Fullstack Dev</option>
              <option value="Data">Data & ML</option>
              <option value="DevOps">DevOps & Cloud</option>
            </select>
          </div>

          <div>
            <label htmlFor="mob-mode" className="block text-[11px] font-semibold text-text-secondary mb-1">
              Work Mode
            </label>
            <select
              id="mob-mode"
              value={workMode}
              onChange={(e) => updateParam('work_mode', e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2 text-text-primary"
            >
              <option value="All">All Modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div>
            <label htmlFor="mob-exp" className="block text-[11px] font-semibold text-text-secondary mb-1">
              Experience Level
            </label>
            <select
              id="mob-exp"
              value={experience}
              onChange={(e) => updateParam('experience', e.target.value)}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2 text-text-primary"
            >
              <option value="All">All Experience</option>
              <option value="freshers">Freshers (0 yrs)</option>
              <option value="0-2">0 – 2 yrs</option>
              <option value="2-5">2 – 5 yrs</option>
            </select>
          </div>
        </div>
      )}
    </section>
  );
}
