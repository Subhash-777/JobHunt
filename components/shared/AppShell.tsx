'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import CommandPalette from './CommandPalette';
import { Toaster } from 'sonner';

interface AppShellProps {
  children: React.ReactNode;
  userProfile?: any;
}

export default function AppShell({ children, userProfile }: AppShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans selection:bg-accent-500/30 selection:text-accent-400">
      <div className="ambient-glow" />

      {/* Desktop & Tablet Sidebar */}
      <Sidebar userProfile={userProfile} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col sm:ml-60 transition-all duration-200">
        <Topbar
          onOpenCmdPalette={() => setCmdOpen(true)}
          calendarConnected={!!userProfile?.google_calendar_connected}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-20 sm:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Command Palette Modal */}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />

      {/* Global Toast System */}
      <Toaster position="bottom-right" theme="dark" richColors />
    </div>
  );
}
