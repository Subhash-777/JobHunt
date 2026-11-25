'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, Code, Loader2, Link as LinkIcon, User, GraduationCap, 
  School, Award, BookOpen, Calendar, CheckCircle2, Sparkles, X, Plus, Link2, Code2
} from 'lucide-react';
import { toast } from 'sonner';

type ProfileFormProps = {
  profile: any;
  user: any;
  calendarLink?: any;
};

export function ProfileForm({ profile, user, calendarLink }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [syncingGithub, setSyncingGithub] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
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

    github_url: profile.github_url || '',
    linkedin_url: profile.linkedin_url || '',
    leetcode_url: profile.leetcode_url || '',
  });

  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [courses, setCourses] = useState<string[]>(profile.courses || []);
  const [honors, setHonors] = useState<string[]>(profile.honors_awards || []);
  const [publications, setPublications] = useState<string[]>(profile.publications || []);

  const [skillInput, setSkillInput] = useState('');
  const [courseInput, setCourseInput] = useState('');
  const [honorInput, setHonorInput] = useState('');
  const [pubInput, setPubInput] = useState('');

  // Calculate Profile Completeness Score
  const fieldsToCheck = [
    formData.full_name, formData.college, formData.degree, formData.branch,
    formData.graduation_year, formData.cgpa, formData.github_url, formData.linkedin_url,
    skills.length > 0, courses.length > 0
  ];
  const filledCount = fieldsToCheck.filter(Boolean).length;
  const completenessScore = Math.round((filledCount / fieldsToCheck.length) * 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addTag = (val: string, list: string[], setList: (l: string[]) => void, setInput: (s: string) => void) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput('');
    }
  };

  const removeTag = (index: number, list: string[], setList: (l: string[]) => void) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

        skills,
        courses,
        honors_awards: honors,
        publications,

        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        leetcode_url: formData.leetcode_url,
        
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setLoading(false);
    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Profile details saved successfully!');
      router.refresh();
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingResume(true);
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
      if (parsed.skills) setSkills(Array.from(new Set([...skills, ...parsed.skills])));
      if (parsed.courses) setCourses(Array.from(new Set([...courses, ...parsed.courses])));
      if (parsed.honors_awards) setHonors(Array.from(new Set([...honors, ...parsed.honors_awards])));
      if (parsed.publications) setPublications(Array.from(new Set([...publications, ...parsed.publications])));

      setFormData(prev => ({
        ...prev,
        college: parsed.college || prev.college,
        degree: parsed.degree || prev.degree,
        branch: parsed.branch || prev.branch,
        cgpa: parsed.cgpa || prev.cgpa,
        graduation_year: parsed.graduation_year || prev.graduation_year
      }));

      toast.success('Resume parsed cleanly! Fields updated below.');
    } catch (err: any) {
      toast.error(`Failed to parse resume: ${err.message}`);
    } finally {
      setParsingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSyncGithub = async () => {
    if (!formData.github_url) {
      toast.error('Please enter a valid GitHub URL first.');
      return;
    }

    setSyncingGithub(true);
    try {
      const res = await fetch('/api/profile/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: formData.github_url })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success(`Synced ${result.count} GitHub repositories!`);
      router.refresh();
    } catch (err: any) {
      toast.error(`GitHub sync error: ${err.message}`);
    } finally {
      setSyncingGithub(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Profile Avatar & Completeness Banner */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent-600 to-accent-400 text-white font-extrabold text-xl flex items-center justify-center border-2 border-accent-500/30 shadow-md">
            {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{formData.full_name || 'Candidate Profile'}</h1>
            <p className="text-xs text-text-secondary mt-0.5">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-500/10 text-accent-400 border border-accent-500/20">
                Student Candidate
              </span>
              <span className="text-xs text-text-tertiary">· India Tier</span>
            </div>
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="w-full md:w-64 space-y-2 bg-bg-elevated p-4 rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-secondary">Profile Completeness</span>
            <span className="font-mono font-bold text-accent-400">{completenessScore}%</span>
          </div>
          <div className="w-full h-2 bg-bg-surface rounded-full overflow-hidden border border-border-subtle">
            <div
              className="h-full bg-gradient-to-r from-accent-600 to-accent-400 transition-all duration-300"
              style={{ width: `${completenessScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prominent Autofill Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-accent-500/10 to-accent-600/5 border border-accent-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-accent-500/20 text-accent-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">Autofill Profile with AI Resume Parser</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Upload your PDF resume to extract skills, college, CGPA, courses, and honors automatically.
            </p>
          </div>
        </div>
        <div>
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleResumeUpload} className="hidden" />
          <button
            disabled={parsingResume}
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm shadow-accent-500/20 disabled:opacity-50 min-h-[38px]"
          >
            {parsingResume ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Parsing PDF...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload PDF Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Profile Form Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Identity & Links */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2 border-b border-border-subtle pb-3">
            <User className="w-4 h-4 text-accent-500" />
            <span>Identity & Professional Links</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Subhash Kumar"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">LinkedIn Profile URL</label>
              <div className="relative">
                <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 pl-9 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">LeetCode Profile URL</label>
              <div className="relative">
                <Code2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  name="leetcode_url"
                  value={formData.leetcode_url}
                  onChange={handleChange}
                  placeholder="https://leetcode.com/u/username"
                  className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 pl-9 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">GitHub Profile & Sync</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Code2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 pl-9 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSyncGithub}
                  disabled={syncingGithub || !formData.github_url}
                  className="px-3 py-2 bg-bg-elevated hover:bg-bg-surface text-text-primary border border-border-subtle rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {syncingGithub ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Code className="w-3.5 h-3.5 text-accent-500" />}
                  <span>Sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Higher Education */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2 border-b border-border-subtle pb-3">
            <GraduationCap className="w-4 h-4 text-accent-500" />
            <span>Higher Education</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">College / University Name</label>
              <input
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. Indian Institute of Technology Madras"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Degree Program</label>
              <input
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. B.Tech"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Branch / Department</label>
              <input
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Graduation Year</label>
              <input
                name="graduation_year"
                type="number"
                value={formData.graduation_year}
                onChange={handleChange}
                placeholder="2026"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">College CGPA (out of 10.0)</label>
              <input
                name="cgpa"
                type="number"
                step="0.01"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="8.75"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Schooling */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2 border-b border-border-subtle pb-3">
            <School className="w-4 h-4 text-accent-500" />
            <span>Schooling Details (10th & 12th Grade)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">12th Grade School Name</label>
              <input
                name="school_name_12th"
                value={formData.school_name_12th}
                onChange={handleChange}
                placeholder="e.g. Kendriya Vidyalaya No. 1"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">12th Grade Percentage (%)</label>
              <input
                name="percentage_12th"
                type="number"
                step="0.1"
                value={formData.percentage_12th}
                onChange={handleChange}
                placeholder="94.5"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">10th Grade School Name</label>
              <input
                name="school_name_10th"
                value={formData.school_name_10th}
                onChange={handleChange}
                placeholder="e.g. St. Xavier's High School"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">10th Grade Percentage / CGPA</label>
              <input
                name="percentage_10th"
                type="number"
                step="0.1"
                value={formData.percentage_10th}
                onChange={handleChange}
                placeholder="96.0"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Tag-Style Inputs for Skills, Courses & Honors */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-6">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2 border-b border-border-subtle pb-3">
            <Award className="w-4 h-4 text-accent-500" />
            <span>Skills, Courses & Honors (Tag Style)</span>
          </h2>

          {/* Skills Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-text-secondary">Core Technical Skills</label>
            <div className="flex flex-wrap gap-2 p-2.5 bg-bg-elevated border border-border-subtle rounded-xl min-h-[44px]">
              {skills.map((s, idx) => (
                <span key={idx} className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-accent-500/10 text-accent-400 border border-accent-500/30 text-xs font-medium">
                  <span>{s}</span>
                  <button type="button" onClick={() => removeTag(idx, skills, setSkills)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center space-x-1 flex-1 min-w-[140px]">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(skillInput, skills, setSkills, setSkillInput);
                    }
                  }}
                  placeholder="Type skill + Enter..."
                  className="bg-transparent text-xs text-text-primary focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Courses Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-text-secondary">Relevant Courses & Certifications</label>
            <div className="flex flex-wrap gap-2 p-2.5 bg-bg-elevated border border-border-subtle rounded-xl min-h-[44px]">
              {courses.map((c, idx) => (
                <span key={idx} className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-bg-surface text-text-secondary border border-border-subtle text-xs font-medium">
                  <span>{c}</span>
                  <button type="button" onClick={() => removeTag(idx, courses, setCourses)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center space-x-1 flex-1 min-w-[140px]">
                <input
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(courseInput, courses, setCourses, setCourseInput);
                    }
                  }}
                  placeholder="Type course + Enter..."
                  className="bg-transparent text-xs text-text-primary focus:outline-none w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-accent-500/20 transition-all disabled:opacity-50 min-h-[42px]"
          >
            {loading ? 'Saving Profile...' : 'Save All Changes'}
          </button>
        </div>
      </form>

      {/* GitHub Synced Projects Mini-Grid */}
      {profile.github_projects && Array.isArray(profile.github_projects) && profile.github_projects.length > 0 && (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2 border-b border-border-subtle pb-3">
            <Code2 className="w-4 h-4 text-accent-500" />
            <span>Synced GitHub Repositories ({profile.github_projects.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.github_projects.map((repo: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-bg-elevated border border-border-subtle rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent-400 truncate">{repo.name}</span>
                  <span className="text-[10px] text-text-tertiary font-mono">⭐ {repo.stargazers_count || 0}</span>
                </div>
                <p className="text-[11px] text-text-secondary line-clamp-2">
                  {repo.description || 'No description provided.'}
                </p>
                {repo.language && (
                  <span className="inline-block text-[9px] uppercase font-bold text-text-tertiary bg-bg-surface px-2 py-0.5 rounded border border-border-subtle">
                    {repo.language}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RSS Feed Card */}
      {profile.rss_feed_token && (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2 border-b border-border-subtle pb-3">
            <span>📡</span>
            <span>Personal RSS Feed</span>
          </h2>
          <div className="p-4 bg-bg-elevated rounded-xl border border-border-subtle space-y-3">
            <p className="text-xs text-text-secondary">
              Subscribe to your personalised job watchlist in any RSS reader (Feedly, Inoreader, etc.).
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono text-accent-400 bg-bg-surface px-3 py-2 rounded-lg border border-border-subtle truncate">
                {`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://subhash-jobhunt.vercel.app'}/api/feed/${profile.rss_feed_token}.xml`}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://subhash-jobhunt.vercel.app'}/api/feed/${profile.rss_feed_token}.xml`
                  );
                  toast.success('RSS URL copied!');
                }}
                className="px-3 py-2 bg-accent-500/10 hover:bg-accent-500/20 text-accent-400 border border-accent-500/20 rounded-lg text-xs font-semibold transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Card */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2 border-b border-border-subtle pb-3">
          <Calendar className="w-4 h-4 text-accent-500" />
          <span>Calendar Integration</span>
        </h2>
        {calendar ? (
          <div className="flex items-center justify-between p-4 bg-bg-elevated rounded-xl border border-border-subtle">
            <div>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Google Calendar Synced
              </p>
              <p className="text-xs text-text-secondary mt-0.5">{calendar.google_email}</p>
            </div>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.from('calendar_links').delete().eq('user_id', user.id);
                setCalendar(null);
                toast.success('Calendar disconnected.');
                router.refresh();
              }}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-bg-elevated rounded-xl border border-border-subtle">
            <div>
              <p className="text-xs font-bold text-text-primary">Google Calendar OAuth</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Automatically add application deadlines and interview invites directly to your calendar.
              </p>
            </div>
            <a
              href="/api/calendar/google/connect"
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-accent-500/20"
            >
              Connect Calendar
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
