'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, Bell, Sparkles, Command, Menu, Briefcase } from 'lucide-react';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  onOpenCmdPalette?: () => void;
  calendarConnected?: boolean;
}

export default function Topbar({ onOpenMobileMenu, onOpenCmdPalette, calendarConnected = false }: TopbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    /* Glass Surface #1: Sticky Top Navigation */
    <header
      className={`sticky top-0 z-30 h-15 w-full bg-white/85 backdrop-blur-md border-b border-border-subtle transition-shadow flex items-center justify-between px-4 sm:px-6 ${
        scrolled ? 'shadow-sm shadow-slate-900/5' : ''
      }`}
    >
      {/* Left section: Mobile menu toggle + Brand */}
      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="sm:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="sm:hidden flex items-center space-x-1.5">
          <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center text-white shadow-sm shadow-accent-500/25">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-bold text-text-primary text-sm tracking-tight whitespace-nowrap">
            JobHunt
          </span>
        </Link>
      </div>

      {/* Center section: Quick Search / Command Trigger */}
      <div className="flex-1 min-w-0 max-w-xl mx-2 sm:mx-4">
        <button
          onClick={onOpenCmdPalette}
          className="w-full min-w-0 flex items-center justify-between px-3 py-2 rounded-xl bg-bg-elevated/80 hover:bg-bg-elevated border border-border-subtle hover:border-border-default text-text-tertiary hover:text-text-secondary text-xs transition-all"
          aria-label="Open command search"
        >
          <div className="flex items-center space-x-2 min-w-0 truncate">
            <Search className="w-4 h-4 text-text-tertiary shrink-0" />
            <span className="truncate">Search jobs, skills...</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-white text-[10px] font-mono text-text-tertiary border border-border-subtle shadow-2xs">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right section: Calendar Status + AI Quota + Notifications + Profile */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        <Link
          href="/profile"
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-white hover:bg-bg-elevated border-border-subtle text-text-secondary"
          title={calendarConnected ? 'Google Calendar Synced' : 'Connect Google Calendar'}
        >
          <span className={`w-2 h-2 rounded-full ${calendarConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
          <span>{calendarConnected ? 'Cal Synced' : 'Calendar Sync'}</span>
        </Link>

        <Link
          href="/resume-lab"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent-50 border border-accent-100 text-accent-600 hover:bg-accent-100/70 transition-colors"
          title="Free AI Cascade Active (Groq + OpenRouter + Gemini)"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-500" />
          <span>Free AI Tools</span>
        </Link>

        <Link
          href="/watchlists"
          className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          title="Watchlist Alerts"
          aria-label="Watchlist notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500 ring-2 ring-white" />
        </Link>

        <Link
          href="/profile"
          className="hidden sm:flex items-center space-x-2 pl-1.5 pr-3 py-1 rounded-full border border-border-subtle bg-white hover:bg-bg-elevated transition-colors text-xs font-semibold text-text-primary"
        >
          <span className="w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center text-[11px] font-bold">
            U
          </span>
          <span className="hidden lg:inline">Account</span>
        </Link>
      </div>
    </header>
  );
}
