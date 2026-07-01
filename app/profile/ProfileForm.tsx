'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type ProfileFormProps = {
  profile: any;
  user: any;
  calendarLink?: any;
};

export function ProfileForm({ profile, user, calendarLink }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [calendar, setCalendar] = useState<any>(calendarLink);
  const router = useRouter();

  const handleDisconnectCalendar = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from('calendar_links')
      .delete()
      .eq('user_id', user.id);
    if (!error) {
      setCalendar(null);
      router.refresh();
    }
  };

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    degree: profile.degree || '',
    branch: profile.branch || '',
    graduation_year: profile.graduation_year || new Date().getFullYear(),
    cgpa: profile.cgpa || '',
    skills: profile.skills ? profile.skills.join(', ') : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const supabase = createClient();
    const skillsArray = formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);

    await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        degree: formData.degree,
        branch: formData.branch,
        graduation_year: parseInt(formData.graduation_year as string, 10),
        cgpa: formData.cgpa ? parseFloat(formData.cgpa as string) : null,
        skills: skillsArray,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setLoading(false);
    setSuccess(true);
    router.refresh();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-bg-surface border border-white/5 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">
            Sign Out
          </button>
        </div>

        {success && <div className="mb-4 p-3 bg-green-500/20 text-green-200 border border-green-500/50 rounded text-sm">Profile updated successfully!</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Full Name</label>
            <input name="full_name" type="text" value={formData.full_name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Degree</label>
              <input name="degree" type="text" placeholder="e.g. B.Tech" value={formData.degree} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Branch</label>
              <input name="branch" type="text" placeholder="e.g. Computer Science" value={formData.branch} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Graduation Year</label>
              <input name="graduation_year" type="number" value={formData.graduation_year} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">CGPA</label>
              <input name="cgpa" type="number" step="0.01" value={formData.cgpa} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Skills (comma separated)</label>
            <input name="skills" type="text" placeholder="React, Node.js, Python" value={formData.skills} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-500" />
          </div>

          <button type="submit" disabled={loading} className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white font-medium rounded-md transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="p-5 bg-bg-surface border border-white/5 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Integrations</h2>
        {calendar ? (
          <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Google Calendar connected</p>
              <p className="text-xs text-gray-400">{calendar.google_email}</p>
            </div>
            <button
              onClick={handleDisconnectCalendar}
              className="text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 px-3 rounded-lg border border-red-500/20 transition-all"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Google Calendar</p>
              <p className="text-xs text-gray-400">Sync application deadlines, OA dates, and interview reminders automatically.</p>
            </div>
            <a
              href="/api/calendar/google/connect"
              className="text-xs font-semibold bg-accent-500 hover:bg-accent-600 text-white py-1.5 px-4 rounded-lg transition-colors"
            >
              Connect
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
