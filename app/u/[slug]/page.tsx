import { createClient } from '@/lib/supabase/server';
import { User, GraduationCap, Code2, Link2, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .or(`id.eq.${slug},full_name.ilike.%${slug.replace(/-/g, ' ')}%`)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <User className="w-12 h-12 text-text-tertiary opacity-40" />
        <h2 className="text-lg font-bold text-text-primary">Private or Non-Existent Profile</h2>
        <p className="text-xs text-text-secondary max-w-sm">
          This candidate profile is either private or does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="p-6 bg-bg-surface border border-border-subtle rounded-2xl flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 shadow-lg">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent-600 to-accent-400 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-accent-500/30 shadow-md shrink-0">
          {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-xl font-bold text-text-primary flex items-center justify-center sm:justify-start gap-2">
            <span>{profile.full_name || 'Candidate'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </h1>
          <p className="text-xs text-text-secondary">
            {profile.degree || 'B.Tech'} {profile.branch ? `in ${profile.branch}` : ''} · Class of {profile.graduation_year || 2026}
          </p>
          <p className="text-xs text-text-tertiary font-medium">{profile.college || 'Indian Institute of Technology'}</p>
        </div>
      </div>

      {/* Skills Card */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="p-5 bg-bg-surface border border-border-subtle rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-accent-500" /> Technical Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((s: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-accent-500/10 text-accent-400 border border-accent-500/20 text-xs font-semibold rounded-lg">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links Card */}
      <div className="p-5 bg-bg-surface border border-border-subtle rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Link2 className="w-4 h-4 text-accent-500" /> Verified Links
        </h3>
        <div className="flex flex-wrap gap-3 text-xs">
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-bg-elevated hover:bg-bg-surface border border-border-subtle rounded-xl text-text-primary transition-colors flex items-center gap-1.5">
              <span>GitHub Profile</span>
            </a>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-bg-elevated hover:bg-bg-surface border border-border-subtle rounded-xl text-accent-400 transition-colors flex items-center gap-1.5">
              <span>LinkedIn Profile</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
