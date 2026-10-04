'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Trash2, CheckCircle2, Circle, Sparkles, Download, BarChart2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ResumeVersion {
  id: string;
  version_name: string;
  role_tags: string[];
  storage_path: string;
  ats_score: number;
  is_default: boolean;
  created_at: string;
}

interface ResumeOutcome {
  resume_version_id: string;
  role_category: string;
  applications_sent: number;
  oa_count: number;
  interview_count: number;
  offer_count: number;
  resume_versions?: {
    version_name: string;
  };
}

interface ResumeLabClientProps {
  initialVersions: ResumeVersion[];
  initialOutcomes: ResumeOutcome[];
}

export function ResumeLabClient({ initialVersions, initialOutcomes }: ResumeLabClientProps) {
  const [versions, setVersions] = useState<ResumeVersion[]>(initialVersions);
  const [outcomes] = useState<ResumeOutcome[]>(initialOutcomes);
  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState('');
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !versionName.trim()) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('versionName', versionName);

      const res = await fetch('/api/resume-lab', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newVersion = await res.json();
        setVersions((prev) => [newVersion, ...prev]);
        setFile(null);
        setVersionName('');
      } else {
        const err = await res.json();
        alert(err.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/resume-lab/${id}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setVersions((prev) =>
          prev.map((v) => ({
            ...v,
            is_default: v.id === id,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/resume-lab/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setVersions((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(path, 60);

      if (error) {
        console.error(error);
        return;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen max-w-5xl mx-auto p-4 pt-10 pb-20 text-gray-200">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 mb-2">
          <FileText className="text-accent-500" />
          Resume Lab
        </h1>
        <p className="text-gray-400">
          Upload and manage multiple resume versions. Track how they convert applications to interviews and offers.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <section className="bg-bg-surface border border-white/5 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus size={16} className="text-accent-500" />
              Upload Version
            </h3>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                  Version Name
                </label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g., SDE Version, ML/Data Version"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">
                  Resume PDF File (max 5MB)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-gray-300 focus:outline-none file:bg-white/5 file:border-0 file:text-white file:text-xs file:py-1 file:px-2 file:rounded file:cursor-pointer"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm py-2.5 rounded-lg transition-colors mt-2"
              >
                {uploading ? 'Processing & Uploading...' : 'Upload PDF'}
              </button>
            </form>
          </section>

          {/* Performance Outcomes Stats */}
          <section className="bg-bg-surface border border-white/5 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-accent-500" />
              Outcome Analytics
            </h3>
            
            <div className="flex flex-col gap-4">
              {outcomes.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-6">
                  Apply to jobs using different resume versions in the Kanban board to build performance conversion stats here.
                </div>
              ) : (
                outcomes.map((out, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-lg p-3 text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-white truncate max-w-[150px]">
                        {out.resume_versions?.version_name || 'Resume version'}
                      </span>
                      <span className="text-[10px] text-accent-500 bg-accent-500/10 px-2 py-0.5 rounded-full capitalize font-bold">
                        {out.role_category}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] text-gray-400">
                      <div>
                        <div className="font-bold text-white">{out.applications_sent}</div>
                        <div>Sent</div>
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {out.applications_sent > 0 ? Math.round((out.oa_count / out.applications_sent) * 100) : 0}%
                        </div>
                        <div>OA Conv</div>
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {out.applications_sent > 0 ? Math.round((out.interview_count / out.applications_sent) * 100) : 0}%
                        </div>
                        <div>Intv Conv</div>
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {out.applications_sent > 0 ? Math.round((out.offer_count / out.applications_sent) * 100) : 0}%
                        </div>
                        <div>Offer Conv</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Versions Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Resume Versions ({versions.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {versions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full border border-dashed border-white/5 rounded-xl p-10 text-center text-gray-500"
                >
                  No resume versions uploaded. Upload your first PDF version on the left.
                </motion.div>
              ) : (
                versions.map((ver) => (
                  <motion.div
                    key={ver.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="job-card bg-bg-surface border border-white/5 p-5 rounded-xl flex flex-col justify-between gap-4 transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-md font-bold text-white line-clamp-1">{ver.version_name}</h4>
                          <span className="text-[9px] text-gray-500">
                            Uploaded {new Date(ver.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex-shrink-0 bg-accent-500/10 text-accent-500 border border-accent-500/20 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                          <Sparkles size={12} />
                          ATS: {ver.ats_score}%
                        </div>
                      </div>

                      {ver.role_tags && ver.role_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {ver.role_tags.map((tag, i) => (
                            <span key={i} className="bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded-full capitalize">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/5 gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSetDefault(ver.id)}
                          className={`flex items-center gap-1.5 text-xs font-medium py-1 px-2.5 rounded-lg border transition-all ${
                            ver.is_default
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400'
                          }`}
                        >
                          {ver.is_default ? (
                            <>
                              <CheckCircle2 size={14} />
                              Default
                            </>
                          ) : (
                            <>
                              <Circle size={14} />
                              Set Default
                            </>
                          )}
                        </button>

                        <a
                          href={`/ai/resume-analyse?resumeId=${ver.id}`}
                          className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-2.5 rounded-lg border bg-accent-500/10 border-accent-500/20 text-accent-400 hover:bg-accent-500/20 hover:border-accent-500/30 transition-all"
                        >
                          <Sparkles size={12} />
                          Analyse
                        </a>

                        <button
                          onClick={async () => {
                            if (!ver.ats_score) return;
                            try {
                              const res = await fetch('/api/resume-lab/benchmark', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  ats_score: ver.ats_score,
                                  role_tag: ver.role_tags?.[0] ?? null,
                                  got_interview: null,
                                  got_offer: null,
                                  yoe_bucket: '0-1'
                                })
                              });
                              if (res.ok) {
                                const stats = await fetch(
                                  `/api/resume-lab/benchmark?ats_score=${ver.ats_score}` +
                                  (ver.role_tags?.[0] ? `&role_tag=${encodeURIComponent(ver.role_tags[0])}` : '')
                                ).then(r => r.json());
                                if (stats.percentile !== null) {
                                  alert(`🎯 Your ATS score (${ver.ats_score}%) is higher than ${stats.percentile}% of ${stats.count} resumes for similar roles.\nCommunity avg: ${stats.avg_score}% | Interview rate: ${stats.interview_rate}%`);
                                } else {
                                  alert(`Score shared! You\\'re one of the first to benchmark this role.`);
                                }
                              }
                            } catch {
                              // silent
                            }
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-2.5 rounded-lg border bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all"
                          title="Compare score anonymously with community"
                        >
                          📊 Benchmark
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownload(ver.storage_path)}
                          className="p-1.5 border border-white/10 hover:border-white/20 bg-white/5 text-gray-300 rounded-lg transition-all"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(ver.id)}
                          className="p-1.5 border border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                          title="Delete Version"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
