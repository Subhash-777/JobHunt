'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  Briefcase,
  Bookmark,
  Kanban,
  User,
  Eye,
  TrendingUp,
  FileText,
  FileCode,
  Calendar,
  Code2,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Rss
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  const navigate = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-xl bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden z-10 glass-overlay animate-in fade-in zoom-in-95 duration-150">
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center border-b border-border-subtle px-4 py-3">
            <Search className="w-4 h-4 text-text-tertiary mr-3 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search page..."
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <span className="text-[10px] font-mono text-text-tertiary px-1.5 py-0.5 rounded bg-bg-elevated border border-border-subtle">
              ESC
            </span>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-2 text-xs">
            <Command.Empty className="p-4 text-center text-text-tertiary text-xs">
              No matching results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[10px] font-semibold text-text-tertiary uppercase px-2 py-1">
              <Command.Item
                onSelect={() => navigate('/')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-text-secondary" />
                <span>Job Feed</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/saved')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-text-secondary" />
                <span>Saved Jobs</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/tracker')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <Kanban className="w-4 h-4 text-text-secondary" />
                <span>Application Tracker</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/dashboard')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-text-secondary" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/profile')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <User className="w-4 h-4 text-text-secondary" />
                <span>My Profile</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="AI Tools & Insights" className="text-[10px] font-semibold text-text-tertiary uppercase px-2 py-1">
              <Command.Item
                onSelect={() => navigate('/resume-lab')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-text-secondary" />
                <span>Resume Lab</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/ai/cover-letter')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-text-secondary" />
                <span>AI Cover Letter Generator</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/insights')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-text-secondary" />
                <span>Market Intelligence</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Quick Actions" className="text-[10px] font-semibold text-text-tertiary uppercase px-2 py-1">
              <Command.Item
                onSelect={() => navigate('/profile')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-text-secondary" />
                <span>Sync GitHub Repositories</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/profile')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-text-secondary" />
                <span>Connect Google Calendar</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/profile#rss')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <Rss className="w-4 h-4 text-text-secondary" />
                <span>My RSS Feed URL</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate('/recruiter')}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-primary hover:bg-accent-500/10 hover:text-accent-400 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-text-secondary" />
                <span>Recruiter Panel</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
