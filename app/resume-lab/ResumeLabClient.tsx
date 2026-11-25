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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <header className="pb-4 border-b border-border-subtle">
        <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
          <FileText className="w-6 h-6 text-accent-500" />
          <span>Resume Lab</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Manage multiple tailored PDF versions, compare ATS scores anonymously, and track interview conversion rates.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="flex flex-col gap-5 lg:col-span-1">
          <section className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-2xs">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus size={16} className="text-accent-500" />
              Upload Resume Version
            </h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div>
                <label htmlFor="res-ver-name" className="block text-[11px] text-text-secondary font-semibold mb-1.5">
                  Version Name
                </label>
                <input
                  id="res-ver-name"
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g., SDE Version, ML/Data Version"
                  className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-500 focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="res-pdf-file" className="block text-[11px] text-text-secondary font-semibold mb-1.5">
                  Resume PDF (max 5MB)
                </label>
                <input
                  id="res-pdf-file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full bg-bg-elevated/60 border border-border-subtle rounded-xl p-2 text-xs text-text-secondary focus:outline-none file:mr-3 file:bg-white file:border file:border-border-subtle file:text-text-primary file:font-semibold file:text-xs file:py-1 file:px-2.5 file:rounded-lg file:cursor-pointer"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors shadow-xs"
              >
                {uploading ? 'Processing & Uploading...' : 'Upload PDF'}
              </button>
            </form>
          </section>

          {/* Performance Outcomes Stats */}
          <section className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-2xs">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-accent-500" />
              Outcome Analytics
            </h2>

            <div className="flex flex-col gap-3">
              {outcomes.length === 0 ? (
                <div className="text-xs text-text-tertiary text-center py-6">
                  Apply to jobs using different resume versions in the Kanban tracker to see conversion stats here.
                </div>
              ) : (
                outcomes.map((out, idx) => (
                  <div key={idx} className="bg-bg-base border border-border-subtle rounded-xl p-3 text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-text-primary truncate max-w-[150px]">
                        {out.resume_versions?.version_name || 'Resume version'}
                      </span>
                      <span className="text-[10px] text-accent-600 bg-accent-50 border border-accent-100 px-2 py-0.5 rounded-full capitalize font-bold">
                        {out.role_category}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] text-text-secondary">
                      <div>
                        <div className="font-bold text-text-primary">{out.applications_sent}</div>
                        <div>Sent</div>
                      </div>
                      <div>
                        <div className="font-bold text-text-primary">
                          {out.applications_sent > 0 ? Math.round((out.oa_count / out.applications_sent) * 100) : 0}%
                        </div>
                        <div>OA</div>
                      </div>
                      <div>
                        <div className="font-bold text-text-primary">
                          {out.applications_sent > 0 ? Math.round((out.interview_count / out.applications_sent) * 100) : 0}%
                        </div>
                        <div>Intv</div>
                      </div>
                      <div>
                        <div className="font-bold text-emerald-700">
                          {out.applications_sent > 0 ? Math.round((out.offer_count / out.applications_sent) * 100) : 0}%
                        </div>
                        <div>Offer</div>
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
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
            Resume Versions ({versions.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {versions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full bg-bg-surface border border-dashed border-border-default rounded-2xl p-10 text-center text-xs text-text-tertiary"
                >
                  No resume versions uploaded yet. Upload your first PDF on the left.
                </motion.div>
              ) : (
                versions.map((ver) => (
                  <motion.div
                    key={ver.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="job-card p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-base font-display font-bold text-text-primary line-clamp-1">{ver.version_name}</h3>
                          <span className="text-[11px] text-text-tertiary">
                            Uploaded {new Date(ver.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                          <Sparkles size={12} />
                          ATS: {ver.ats_score}%
                        </div>
                      </div>

                      {ver.role_tags && ver.role_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          {ver.role_tags.map((tag, i) => (
                            <span key={i} className="bg-bg-elevated border border-border-subtle text-text-secondary px-2.5 py-0.5 rounded-full capitalize font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border-subtle gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleSetDefault(ver.id)}
                          className={`flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-lg border transition-all ${
                            ver.is_default
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-bg-elevated border-border-subtle hover:border-border-default text-text-secondary'
                          }`}
                        >
                          {ver.is_default ? (
                            <>
                              <CheckCircle2 size={13} />
                              Default
                            </>
                          ) : (
                            <>
                              <Circle size={13} />
                              Set Default
                            </>
                          )}
                        </button>

                        <a
                          href={`/ai/resume-analyse?resumeId=${ver.id}`}
                          className="flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-lg border bg-accent-50 border-accent-100 text-accent-600 hover:bg-accent-100 transition-all"
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
                                  alert(`Your ATS score (${ver.ats_score}%) is higher than ${stats.percentile}% of ${stats.count} resumes for similar roles.\nCommunity avg: ${stats.avg_score}% | Interview rate: ${stats.interview_rate}%`);
                                } else {
                                  alert(`Score shared! You're one of the first to benchmark this role.`);
                                }
                              }
                            } catch {
                              // silent
                            }
                          }}
                          className="flex items-center gap-1 text-xs font-semibold py-1 px-2.5 rounded-lg border bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 transition-all"
                          title="Compare score anonymously with community"
                        >
                          Benchmark
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownload(ver.storage_path)}
                          className="p-1.5 border border-border-subtle hover:border-border-default bg-bg-elevated text-text-secondary hover:text-text-primary rounded-lg transition-all"
                          title="Download PDF"
                          aria-label="Download PDF"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(ver.id)}
                          className="p-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                          title="Delete Version"
                          aria-label="Delete resume version"
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
    </div>
  );
}
