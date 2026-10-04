'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, Bookmark, Kanban, Calendar, User } from 'lucide-react';

const mobileNavItems = [
  { label: 'Feed', href: '/', icon: Briefcase },
  { label: 'Saved', href: '/saved', icon: Bookmark },
  { label: 'Tracker', href: '/tracker', icon: Kanban },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Profile', href: '/profile', icon: User }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/95 backdrop-blur-lg border-t border-border-subtle pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-14">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 w-8 h-1 bg-accent-500 rounded-b-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-accent-500 scale-105' : 'text-text-tertiary'
                }`}
              />
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                  isActive ? 'text-accent-500 font-semibold' : 'text-text-tertiary'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
