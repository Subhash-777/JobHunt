'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Bookmark, Kanban, GraduationCap, User } from 'lucide-react';

const mobileNavItems = [
  { label: 'Jobs', href: '/', icon: Briefcase },
  { label: 'Saved', href: '/saved', icon: Bookmark },
  { label: 'Tracker', href: '/tracker', icon: Kanban },
  { label: 'Drives', href: '/placement', icon: GraduationCap },
  { label: 'Profile', href: '/profile', icon: User }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border-subtle pb-[env(safe-area-inset-bottom,0px)] shadow-sm">
      <div className="flex items-center justify-around h-15">
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
                <span className="absolute top-0 w-8 h-0.5 bg-accent-500 rounded-b-full" />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-accent-500' : 'text-text-tertiary'
                }`}
              />
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                  isActive ? 'text-accent-600 font-semibold' : 'text-text-tertiary'
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
