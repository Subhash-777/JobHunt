'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { UploadCloud, Code, Loader2, Link } from 'lucide-react';

type ProfileFormProps = {
  profile: any;
  user: any;
  calendarLink?: any;
};

export function ProfileForm({ profile, user, calendarLink }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [syncingGithub, setSyncingGithub] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [calendar, setCalendar] = useState<any>(calendarLink);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    college: profile.college || '',
    degree: profile.degree || '',
    branch: profile.branch || '',
    graduation_year: profile.graduation_year || new Date().getFullYear(),
    cgpa: profile.cgpa || '',
    
    school_name_12th: profile.school_name_12th || '',
    percentage_12th: profile.percentage_12th || '',
    school_name_10th: profile.school_name_10th || '',
    percentage_10th: profile.percentage_10th || '',

    skills: profile.skills ? profile.skills.join(', ') : '',
    courses: profile.courses ? profile.courses.join(', ') : '',
    honors_awards: profile.honors_awards ? profile.honors_awards.join(', ') : '',
    publications: profile.publications ? profile.publications.join(', ') : '',

    github_url: profile.github_url || '',
    linkedin_url: profile.linkedin_url || '',
    leetcode_url: profile.leetcode_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const parseArray = (str: string) => str.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        college: formData.college,
        degree: formData.degree,
        branch: formData.branch,
        graduation_year: parseInt(formData.graduation_year as string, 10) || null,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa as string) : null,
        
        school_name_12th: formData.school_name_12th,
        percentage_12th: formData.percentage_12th ? parseFloat(formData.percentage_12th as string) : null,
        school_name_10th: formData.school_name_10th,
        percentage_10th: formData.percentage_10th ? parseFloat(formData.percentage_10th as string) : null,

        skills: parseArray(formData.skills),
        courses: parseArray(formData.courses),
        honors_awards: parseArray(formData.honors_awards),
        publications: parseArray(formData.publications),

        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        leetcode_url: formData.leetcode_url,
        
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Profile updated successfully!');
      router.refresh();
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingResume(true);
    setErrorMsg('');
    setSuccessMsg('');

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/profile/parse-resume', {
        method: 'POST',
        body: form
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      const parsed = result.data;
      setFormData(prev => ({
        ...prev,
        skills: parsed.skills ? Array.from(new Set([...parseArray(prev.skills), ...parsed.skills])).join(', ') : prev.skills,
        courses: parsed.courses ? Array.from(new Set([...parseArray(prev.courses), ...parsed.courses])).join(', ') : prev.courses,
        honors_awards: parsed.honors_awards ? Array.from(new Set([...parseArray(prev.honors_awards), ...parsed.honors_awards])).join(', ') : prev.honors_awards,
        publications: parsed.publications ? Array.from(new Set([...parseArray(prev.publications), ...parsed.publications])).join(', ') : prev.publications,
        college: parsed.college || prev.college,
        degree: parsed.degree || prev.degree,
        branch: parsed.branch || prev.branch,
        cgpa: parsed.cgpa || prev.cgpa,
        graduation_year: parsed.graduation_year || prev.graduation_year
      }));
      setSuccessMsg('Resume parsed successfully! Review the autofilled fields below and save.');
    } catch (err: any) {
      setErrorMsg(`Failed to parse resume: ${err.message}`);
    } finally {
      setParsingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSyncGithub = async () => {
    if (!formData.github_url) {
      setErrorMsg('Please enter a GitHub URL first.');
      return;
    }

    setSyncingGithub(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/profile/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: formData.github_url })
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      setSuccessMsg(`Successfully synced ${result.count} GitHub projects!`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(`Failed to sync GitHub: ${err.message}`);
    } finally {
      setSyncingGithub(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const InputField = ({ label, name, type = "text", placeholder = "", width = "full" }: any) => (
    <div className={width === "full" ? "col-span-2" : "col-span-1"}>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input name={name} type={type} placeholder={placeholder} value={(formData as any)[name]} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-500 placeholder:text-gray-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Resume Auto-Fill Section */}
      <div className="p-5 bg-accent-900/10 border border-accent-500/20 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-accent-100 flex items-center gap-2">
            <UploadCloud size={18} /> Autofill with Resume
          </h2>
          <p className="text-sm text-accent-100/60 mt-1">Upload your PDF resume to let AI automatically extract your skills, education, and achievements.</p>
        </div>
        <div className="relative">
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleResumeUpload} className="hidden" />
          <button 
            disabled={parsingResume}
            onClick={() => fileInputRef.current?.click()} 
            className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {parsingResume ? <><Loader2 size={16} className="animate-spin" /> Parsing...</> : 'Upload PDF'}
          </button>
        </div>
      </div>

      <div className="p-5 bg-bg-surface border border-white/5 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Profile Details</h2>
          <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">
            Sign Out
          </button>
        </div>

        {successMsg && <div className="mb-4 p-3 bg-green-500/20 text-green-200 border border-green-500/50 rounded-lg text-sm">{successMsg}</div>}
        {errorMsg && <div className="mb-4 p-3 bg-red-500/20 text-red-200 border border-red-500/50 rounded-lg text-sm">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basics */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Full Name" name="full_name" width="full" />
            <InputField label="LinkedIn URL" name="linkedin_url" placeholder="https://linkedin.com/in/username" />
            <InputField label="LeetCode URL" name="leetcode_url" placeholder="https://leetcode.com/u/username" />
            
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">GitHub URL</label>
              <div className="flex gap-2">
                <input name="github_url" type="text" placeholder="https://github.com/username" value={formData.github_url} onChange={handleChange} className="flex-1 bg-white/5 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent-500 placeholder:text-gray-600" />
                <button type="button" onClick={handleSyncGithub} disabled={syncingGithub || !formData.github_url} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 border border-white/10">
                  {syncingGithub ? <Loader2 size={14} className="animate-spin" /> : <Code size={14} />}
                  Sync Projects
                </button>
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Education */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-4 uppercase tracking-wider">Higher Education</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="College / University" name="college" width="full" placeholder="e.g. IIT Madras" />
              <InputField label="Degree" name="degree" placeholder="e.g. B.Tech" />
              <InputField label="Branch / Major" name="branch" placeholder="e.g. Computer Science" />
              <InputField label="Graduation Year" name="graduation_year" type="number" />
              <InputField label="College CGPA" name="cgpa" type="number" />
            </div>

            <h3 className="text-sm font-semibold text-gray-200 mt-6 mb-4 uppercase tracking-wider">Schooling</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="12th Grade School Name" name="school_name_12th" width="full" />
              <InputField label="12th Grade Percentage" name="percentage_12th" type="number" placeholder="e.g. 95" />
              <div className="col-span-1" /> {/* Spacer */}
              <InputField label="10th Grade School Name" name="school_name_10th" width="full" />
              <InputField label="10th Grade Percentage" name="percentage_10th" type="number" placeholder="e.g. 96" />
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Skills & Achievements */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-4 uppercase tracking-wider">Skills & Achievements</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Core Skills (comma separated)" name="skills" width="full" placeholder="React, Node.js, Python" />
              <InputField label="Relevant Courses (comma separated)" name="courses" width="full" placeholder="Data Structures, Machine Learning" />
              <InputField label="Honors & Awards (comma separated)" name="honors_awards" width="full" placeholder="Dean's List, 1st Place Hackathon" />
              <InputField label="Publications / Research (comma separated)" name="publications" width="full" placeholder="IEEE Paper on AI" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-accent-600 hover:bg-accent-500 text-white font-medium rounded-md transition-colors disabled:opacity-50">
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
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
