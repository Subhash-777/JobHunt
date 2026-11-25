'use client';

import React from 'react';
import {
  Flame,
  Sparkles,
  Calendar,
  ArrowRight,
  Bookmark,
  Send,
  Users,
  Trophy,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface DashboardClientProps {
  profile: any;
  aiUsage: any[];
  savedJobs: any[];
  activityCount: number;
}

export default function DashboardClient({ profile, aiUsage, savedJobs, activityCount }: DashboardClientProps) {
  const currentStreak = profile?.current_streak || 1;
  const weeklyGoal = profile?.weekly_goal || 10;
  const weeklyProgress = Math.min(Math.round((activityCount / weeklyGoal) * 100), 100);

  const groqCalls = aiUsage.filter(a => a.provider === 'groq').length;
  const openRouterCalls = aiUsage.filter(a => a.provider === 'openrouter').length;
  const geminiCalls = aiUsage.filter(a => a.provider === 'gemini').length;

  const shortlistedCount = savedJobs.filter(s => s.folder === 'shortlisted').length;
  const appliedCount = savedJobs.filter(s => s.folder === 'applied').length;
  const interviewCount = savedJobs.filter(s => s.folder === 'interview' || s.folder === 'oa').length;
  const offerCount = savedJobs.filter(s => s.folder === 'offer').length;

  const profileFields = [
    profile?.full_name,
    profile?.college,
    profile?.cgpa,
    profile?.graduation_year,
    profile?.skills?.length > 0,
    profile?.github_url || profile?.linkedin_url,
  ];
  const profileStrength = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  const pipelineSteps = [
    { label: 'Shortlisted', count: shortlistedCount, active: shortlistedCount > 0 },
    { label: 'Applied', count: appliedCount, active: appliedCount > 0 },
    { label: 'Interview / OA', count: interviewCount, active: interviewCount > 0 },
    { label: 'Offer', count: offerCount, active: offerCount > 0 },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Greeting & Streak Banner */}
      <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 border border-border-subtle rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">
            Hello, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Candidate'}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Your career momentum, application pipeline, and free AI quotas in one view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{currentStreak} Day Streak</span>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold rounded-xl shadow-xs shadow-accent-500/20 transition-colors flex items-center space-x-1.5"
          >
            <span>Explore Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 KPI Summary Cards (Image 1/3/5 Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center text-accent-600 shrink-0">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-tertiary uppercase">Saved Roles</p>
            <p className="text-2xl font-display font-extrabold text-text-primary">{savedJobs.length}</p>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-tertiary uppercase">Applied</p>
            <p className="text-2xl font-display font-extrabold text-text-primary">{appliedCount}</p>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-tertiary uppercase">OA & Interviews</p>
            <p className="text-2xl font-display font-extrabold text-text-primary">{interviewCount}</p>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-tertiary uppercase">Profile Strength</p>
            <p className="text-2xl font-display font-extrabold text-emerald-700">{profileStrength}%</p>
          </div>
        </div>
      </div>

      {/* Horizontal Application Pipeline Stepper + Weekly Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-display font-bold text-text-primary">Your Application Progress</h2>
            <Link href="/tracker" className="text-xs font-semibold text-accent-600 hover:underline flex items-center gap-1">
              <span>Open Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {pipelineSteps.map((step, i) => (
              <div key={step.label} className="relative flex flex-col items-center text-center">
                {i < pipelineSteps.length - 1 && (
                  <div className="hidden sm:block absolute top-4 left-1/2 w-full h-0.5 bg-border-subtle -z-0" />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                    step.active
                      ? 'bg-accent-500 text-white border-accent-500 shadow-xs'
                      : 'bg-bg-elevated text-text-tertiary border-border-subtle'
                  }`}
                >
                  {step.active ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-semibold text-text-primary mt-2">{step.label}</span>
                <span className="text-[11px] text-text-tertiary font-mono">{step.count} roles</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Weekly Goal</h2>
            <span className="text-xs font-mono font-bold text-accent-600 bg-accent-50 border border-accent-100 px-2.5 py-0.5 rounded-full">
              {activityCount} / {weeklyGoal} Roles
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-accent-500 rounded-full transition-all duration-300"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary">
              {weeklyProgress >= 100
                ? 'Weekly application goal achieved!'
                : `${weeklyGoal - activityCount} more roles to hit your weekly target.`}
            </p>
          </div>

          <Link
            href="/profile"
            className="text-xs font-semibold text-accent-600 hover:text-accent-700 inline-flex items-center gap-1"
          >
            <span>Edit goal & profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Grid: AI Quota Monitor + Recent Saved + Free Resume Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Free Tier Quotas */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-500" /> AI Cascade Quota (24h)
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
              Free Tier
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-text-secondary mb-1">
                <span>Groq (Llama 3.3 70B)</span>
                <span className="font-mono font-semibold text-text-primary">{groqCalls} / 14,000</span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((groqCalls / 14000) * 100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-text-secondary mb-1">
                <span>OpenRouter Free</span>
                <span className="font-mono font-semibold text-text-primary">{openRouterCalls} / 180</span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-accent-500 rounded-full" style={{ width: `${Math.min((openRouterCalls / 180) * 100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-text-secondary mb-1">
                <span>Google Gemini Flash</span>
                <span className="font-mono font-semibold text-text-primary">{geminiCalls} / 900</span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((geminiCalls / 900) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Saved Jobs / Deadlines */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent-500" /> Recent Saved Roles
            </span>
            <Link href="/saved" className="text-xs font-semibold text-accent-600 hover:underline">
              View All ({savedJobs.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {savedJobs.slice(0, 4).map((sj, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-bg-base rounded-xl border border-border-subtle text-xs">
                <div className="truncate min-w-0 pr-2">
                  <h3 className="font-semibold text-text-primary truncate">{sj.jobs?.title || 'Saved Position'}</h3>
                  <p className="text-[11px] text-text-secondary truncate">{sj.jobs?.company}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-md border border-accent-100 shrink-0">
                  {sj.folder?.toUpperCase()}
                </span>
              </div>
            ))}

            {savedJobs.length === 0 && (
              <p className="text-xs text-text-tertiary text-center py-6">No saved jobs yet. Bookmark roles from the feed.</p>
            )}
          </div>
        </div>

        {/* Free AI Resume Lab Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-white border border-indigo-100 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white border border-indigo-100 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Free Career Tools
            </span>
            <h2 className="text-base font-display font-bold text-text-primary">
              Analyse & Tailor Your Resume
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Upload multiple PDF versions in Resume Lab, measure conversion rates, and tailor bullets for target roles with zero fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/resume-lab"
              className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Resume Lab</span>
            </Link>
            <Link
              href="/ai/cover-letter"
              className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-bg-elevated text-text-primary border border-border-subtle text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Cover Letter</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
