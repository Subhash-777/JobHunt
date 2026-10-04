import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Award, Zap, Code, ShieldCheck } from 'lucide-react';

export default async function InsightsPage() {
  const supabase = await createClient();

  // Fetch all key_skills from jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('key_skills, ctc_bucket, role_category')
    .limit(500);

  const skillCounts: Record<string, number> = {};
  if (jobs) {
    for (const j of jobs) {
      if (Array.isArray(j.key_skills)) {
        for (const s of j.key_skills) {
          const norm = s.trim();
          if (norm) {
            skillCounts[norm] = (skillCounts[norm] || 0) + 1;
          }
        }
      }
    }
  }

  const sortedSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  // Fetch community conversion reports
  const { data: conversionReports } = await supabase
    .from('community_conversion_reports')
    .select('*')
    .order('report_count', { ascending: false })
    .limit(10);

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent-500" />
          <span>India Tech Market Intelligence</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Real-time aggregated skill demand, salary metrics, and crowdsourced funnel acceptance rates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Demanded Tech Skills */}
        <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-accent-500" />
            <span>Most Demanded Tech Skills</span>
          </h2>

          <div className="space-y-2.5">
            {sortedSkills.map(([skill, count], idx) => (
              <div key={skill} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-bg-elevated border border-border-subtle">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-accent-500/10 text-accent-400 font-mono font-bold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-text-primary">{skill}</span>
                </div>
                <span className="font-mono text-text-secondary">{count} active roles</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insights Cards & Company Funnels */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-2">
            <h3 className="text-xs font-bold text-accent-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Freshers vs Experienced CTC Spread
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Fresher roles (0–2 yrs) in Indiatech average <strong>₹6.5 - ₹12 LPA</strong>, while Senior roles (5+ yrs) reach <strong>₹28+ LPA</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Top Recruiting Portals
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Unstop & Internshala lead for Off-Campus drives & hackathons; Ashby & Greenhouse lead for High-Growth ATS feeds.
            </p>
          </div>

          {/* Company Acceptance Rates Section */}
          <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-3">
            <h3 className="text-xs font-bold text-saffron-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4" /> Company Acceptance & Funnel Rates
            </h3>
            
            {(!conversionReports || conversionReports.length === 0) ? (
              <p className="text-xs text-text-tertiary">
                No community conversion reports submitted yet. Move tracked applications to Offer or Rejected to share outcomes!
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {conversionReports.map((rep: any) => {
                  const cnt = rep.report_count || 1;
                  const oaPct = Math.round((rep.got_oa / cnt) * 100);
                  const intPct = Math.round((rep.got_interview / cnt) * 100);
                  const offerPct = Math.round((rep.got_shortlisted / cnt) * 100);

                  return (
                    <div key={rep.id} className="p-3 bg-bg-elevated border border-border-subtle rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-text-primary">{rep.company}</strong>
                        <span className="text-[10px] text-text-tertiary">{cnt} reports</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                        <span>OA: <strong className="text-purple-400">{oaPct}%</strong></span>
                        <span>Interview: <strong className="text-accent-400">{intPct}%</strong></span>
                        <span>Offer: <strong className="text-emerald-400">{offerPct}%</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
