import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Briefcase, UserCircle, Bookmark, Kanban } from 'lucide-react';

export const metadata: Metadata = {
  title: 'JobHunt India',
  description: 'Discover your next career move.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen relative">
        <div className="ambient-glow" />
        
        {/* Basic Global Navigation */}
        <nav className="fixed bottom-0 w-full md:top-0 md:bottom-auto border-t md:border-b md:border-t-0 border-white/10 bg-bg-surface/80 backdrop-blur-md z-40">
          <div className="max-w-3xl mx-auto flex justify-around md:justify-end items-center h-14 px-4 gap-6">
            <Link href="/" className="flex flex-col md:flex-row items-center gap-1 text-gray-400 hover:text-white transition-colors">
              <Briefcase size={20} />
              <span className="text-xs md:text-sm font-medium">Feed</span>
            </Link>
            <Link href="/saved" className="flex flex-col md:flex-row items-center gap-1 text-gray-400 hover:text-white transition-colors">
              <Bookmark size={20} />
              <span className="text-xs md:text-sm font-medium">Saved</span>
            </Link>
            <Link href="/tracker" className="flex flex-col md:flex-row items-center gap-1 text-gray-400 hover:text-white transition-colors">
              <Kanban size={20} />
              <span className="text-xs md:text-sm font-medium">Tracker</span>
            </Link>
            <Link href="/profile" className="flex flex-col md:flex-row items-center gap-1 text-gray-400 hover:text-white transition-colors">
              <UserCircle size={20} />
              <span className="text-xs md:text-sm font-medium">Profile</span>
            </Link>
          </div>
        </nav>
        
        <div className="pt-0 md:pt-14 pb-14 md:pb-0">
          {children}
        </div>
      </body>
    </html>
  );
}
