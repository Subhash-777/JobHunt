import { createClient } from '@/lib/supabase/server';
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

  const { data: calendarLink } = await supabase
    .from('calendar_links')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-4 pt-10 pb-20">
      <header className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
        <p className="text-gray-400">Manage your skills, experience, and tracked jobs.</p>
      </header>

      <section className="space-y-6">
        <ProfileForm profile={profile || {}} user={user} calendarLink={calendarLink} />

        <div className="p-5 bg-bg-surface border border-white/5 rounded-xl mt-6">
          <h2 className="text-xl font-semibold mb-4">My Tracked Jobs</h2>
          <div className="text-sm text-gray-400 flex flex-col items-center justify-center py-8">
            <span className="text-4xl mb-3 opacity-50">📂</span>
            <p>You haven't saved any jobs yet.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
