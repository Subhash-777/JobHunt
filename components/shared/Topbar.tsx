'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, Bell, Sparkles, Command, Menu, CheckCircle2, AlertCircle } from 'lucide-react';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
  onOpenCmdPalette?: () => void;
  calendarConnected?: boolean;
}

export default function Topbar({ onOpenMobileMenu, onOpenCmdPalette, calendarConnected = false }: TopbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-14 w-full bg-bg-base/90 backdrop-blur-md border-b border-border-subtle transition-shadow flex items-center justify-between px-4 sm:px-6 ${
        scrolled ? 'shadow-md shadow-black/20' : ''
      }`}
    >
      {/* Left section: Mobile menu toggle + Brand */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="sm:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="sm:hidden flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-accent-600 to-accent-400 flex items-center justify-center font-bold text-white text-xs">
            JH
          </div>
          <span className="font-semibold text-text-primary text-sm tracking-tight">JobHunt</span>
        </Link>
      </div>

      {/* Center section: Frosted Search Trigger */}
      <div className="flex-1 max-w-lg mx-4">
        <button
          onClick={onOpenCmdPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-bg-surface/80 border border-border-subtle hover:border-border-default text-text-tertiary hover:text-text-secondary text-xs transition-all shadow-inner"
        >
          <div className="flex items-center space-x-2 truncate">
            <Search className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="truncate">Search jobs, companies, skills or actions...</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 px-1.5 py-0.5 rounded bg-bg-elevated text-[10px] font-mono text-text-tertiary border border-border-subtle">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right section: Calendar Status + AI Quota + Notifications */}
      <div className="flex items-center space-x-3">
        {/* Calendar Sync Status Pill */}
        <Link
          href="/profile"
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors bg-bg-surface hover:bg-bg-elevated border-border-subtle"
          title={calendarConnected ? 'Google Calendar Synced' : 'Connect Google Calendar'}
        >
          <div className={`w-2 h-2 rounded-full ${calendarConnected ? 'bg-emerald-500 animate-pulse' : 'bg-text-tertiary'}`} />
          <Calendar className="w-3.5 h-3.5 text-text-secondary" />
          <span className="text-text-secondary">
            {calendarConnected ? 'Cal Synced' : 'Connect Cal'}
          </span>
        </Link>

        {/* AI Quota Indicator */}
        <div
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent-500/10 border border-accent-500/20 text-accent-400"
          title="AI Cascade Free Quota Active (Groq + OpenRouter + Gemini)"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-500" />
          <span>AI Active</span>
        </div>

        {/* Watchlist Alerts Bell */}
        <Link
          href="/watchlists"
          className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
          title="Watchlist Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500" />
        </Link>
      </div>
    </header>
  );
}
