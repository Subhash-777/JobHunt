'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, CheckCircle2, AlertCircle, RefreshCw, Trophy } from 'lucide-react';

interface ResumeAnalyseClientProps {
  savedJobs: any[];
  versions: any[];
}

export function ResumeAnalyseClient({ savedJobs, versions }: ResumeAnalyseClientProps) {
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get('resumeId') || '';
  const jobIdParam = searchParams.get('jobId') || '';

  const [selectedJobId, setSelectedJobId] = useState(jobIdParam);
  const [selectedResumeId, setSelectedResumeId] = useState(resumeIdParam);
  const [optInLeaderboard, setOptInLeaderboard] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !selectedResumeId) return;

    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch('/api/ai/resume-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobId,
          resumeVersionId: selectedResumeId,
          optInLeaderboard,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      } else {
        const err = await res.json();
        alert(err.error || 'Analysis failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <header className="pb-4 border-b border-border-subtle">
        <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent-500" />
          <span>ATS Resume Analyser</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Optimize your resume for specific openings by analyzing missing keywords, section quality, and ATS compatibility.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Column */}
        <section className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-2xs h-fit lg:col-span-1">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-border-subtle pb-3">
            <FileText size={16} className="text-accent-500" />
            Analysis Parameters
          </h2>

          <form onSubmit={handleAnalyse} className="flex flex-col gap-4 text-xs">
            <div>
              <label htmlFor="ana-resume" className="block font-semibold text-text-secondary mb-1.5">
                Resume Version
              </label>
              <select
                id="ana-resume"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
                required
              >
                <option value="">Select version...</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.version_name} (ATS: {v.ats_score}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ana-job" className="block font-semibold text-text-secondary mb-1.5">
                Target Opening
              </label>
              <select
                id="ana-job"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
                required
              >
                <option value="">Select saved job...</option>
                {savedJobs.map((sj) => (
                  <option key={sj.job_id} value={sj.job_id}>
                    {sj.jobs.title} at {sj.jobs.company}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="leaderboard"
                checked={optInLeaderboard}
                onChange={(e) => setOptInLeaderboard(e.target.checked)}
                className="rounded border-border-default text-accent-500 focus:ring-accent-500/20 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="leaderboard" className="text-xs text-text-secondary select-none cursor-pointer flex items-center gap-1.5">
                <Trophy size={13} className="text-amber-500" />
                Submit score anonymously to leaderboard
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedJobId || !selectedResumeId}
              className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors mt-1 flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Run ATS Scan'
              )}
            </button>
          </form>
        </section>

        {/* Results Column */}
        <section className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-2xs flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-border-subtle mb-4">
              <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                ATS Scan Results
              </h2>
            </div>

            <div className="text-sm text-text-secondary leading-relaxed pr-1">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-5 animate-pulse"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 bg-bg-elevated rounded-full"></div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 bg-bg-elevated rounded w-1/3"></div>
                        <div className="h-3 bg-bg-elevated rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-bg-elevated rounded w-3/4"></div>
                    <div className="h-20 bg-bg-elevated rounded w-full"></div>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-6"
                  >
                    {/* Score Summary */}
                    <div className="flex items-center gap-5 bg-bg-base p-4 rounded-2xl border border-border-subtle">
                      <div className="text-2xl font-display font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-full flex items-center justify-center h-20 w-20 shrink-0">
                        {analysis.atsScore}%
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-text-primary text-base">ATS Compatibility Score</h3>
                        <p className="text-xs text-text-secondary mt-1">
                          {analysis.feedback?.summary || 'Optimization score details parsed below.'}
                        </p>
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-amber-600" />
                        Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                          analysis.missingKeywords.map((kw: string, i: number) => (
                            <span key={i} className="bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-medium">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-emerald-700 text-xs flex items-center gap-1 font-semibold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 size={14} />
                            All major keywords matched!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Section Feedback */}
                    {analysis.feedback?.sections && (
                      <div>
                        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2.5">
                          Formatting & Section Improvements
                        </h3>
                        <div className="flex flex-col gap-3">
                          {analysis.feedback.sections.map((sec: any, i: number) => (
                            <div key={i} className="bg-bg-base p-3.5 rounded-xl border border-border-subtle text-xs">
                              <h4 className="font-bold text-text-primary mb-1 capitalize">{sec.name}</h4>
                              <p className="text-text-secondary leading-normal">{sec.improvement}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-text-tertiary text-center py-20 text-xs">
                    Select your resume version and target job on the left, then run the scan to inspect ATS alignment.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
