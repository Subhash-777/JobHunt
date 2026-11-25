'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, FileText, Check, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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
    if (!selectedJobId || !selectedResumeId) {
      toast.error('Please select both a target job and a resume version.');
      return;
    }

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
        toast.success('Cover letter generated cleanly!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Generation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate cover letter.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success('Cover letter copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
          <FileText className="w-6 h-6 text-accent-500" />
          <span>AI Cover Letter Generator</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Generate custom, high-converting cover letters matching your resume versions and target roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <section className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-2xs h-fit space-y-4">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border-subtle pb-3">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <span>Generation Parameters</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label htmlFor="cl-job" className="block font-semibold text-text-secondary mb-1.5">Target Saved Job</label>
              <select
                id="cl-job"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
                required
              >
                <option value="">Select a saved job...</option>
                {savedJobs.map((sj) => (
                  <option key={sj.job_id} value={sj.job_id}>
                    {sj.jobs?.title} at {sj.jobs?.company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cl-resume" className="block font-semibold text-text-secondary mb-1.5">Resume Version</label>
              <select
                id="cl-resume"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
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
              <span className="block font-semibold text-text-secondary mb-1.5">Letter Tone</span>
              <div className="grid grid-cols-2 gap-2">
                {['Formal', 'Confident', 'Enthusiastic', 'Concise'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      tone === t
                        ? 'bg-accent-50 text-accent-600 border-accent-200 font-bold'
                        : 'bg-bg-elevated/60 text-text-secondary border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="cl-proj" className="block font-semibold text-text-secondary mb-1.5">Highlight Project (Optional)</label>
              <input
                id="cl-proj"
                type="text"
                value={customProject}
                onChange={(e) => setCustomProject(e.target.value)}
                placeholder="e.g. Next.js Distributed Job Queue"
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedJobId || !selectedResumeId}
              className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Cover Letter</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Output Column */}
        <section className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xs flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-border-subtle mb-4">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Generated Output</span>
              {coverLetter && (
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-text-tertiary">{coverLetter.length} chars</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-elevated px-3 py-1 rounded-lg border border-border-subtle"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="text-xs sm:text-sm text-text-secondary whitespace-pre-line leading-relaxed h-[330px] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex flex-col gap-3 animate-pulse pt-4">
                  <div className="h-4 bg-bg-elevated rounded w-3/4"></div>
                  <div className="h-4 bg-bg-elevated rounded w-5/6"></div>
                  <div className="h-4 bg-bg-elevated rounded w-2/3"></div>
                  <div className="h-4 bg-bg-elevated rounded w-4/5"></div>
                </div>
              ) : coverLetter ? (
                coverLetter
              ) : (
                <div className="text-text-tertiary text-center py-24 text-xs">
                  Select a saved job and resume version on the left, then click &ldquo;Generate Cover Letter&rdquo;.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
