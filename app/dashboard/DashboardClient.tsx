'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Target, Sparkles, Clock, CheckCircle2, TrendingUp, Calendar, ArrowRight, Kanban, Award
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

  // Filter AI usage by provider
  const groqCalls = aiUsage.filter(a => a.provider === 'groq').length;
  const openRouterCalls = aiUsage.filter(a => a.provider === 'openrouter').length;
  const geminiCalls = aiUsage.filter(a => a.provider === 'gemini').length;

  return (
    <div className="w-full space-y-6">
      {/* Welcome Banner */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Welcome back, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Candidate'}!
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Here is your daily career intelligence, streak momentum, and application quota breakdown.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white text-xs font-bold rounded-xl shadow-md shadow-accent-500/20 transition-all flex items-center space-x-1.5"
          >
            <span>Explore Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid Row 1: Streak Card + Weekly Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak Card */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Application Streak</span>
            <span className="text-[10px] font-bold text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full uppercase">
              Active Streak
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center text-accent-400 shrink-0">
              <Flame className="w-8 h-8 fill-accent-500" />
            </div>
            <div>
              <div className="text-3xl font-extrabold font-mono text-text-primary">
                {currentStreak} <span className="text-sm font-normal text-text-secondary">days</span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Longest streak: <strong className="text-text-primary">{profile?.longest_streak || currentStreak} days</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Goal Progress Bar */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Weekly Application Goal</span>
            <span className="text-xs font-mono font-bold text-accent-400">{activityCount} / {weeklyGoal} Roles</span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-gradient-to-r from-accent-600 to-accent-400 transition-all duration-300"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary">
              {weeklyProgress >= 100 ? '🎉 Weekly goal completed!' : `${weeklyGoal - activityCount} more applications to hit your weekly target.`}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Row 2: AI Quota Monitor & Upcoming Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Free Tier Quotas */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-500" /> AI Cascade Quota Monitor (24h)
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
              100% Free Tier
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-text-secondary mb-1">
                <span>Groq API (gpt-oss-20b)</span>
                <span className="font-mono text-text-primary">{groqCalls} / 14,000 calls</span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min((groqCalls / 14000) * 100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-text-secondary mb-1">
                <span>OpenRouter Free Gateway</span>
                <span className="font-mono text-text-primary">{openRouterCalls} / 180 calls</span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-accent-500" style={{ width: `${Math.min((openRouterCalls / 180) * 100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-text-secondary mb-1">
                <span>Google Gemini 3.5 Flash</span>
                <span className="font-mono text-text-primary">{geminiCalls} / 900 calls</span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${Math.min((geminiCalls / 900) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Saved Jobs / Deadlines */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent-500" /> Recent Saved Deadlines
            </span>
            <Link href="/saved" className="text-xs text-accent-400 hover:underline">
              View All ({savedJobs.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {savedJobs.slice(0, 4).map((sj, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-bg-elevated rounded-xl border border-border-subtle text-xs">
                <div className="truncate min-w-0 pr-2">
                  <h4 className="font-bold text-text-primary truncate">{sj.jobs?.title || 'Saved Position'}</h4>
                  <p className="text-[11px] text-text-secondary truncate">{sj.jobs?.company}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded border border-accent-500/20 shrink-0">
                  {sj.folder?.toUpperCase()}
                </span>
              </div>
            ))}

            {savedJobs.length === 0 && (
              <p className="text-xs text-text-tertiary text-center py-6">No active saved deadlines.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
