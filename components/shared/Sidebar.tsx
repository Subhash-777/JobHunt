'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  Bookmark,
  Kanban,
  Eye,
  TrendingUp,
  GraduationCap,
  FileText,
  FileCode,
  Sparkles,
  Users,
  Code2,
  Share2,
  Building2,
  LayoutDashboard,
  User,
  Flame,
  Trophy,
  ShieldCheck,
  Compass,
  X
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeTone?: 'emerald' | 'amber';
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Discover',
    items: [
      { label: 'Job Feed', href: '/', icon: Briefcase },
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Tracker', href: '/tracker', icon: Kanban },
      { label: 'Saved Jobs', href: '/saved', icon: Bookmark },
      { label: 'Watchlists', href: '/watchlists', icon: Eye }
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Market Insights', href: '/insights', icon: TrendingUp },
      { label: 'Placement Drives', href: '/placement', icon: GraduationCap, badge: 'HOT', badgeTone: 'amber' },
      { label: 'College Hiring', href: '/college', icon: Building2 },
      { label: 'Discover ATS', href: '/discover', icon: Compass }
    ]
  },
  {
    label: 'AI Career Tools',
    items: [
      { label: 'Resume Lab', href: '/resume-lab', icon: FileCode, badge: 'FREE', badgeTone: 'emerald' },
      { label: 'Resume Analyser', href: '/ai/resume-analyse', icon: Sparkles },
      { label: 'Cover Letter', href: '/ai/cover-letter', icon: FileText }
    ]
  },
  {
    label: 'Community',
    items: [
      { label: 'Interviews', href: '/community/interview', icon: Users },
      { label: 'OA Tracker', href: '/community/oa-tracker', icon: Code2 },
      { label: 'Referrals', href: '/community/referrals', icon: Share2 },
      { label: 'PPO Tracker', href: '/community/ppo', icon: Trophy },
      { label: 'For Recruiters', href: '/recruiter', icon: ShieldCheck }
    ]
  },
  {
    label: 'Personal',
    items: [
      { label: 'Profile & Calendar', href: '/profile', icon: User }
    ]
  }
];

interface SidebarProps {
  userProfile?: any;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ userProfile, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  if (!mobileOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-emerald-950/35" onClick={onCloseMobile} />
      <aside className="relative w-72 max-w-[85vw] h-full bg-bg-surface border-r border-border-subtle flex flex-col z-10 shadow-xl">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-subtle shrink-0">
          <Link href="/" onClick={onCloseMobile} className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-500 flex items-center justify-center text-white shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-text-primary text-sm tracking-tight">
              JobHunt <span className="text-accent-500">India</span>
            </span>
          </Link>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Content */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold text-text-tertiary tracking-wider uppercase">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                      isActive
                        ? 'text-accent-600 bg-accent-50 font-semibold border border-accent-100'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-500' : 'text-text-tertiary'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                          item.badgeTone === 'amber'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-accent-50 text-accent-600 border-accent-100'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Mini Footer */}
        <div className="p-3 border-t border-border-subtle bg-bg-base/70 shrink-0">
          <Link
            href="/profile"
            onClick={onCloseMobile}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-text-primary truncate">
                {userProfile?.full_name || 'Candidate Profile'}
              </p>
              <div className="flex items-center space-x-1 text-[11px] text-amber-700 font-medium">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{userProfile?.current_streak || 1} day streak</span>
              </div>
            </div>
          </Link>
        </div>
      </aside>
    </div>
  );
}
