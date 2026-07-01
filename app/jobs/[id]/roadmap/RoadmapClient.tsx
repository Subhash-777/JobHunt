'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <main className="min-h-screen max-w-3xl mx-auto p-4 pt-10 pb-20 text-gray-200">
      <header className="mb-8 border-b border-white/5 pb-4">
        <span className="text-[10px] text-accent-500 bg-accent-500/10 px-2 py-0.5 rounded-full capitalize font-bold">
          Skill Gap Roadmap
        </span>
        <h1 className="text-2xl font-bold text-white mt-2">
          {job.title} — {job.company}
        </h1>
      </header>

      {loading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-10 bg-white/5 rounded w-1/3"></div>
          <div className="h-40 bg-white/5 rounded w-full"></div>
          <div className="h-40 bg-white/5 rounded w-full"></div>
        </div>
      ) : data ? (
        <div className="flex flex-col gap-6">
          {data.missingSkills.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl text-center flex flex-col gap-3 items-center"
            >
              <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Full Skills Match!</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-md leading-relaxed">
                  Your profile lists all the key skills specified in this job description. You are ready to apply!
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Overview panel */}
              <div className="bg-bg-surface border border-white/5 p-5 rounded-xl shadow-xl flex items-center gap-4">
                <div className="h-12 w-12 bg-accent-500/10 rounded-full flex items-center justify-center text-accent-500">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Roadmap to Close Skill Gaps</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    We detected {data.missingSkills.length} missing skill{data.missingSkills.length > 1 ? 's' : ''} on your profile. Study the roadmaps below to prepare.
                  </p>
                </div>
              </div>

              {/* Learning Sections */}
              <div className="flex flex-col gap-6">
                {data.roadmap?.sections?.map((sec: any, idx: number) => {
                  const isLearned = learnedSkills.includes(sec.skill.toLowerCase());
                  return (
                    <motion.section
                      key={idx}
                      layout
                      className={`bg-bg-surface border p-5 rounded-xl shadow-md transition-all flex flex-col gap-4 ${
                        isLearned ? 'border-emerald-500/30 opacity-75' : 'border-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 border-b border-white/5 pb-3">
                        <div>
                          <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            {sec.skill}
                            {isLearned && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full capitalize font-bold">
                                Learned
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                            Study Roadmap
                          </span>
                        </div>

                        {!isLearned && (
                          <button
                            onClick={() => handleMarkAsLearned(sec.skill)}
                            disabled={updatingSkill === sec.skill}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/20 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
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

                      {/* Topics */}
                      {sec.topics && sec.topics.length > 0 && (
                        <div>
                          <h5 className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">
                            Core Concepts & Topics
                          </h5>
                          <div className="flex flex-col gap-1.5">
                            {sec.topics.map((topic: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                                <span className="w-1.5 h-1.5 bg-accent-500 rounded-full" />
                                {topic}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resources */}
                      {sec.resources && sec.resources.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                          <h5 className="text-[10px] text-accent-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                            <Sparkles size={12} />
                            Free Learning Resources
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {sec.resources.map((res: any, i: number) => (
                              <a
                                key={i}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-2.5 flex items-center justify-between text-xs font-semibold text-white transition-all group"
                              >
                                <span className="truncate max-w-[200px] flex items-center gap-1.5">
                                  <Bookmark size={12} className="text-gray-400 group-hover:text-accent-500 transition-colors" />
                                  {res.name}
                                </span>
                                <ExternalLink size={12} className="text-gray-500 group-hover:text-white transition-colors" />
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
        <div className="text-gray-500 text-center py-20">Roadmap generation failed.</div>
      )}
    </main>
  );
}
