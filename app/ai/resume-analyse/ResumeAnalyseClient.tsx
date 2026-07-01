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
    <main className="min-h-screen max-w-5xl mx-auto p-4 pt-10 pb-20 text-gray-200">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 mb-2">
          <Sparkles className="text-accent-500" />
          ATS Resume Analyzer
        </h1>
        <p className="text-gray-400">
          Optimize your resume for specific openings by analyzing missing keywords, formatting weaknesses, and overall score match.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Column */}
        <section className="bg-bg-surface border border-white/5 rounded-xl p-5 shadow-xl h-fit lg:col-span-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText size={16} className="text-accent-500" />
            Analysis Parameters
          </h3>
          
          <form onSubmit={handleAnalyse} className="flex flex-col gap-4">
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
                <option value="">Select version...</option>
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.version_name} (ATS: {v.ats_score}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                Target Opening
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
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

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="leaderboard"
                checked={optInLeaderboard}
                onChange={(e) => setOptInLeaderboard(e.target.checked)}
                className="rounded border-white/10 text-accent-500 focus:ring-accent-500/20 bg-white/5 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="leaderboard" className="text-xs text-gray-400 select-none cursor-pointer flex items-center gap-1.5">
                <Trophy size={12} className="text-yellow-500/80" />
                Submit score anonymously to leaderboard
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedJobId || !selectedResumeId}
              className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/20 text-white font-bold text-sm py-2.5 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2"
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
        <section className="lg:col-span-2 bg-bg-surface border border-white/5 rounded-xl p-6 shadow-xl flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ATS Scan Results
              </h3>
            </div>

            <div className="text-sm text-gray-300 leading-relaxed pr-1">
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
                      <div className="h-16 w-16 bg-white/5 rounded-full"></div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 bg-white/5 rounded w-1/3"></div>
                        <div className="h-3 bg-white/5 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    <div className="h-20 bg-white/5 rounded w-full"></div>
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
                    <div className="flex items-center gap-5 bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="text-3xl font-extrabold text-accent-500 bg-accent-500/10 border border-accent-500/20 px-4 py-3 rounded-full flex items-center justify-center h-20 w-20 flex-shrink-0">
                        {analysis.atsScore}%
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">ATS Compatibility Score</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {analysis.feedback?.summary || 'Optimization score details parsed below.'}
                        </p>
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-orange-400" />
                        Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                          analysis.missingKeywords.map((kw: string, i: number) => (
                            <span key={i} className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-md text-xs font-medium">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                            <CheckCircle2 size={14} />
                            All major keywords matched!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Section Feedback */}
                    {analysis.feedback?.sections && (
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                          Formatting & Section Improvements
                        </h4>
                        <div className="flex flex-col gap-3">
                          {analysis.feedback.sections.map((sec: any, i: number) => (
                            <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs">
                              <h5 className="font-bold text-white mb-1 capitalize">{sec.name}</h5>
                              <p className="text-gray-400 leading-normal">{sec.improvement}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-gray-500 text-center py-20">
                    Configure your parameters on the left and run scan to display your ATS alignment results.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
