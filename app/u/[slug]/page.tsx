import { createClient } from '@/lib/supabase/server';
import { User, Code2, Link2, CheckCircle2 } from 'lucide-react';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('public_profiles')
    .select('*')
    .or(`public_slug.eq.${slug},id.eq.${slug},full_name.ilike.%${slug.replace(/-/g, ' ')}%`)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <User className="w-12 h-12 text-text-tertiary opacity-50" />
        <h1 className="text-lg font-display font-bold text-text-primary">Private or Non-Existent Profile</h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-sm">
          This candidate profile is either set to private or does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="p-6 bg-bg-surface border border-border-subtle rounded-2xl flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-accent-500 text-white font-display font-extrabold text-2xl flex items-center justify-center shadow-sm shrink-0">
          {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-xl font-display font-bold text-text-primary flex items-center justify-center sm:justify-start gap-2">
            <span>{profile.full_name || 'Candidate'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            {profile.degree || 'B.Tech'} {profile.branch ? `in ${profile.branch}` : ''} · Class of {profile.graduation_year || 2026}
          </p>
          {profile.open_to_work && (
            <span className="inline-block text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Open to Work
            </span>
          )}
        </div>
      </div>

      {profile.skills && profile.skills.length > 0 && (
        <div className="p-5 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-accent-500" /> Technical Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((s: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-accent-50 text-accent-600 border border-accent-100 text-xs font-semibold rounded-lg">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-5 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xs space-y-3">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Link2 className="w-4 h-4 text-accent-500" /> Verified Links
        </h2>
        <div className="flex flex-wrap gap-3 text-xs">
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 bg-bg-elevated hover:bg-accent-50 border border-border-subtle rounded-xl text-text-primary font-semibold transition-colors">
              GitHub Profile
            </a>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 bg-bg-elevated hover:bg-accent-50 border border-border-subtle rounded-xl text-accent-600 font-semibold transition-colors">
              LinkedIn Profile
            </a>
          )}
          {profile.portfolio_url && (
            <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 bg-bg-elevated hover:bg-accent-50 border border-border-subtle rounded-xl text-text-primary font-semibold transition-colors">
              Portfolio
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
