'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/profile');
      router.refresh();
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-surface border border-border-subtle p-7 sm:p-8 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-accent-500 flex items-center justify-center text-white shadow-xs">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-text-primary text-base">
            JobHunt <span className="text-accent-500">India</span>
          </span>
        </div>

        <h1 className="text-2xl font-display font-extrabold text-text-primary mb-1.5">Create an Account</h1>
        <p className="text-xs sm:text-sm text-text-secondary mb-6">Join JobHunt India to unlock AI fit scoring and application tracking.</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label htmlFor="su-name" className="block text-xs font-semibold text-text-secondary mb-1.5">Full Name</label>
            <input
              id="su-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label htmlFor="su-email" className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
            <input
              id="su-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label htmlFor="su-pass" className="block text-xs font-semibold text-text-secondary mb-1.5">Password</label>
            <input
              id="su-pass"
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
