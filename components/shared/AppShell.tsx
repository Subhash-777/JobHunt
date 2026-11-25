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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans selection:bg-accent-500/15 selection:text-accent-600">
      <div className="ambient-glow" />

      {/* Mobile Slide-Out Navigation Drawer (Zero desktop sidebar squeeze) */}
      <Sidebar
        userProfile={userProfile}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Full-Width Top-Nav Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar
          onOpenMobileMenu={() => setMobileNavOpen(true)}
          onOpenCmdPalette={() => setCmdOpen(true)}
          calendarConnected={!!userProfile?.google_calendar_connected}
        />

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 max-w-[1380px] w-full mx-auto pb-24 sm:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Command Palette Modal (Glass Surface #3) */}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />

      {/* Light Toast System */}
      <Toaster position="bottom-right" theme="light" richColors />
    </div>
  );
}
