'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Bookmark,
  Kanban,
  Eye,
  TrendingUp,
  GraduationCap,
  FileText,
  FileCode,
  Map,
  Users,
  Code2,
  Share2,
  Building2,
  LayoutDashboard,
  User,
  Calendar as CalendarIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Trophy,
  ShieldCheck,
  Rss
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'DISCOVER',
    items: [
      { label: 'Feed', href: '/', icon: Briefcase },
      { label: 'Watchlists', href: '/watchlists', icon: Eye },
      { label: 'Saved', href: '/saved', icon: Bookmark },
      { label: 'Tracker', href: '/tracker', icon: Kanban }
    ]
  },
  {
    label: 'INSIGHTS',
    items: [
      { label: 'Market Intel.', href: '/insights', icon: TrendingUp },
      { label: 'Placement Season', href: '/placement', icon: GraduationCap, badge: 'HOT' }
    ]
  },
  {
    label: 'AI TOOLS',
    items: [
      { label: 'Cover Letter', href: '/ai/cover-letter', icon: FileText },
      { label: 'Resume Lab', href: '/resume-lab', icon: FileCode },
      { label: 'Skill Roadmap', href: '/ai/roadmap', icon: Map }
    ]
  },
  {
    label: 'COMMUNITY',
    items: [
      { label: 'Interviews', href: '/community/interview', icon: Users },
      { label: 'OA Tracker', href: '/community/oa-tracker', icon: Code2 },
      { label: 'Referrals', href: '/community/referrals', icon: Share2 },
      { label: 'PPO Tracker', href: '/community/ppo', icon: Trophy },
      { label: 'Campus Drives', href: '/community/drives', icon: Building2 },
      { label: 'For Recruiters', href: '/recruiter', icon: ShieldCheck, badge: 'NEW' }
    ]
  },
  {
    label: 'PERSONAL',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Profile', href: '/profile', icon: User },
      { label: 'Calendar', href: '/calendar', icon: CalendarIcon },
      { label: 'Settings', href: '/settings', icon: Settings }
    ]
  }
];

export default function Sidebar({ userProfile }: { userProfile?: any }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden sm:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-bg-surface border-r border-border-subtle transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border-subtle">
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-600 to-accent-400 flex items-center justify-center font-bold text-white text-sm shadow-sm">
              JH
            </div>
            <span className="font-semibold text-text-primary text-sm tracking-tight">
              JobHunt <span className="text-accent-500 font-mono text-xs">IN</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-semibold text-text-tertiary tracking-wider uppercase">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-accent-500 bg-accent-500/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-indicator"
                      className="absolute left-0 top-1 bottom-1 w-1 bg-accent-500 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-500' : 'text-text-tertiary'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-500/20 text-accent-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile Mini Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-border-subtle bg-bg-base/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-text-primary truncate">
                {userProfile?.full_name || 'Student Candidate'}
              </p>
              <div className="flex items-center space-x-1 text-[10px] text-text-tertiary">
                <Flame className="w-3 h-3 text-accent-500 fill-accent-500/20" />
                <span>{userProfile?.current_streak || 1} day streak</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
