import { createClient } from '@/lib/supabase/server';
import { Users, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Interview Experiences — JobHunt India',
  description: 'Crowdsourced interview rounds, technical questions, and candidate reviews for top Indian tech companies.',
};

export default async function InterviewCommunityPage() {
  const supabase = await createClient();

  const { data: experiences } = await supabase
    .from('interview_experiences')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl font-display font-extrabold text-text-primary flex items-center gap-2">
          <Users className="w-6 h-6 text-accent-500" />
          <span>Interview Experience Feed</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Crowdsourced interview rounds, technical questions, and candidate reviews for top Indian tech companies.
        </p>
      </div>

      <div className="space-y-4">
        {(!experiences || experiences.length === 0) ? (
          <div className="py-16 text-center bg-bg-surface border border-border-subtle rounded-2xl p-8 space-y-3 shadow-2xs">
            <MessageSquare className="w-10 h-10 text-accent-500 mx-auto opacity-60" />
            <h2 className="text-sm font-semibold text-text-primary">Be the first to share an interview experience!</h2>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Help fellow candidates prepare for Online Assessments and System Design rounds.
            </p>
          </div>
        ) : (
          experiences.map((exp: any) => (
            <div key={exp.id} className="p-5 bg-bg-surface border border-border-subtle rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-accent-600">{exp.company_name}</span>
                <span className="text-[11px] text-text-tertiary font-mono">{exp.role_title}</span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{exp.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
