'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Check, Copy, RefreshCw } from 'lucide-react';

interface CoverLetterClientProps {
  savedJobs: any[];
  versions: any[];
}

export function CoverLetterClient({ savedJobs, versions }: CoverLetterClientProps) {
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get('resumeId') || '';
  const jobIdParam = searchParams.get('jobId') || '';

  const [selectedJobId, setSelectedJobId] = useState(jobIdParam);
  const [selectedResumeId, setSelectedResumeId] = useState(resumeIdParam);
  const [tone, setTone] = useState('Formal');
  const [customProject, setCustomProject] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !selectedResumeId) return;

    setLoading(true);
    setCoverLetter('');
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobId,
          resumeVersionId: selectedResumeId,
          tone,
          customProject,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoverLetter(data.coverLetter);
      } else {
        const err = await res.json();
        alert(err.error || 'Generation failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen max-w-5xl mx-auto p-4 pt-10 pb-20 text-gray-200">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 mb-2">
          <FileText className="text-accent-500" />
          AI Cover Letter Generator
        </h1>
        <p className="text-gray-400">
          Generate custom, high-converting cover letters matching your resume versions and target roles.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form */}
        <section className="bg-bg-surface border border-white/5 rounded-xl p-5 shadow-xl h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-accent-500" />
            Letter Details
          </h3>
          
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Target Role
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
                required
              >
                <option value="">Select a saved job...</option>
                {savedJobs.map((sj) => (
                  <option key={sj.job_id} value={sj.job_id}>
                    {sj.jobs.title} at {sj.jobs.company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Resume Version
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
                required
              >
                <option value="">Select resume version...</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.version_name} (ATS: {v.ats_score}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Letter Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
              >
                <option value="Formal">Formal & Professional</option>
                <option value="Confident">Confident & Direct</option>
                <option value="Enthusiastic">Enthusiastic & Passionate</option>
                <option value="Concise">Short & Concise</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Highlight Project/Experience (optional)
              </label>
              <input
                type="text"
                value={customProject}
                onChange={(e) => setCustomProject(e.target.value)}
                placeholder="e.g. My Next.js SaaS app"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedJobId || !selectedResumeId}
              className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/20 text-white font-bold text-sm py-2.5 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Cover Letter'
              )}
            </button>
          </form>
        </section>

        {/* Output Column */}
        <section className="lg:col-span-2 bg-bg-surface border border-white/5 rounded-xl p-6 shadow-xl flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Generated Letter
              </h3>
              {coverLetter && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-md px-3 py-1"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Text
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed h-[300px] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded w-5/6"></div>
                  <div className="h-4 bg-white/5 rounded w-2/3"></div>
                  <div className="h-4 bg-white/5 rounded w-4/5"></div>
                </div>
              ) : coverLetter ? (
                coverLetter
              ) : (
                <div className="text-gray-500 text-center py-20">
                  Configure your settings on the left and click "Generate" to write your tailored cover letter.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
