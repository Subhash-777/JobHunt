'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push(nextParam ? nextParam : '/profile');
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${nextParam ? `?next=${nextParam}` : ''}`,
      },
    });
  };

  return (
    <div className="w-full max-w-md bg-bg-surface border border-border-subtle p-7 sm:p-8 rounded-2xl shadow-md">
      <div className="flex items-center space-x-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-accent-500 flex items-center justify-center text-white shadow-xs">
          <Briefcase className="w-4 h-4" />
        </div>
        <span className="font-display font-bold text-text-primary text-base">
          JobHunt <span className="text-accent-500">India</span>
        </span>
      </div>

      <h1 className="text-2xl font-display font-extrabold text-text-primary mb-1.5">Welcome Back</h1>
      <p className="text-xs sm:text-sm text-text-secondary mb-6">Sign in to track your applications, AI matches, and calendar sync.</p>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
          />
        </div>
        <div>
          <label htmlFor="login-pass" className="block text-xs font-semibold text-text-secondary mb-1.5">Password</label>
          <input
            id="login-pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-xs"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-xs text-text-tertiary">or</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-bg-elevated border border-border-default text-text-primary font-semibold text-sm py-2.5 rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-xs sm:text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-accent-600 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-md bg-bg-surface border border-border-subtle p-8 rounded-2xl h-[420px] flex items-center justify-center">
          <p className="text-sm text-text-secondary">Loading form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
