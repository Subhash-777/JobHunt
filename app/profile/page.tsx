import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/profile');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const admin = supabaseAdmin();
  const { data: calendarLink } = await admin
    .from('calendar_links')
    .select('google_email, sync_mode, connected_at, last_synced_at, needs_reconnect')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-2 sm:p-4 pt-4 pb-20">
      <header className="mb-6 border-b border-border-subtle pb-5">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-text-primary mb-1.5">Profile & Calendar</h1>
        <p className="text-xs sm:text-sm text-text-secondary">Manage your skills, academic eligibility, RSS feed, and Google Calendar sync.</p>
      </header>

      <section className="space-y-6">
        <ProfileForm profile={profile || {}} user={user} calendarLink={calendarLink} />

        <div className="p-5 bg-bg-surface border border-border-subtle rounded-2xl mt-6 shadow-2xs">
          <h2 className="text-base font-display font-bold text-text-primary mb-3">My Tracked Jobs</h2>
          <div className="text-xs sm:text-sm text-text-secondary flex flex-col items-center justify-center py-6">
            <p>Manage all your saved and tracked jobs from the <a href="/tracker" className="text-accent-600 font-semibold hover:underline">Application Pipeline</a>.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
