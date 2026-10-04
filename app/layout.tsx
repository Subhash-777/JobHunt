import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/shared/AppShell';

export const metadata: Metadata = {
  title: 'JobHunt India — Zero-Cost AI Career Intelligence',
  description: 'AI-powered job aggregator and career intelligence platform for tech candidates in India.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg-base text-text-primary min-h-screen">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
