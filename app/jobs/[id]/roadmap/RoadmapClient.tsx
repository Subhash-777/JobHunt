'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Bookmark, ExternalLink, GraduationCap, RefreshCw } from 'lucide-react';

interface RoadmapClientProps {
  job: any;
}

export function RoadmapClient({ job }: RoadmapClientProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const res = await fetch(`/api/jobs/${job.id}/roadmap`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, [job.id]);

  const handleMarkAsLearned = async (skill: string) => {
    setUpdatingSkill(skill);
    try {
      const res = await fetch(`/api/jobs/${job.id}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill }),
      });

      if (res.ok) {
        setLearnedSkills((prev) => [...prev, skill.toLowerCase()]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingSkill(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <header className="border-b border-border-subtle pb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-600 bg-accent-50 border border-accent-100 px-2.5 py-0.5 rounded-full">
          Skill Gap Roadmap
        </span>
        <h1 className="text-2xl font-display font-extrabold text-text-primary mt-2">
          {job.title} — {job.company}
        </h1>
      </header>

      {loading ? (
        <div className="flex flex-col gap-5 animate-pulse">
          <div className="h-12 bg-bg-surface border border-border-subtle rounded-xl w-1/3"></div>
          <div className="h-40 bg-bg-surface border border-border-subtle rounded-2xl w-full"></div>
          <div className="h-40 bg-bg-surface border border-border-subtle rounded-2xl w-full"></div>
        </div>
      ) : data ? (
        <div className="flex flex-col gap-5">
          {data.missingSkills.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center flex flex-col gap-3 items-center"
            >
              <div className="h-12 w-12 bg-white border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-text-primary">Full Skills Match!</h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-md leading-relaxed">
                  Your profile already covers the key skills specified in this job description.
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="bg-bg-surface border border-border-subtle p-5 rounded-2xl shadow-2xs flex items-center gap-4">
                <div className="h-12 w-12 bg-accent-50 border border-accent-100 rounded-xl flex items-center justify-center text-accent-600 shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-text-primary">Roadmap to Close Skill Gaps</h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Detected {data.missingSkills.length} missing skill{data.missingSkills.length > 1 ? 's' : ''} on your profile. Work through the free resources below.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {data.roadmap?.sections?.map((sec: any, idx: number) => {
                  const isLearned = learnedSkills.includes(sec.skill.toLowerCase());
                  return (
                    <motion.section
                      key={idx}
                      layout
                      className={`bg-bg-surface border p-5 rounded-2xl shadow-2xs transition-all flex flex-col gap-4 ${
                        isLearned ? 'border-emerald-200 bg-emerald-50/30' : 'border-border-subtle'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 border-b border-border-subtle pb-3">
                        <div>
                          <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
                            {sec.skill}
                            {isLearned && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                Learned
                              </span>
                            )}
                          </h3>
                          <span className="text-[11px] text-text-tertiary uppercase tracking-wider font-semibold">
                            Study Roadmap
                          </span>
                        </div>

                        {!isLearned && (
                          <button
                            onClick={() => handleMarkAsLearned(sec.skill)}
                            disabled={updatingSkill === sec.skill}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            {updatingSkill === sec.skill ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            Mark Learned
                          </button>
                        )}
                      </div>

                      {sec.topics && sec.topics.length > 0 && (
                        <div>
                          <h4 className="text-[11px] text-text-tertiary uppercase tracking-wider font-semibold mb-2">
                            Core Concepts & Topics
                          </h4>
                          <div className="flex flex-col gap-1.5">
                            {sec.topics.map((topic: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                                <span className="w-1.5 h-1.5 bg-accent-500 rounded-full shrink-0" />
                                {topic}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sec.resources && sec.resources.length > 0 && (
                        <div className="pt-3 border-t border-border-subtle">
                          <h4 className="text-[11px] text-accent-600 uppercase tracking-wider font-bold mb-2 flex items-center gap-1">
                            <Sparkles size={12} />
                            Free Learning Resources
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {sec.resources.map((res: any, i: number) => (
                              <a
                                key={i}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-bg-base hover:bg-accent-50 border border-border-subtle hover:border-accent-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-semibold text-text-primary transition-all group"
                              >
                                <span className="truncate max-w-[200px] flex items-center gap-1.5">
                                  <Bookmark size={12} className="text-text-tertiary group-hover:text-accent-500 transition-colors shrink-0" />
                                  {res.name}
                                </span>
                                <ExternalLink size={12} className="text-text-tertiary group-hover:text-accent-600 transition-colors shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.section>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-text-tertiary text-center py-20 text-sm">Roadmap generation failed.</div>
      )}
    </div>
  );
}
