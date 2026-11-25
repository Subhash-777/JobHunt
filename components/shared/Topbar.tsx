'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Calendar,
  Bell,
  Command,
  Menu,
  Briefcase,
  ChevronDown,
  Sparkles,
  Users,
  Code2,
  Share2,
  Trophy,
  Building2,
  Compass,
  FileText,
  Eye,
  ShieldCheck
} from 'lucide-react';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  onOpenCmdPalette?: () => void;
  calendarConnected?: boolean;
}

const PRIMARY_NAV = [
  { label: 'Feed', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Tracker', href: '/tracker' },
  { label: 'Saved', href: '/saved' },
  { label: 'Placement', href: '/placement' },
  { label: 'Insights', href: '/insights' },
  { label: 'Resume Lab', href: '/resume-lab' },
];

const MORE_NAV = [
  { label: 'Watchlists', href: '/watchlists', icon: Eye },
  { label: 'College Hiring', href: '/college', icon: Building2 },
  { label: 'Discover ATS', href: '/discover', icon: Compass },
  { label: 'Resume Analyser', href: '/ai/resume-analyse', icon: Sparkles },
  { label: 'Cover Letter', href: '/ai/cover-letter', icon: FileText },
  { label: 'Interviews', href: '/community/interview', icon: Users },
  { label: 'OA Tracker', href: '/community/oa-tracker', icon: Code2 },
  { label: 'Referrals', href: '/community/referrals', icon: Share2 },
  { label: 'PPO Tracker', href: '/community/ppo', icon: Trophy },
  { label: 'For Recruiters', href: '/recruiter', icon: ShieldCheck },
];

export default function Topbar({ onOpenMobileMenu, onOpenCmdPalette, calendarConnected = false }: TopbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMoreActive = MORE_NAV.some((item) => pathname === item.href);

  return (
    /* Glass Surface #1: Sticky Top-Nav Workspace Bar */
    <header
      className={`sticky top-0 z-30 h-16 w-full bg-white/88 backdrop-blur-md border-b border-border-subtle transition-shadow ${
        scrolled ? 'shadow-sm shadow-emerald-950/5' : ''
      }`}
    >
      <div className="max-w-[1380px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu + Brand + Desktop Primary Nav */}
        <div className="flex items-center gap-3 lg:gap-5 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-accent-500 flex items-center justify-center text-white shadow-xs shadow-accent-500/25">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-text-primary text-sm sm:text-base tracking-tight whitespace-nowrap">
              JobHunt <span className="hidden sm:inline text-accent-500">India</span>
            </span>
          </Link>

          {/* Desktop Horizontal Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main navigation">
            {PRIMARY_NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-accent-50 text-accent-600 font-semibold border border-accent-100'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* More Dropdown for Community, AI & Campus Tools */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-colors ${
                  isMoreActive || moreOpen
                    ? 'bg-accent-50 text-accent-600 font-semibold border border-accent-100'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                <span>Explore</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-white border border-border-subtle shadow-xl p-2 grid grid-cols-1 gap-0.5 z-50">
                  {MORE_NAV.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          active
                            ? 'bg-accent-50 text-accent-600 font-semibold'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-accent-500' : 'text-text-tertiary'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Quick Command Search + Calendar Sync + Notifications + Profile */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenCmdPalette}
            className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-bg-elevated/80 hover:bg-bg-elevated border border-border-subtle hover:border-border-default text-text-tertiary hover:text-text-primary text-xs transition-all max-w-[175px] sm:max-w-[210px]"
            aria-label="Open command search"
          >
            <span className="flex items-center space-x-1.5 truncate">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Quick jump...</span>
            </span>
            <span className="hidden sm:inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-text-tertiary border border-border-subtle">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </span>
          </button>

          <Link
            href="/profile"
            className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-white hover:bg-bg-elevated border-border-subtle text-text-secondary"
            title={calendarConnected ? 'Google Calendar Synced' : 'Connect Google Calendar'}
          >
            <span className={`w-2 h-2 rounded-full ${calendarConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
            <span>{calendarConnected ? 'Cal Synced' : 'Calendar'}</span>
          </Link>

          <Link
            href="/watchlists"
            className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            title="Watchlist Alerts"
            aria-label="Watchlist notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </Link>

          <Link
            href="/profile"
            className="hidden sm:flex items-center space-x-2 pl-1.5 pr-3 py-1 rounded-full border border-border-subtle bg-white hover:bg-bg-elevated transition-colors text-xs font-semibold text-text-primary"
          >
            <span className="w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center text-[11px] font-bold">
              U
            </span>
            <span className="hidden md:inline">Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
