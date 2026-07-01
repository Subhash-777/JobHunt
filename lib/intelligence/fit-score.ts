import { callAICascade } from '@/lib/ai/cascade';

interface Job {
  id: string;
  title: string;
  company: string;
  role_category: string;
  location?: string[];
  work_mode?: string;
  key_skills?: string[];
  description?: string;
  experience_max?: number;
  cgpa_cutoff?: number;
  batch_years?: number[];
  degree_required?: string[];
  branch_required?: string[];
}

interface Profile {
  id: string;
  skills?: string[];
  preferred_roles?: string[];
  preferred_locations?: string[];
  graduation_year?: number;
  cgpa?: number;
  branch?: string;
  degree?: string;
  resume_text?: string;
  experience?: any;
}

function computeFallbackSignals(job: Job, profile: Profile, resumeText: string) {
  const jobWords = new Set((job.description || '').toLowerCase().match(/\b\w{4,}\b/g) || []);
  const resumeWords = new Set(resumeText.toLowerCase().match(/\b\w{4,}\b/g) || []);
  
  let keywordOverlap = 0.5;
  if (jobWords.size > 0 && resumeWords.size > 0) {
    let intersection = 0;
    for (const w of jobWords) {
      if (resumeWords.has(w)) intersection++;
    }
    keywordOverlap = intersection / Math.min(jobWords.size, 55);
    if (keywordOverlap > 1) keywordOverlap = 1;
  }
  
  const experienceText = JSON.stringify(profile.experience || '').toLowerCase();
  let projectOverlap = 0.3;
  if (job.description && experienceText.length > 2) {
    const descWords = (job.description).toLowerCase().match(/\b\w{4,}\b/g) || [];
    let intersection = 0;
    const checked = new Set();
    for (const w of descWords) {
      if (experienceText.includes(w) && !checked.has(w)) {
        intersection++;
        checked.add(w);
      }
    }
    projectOverlap = intersection / Math.min(descWords.length, 35);
    if (projectOverlap > 1) projectOverlap = 1;
    if (projectOverlap < 0.3) projectOverlap = 0.3;
  }
  
  return {
    resumeKeywordSimilarity: keywordOverlap,
    projectOverlapSignal: projectOverlap
  };
}

async function computeAIAssistedSignals(job: Job, profile: Profile, resumeText: string) {
  const projectsText = JSON.stringify(profile.experience || []);
  
  const systemPrompt = `You are an ATS parser assessing alignment between a candidate's profile and a job listing.
Respond ONLY with a JSON object in the following format:
{
  "resumeKeywordSimilarity": <number between 0 and 1>,
  "projectOverlapSignal": <number between 0 and 1>
}`;

  const prompt = `Job Title: ${job.title}
Job Description: ${job.description || ''}
Candidate Skills: ${profile.skills?.join(', ') || ''}
Candidate Resume Text: ${resumeText}
Candidate Projects/Experience: ${projectsText}`;

  try {
    const result = await callAICascade({
      prompt,
      systemPrompt,
      jsonMode: true,
      feature: 'fit_score'
    });
    
    const parsed = JSON.parse(result.text);
    return {
      resumeKeywordSimilarity: Number(parsed.resumeKeywordSimilarity) || 0.5,
      projectOverlapSignal: Number(parsed.projectOverlapSignal) || 0.5
    };
  } catch (err) {
    console.error('AI Assisted Signals calculation failed, falling back to rule-based overlap:', err);
    return computeFallbackSignals(job, profile, resumeText);
  }
}

export async function computeFitScore(job: Job, profile: Profile, resumeVersion?: any, useAI = true) {
  const userSkills = new Set((profile.skills ?? []).map(s => s.toLowerCase()));
  const jobSkills  = job.key_skills ?? [];

  const skillOverlapRatio = jobSkills.length
    ? jobSkills.filter(s => userSkills.has(s.toLowerCase())).length / jobSkills.length
    : 0.5;

  const preferredRoleMatch      = profile.preferred_roles?.includes(job.role_category) ? 1 : 0.3;
  const locationPreferenceMatch = profile.preferred_locations?.some(l => job.location?.includes(l)) ? 1
                                  : job.work_mode === 'remote' ? 0.8 : 0.2;
  
  const experienceMatch = (profile.graduation_year && job.experience_max != null)
    ? (job.experience_max <= 2 ? 1 : 0.4)
    : 0.5;

  const resumeText = resumeVersion?.resume_text || profile.resume_text || '';
  
  const { resumeKeywordSimilarity, projectOverlapSignal } = useAI
    ? await computeAIAssistedSignals(job, profile, resumeText)
    : computeFallbackSignals(job, profile, resumeText);

  const score = Math.round(100 * (
    0.30 * skillOverlapRatio +
    0.15 * projectOverlapSignal +
    0.20 * resumeKeywordSimilarity +
    0.15 * preferredRoleMatch +
    0.10 * locationPreferenceMatch +
    0.10 * experienceMatch
  ));

  return {
    score,
    components: {
      skillOverlapRatio,
      preferredRoleMatch,
      locationPreferenceMatch,
      experienceMatch,
      resumeKeywordSimilarity,
      projectOverlapSignal
    }
  };
}

export async function getOrComputeFitScore(job: Job, profile: Profile, supabase: any, useAI = true) {
  try {
    const { data: existing } = await supabase
      .from('fit_scores')
      .select('*')
      .eq('user_id', profile.id)
      .eq('job_id', job.id)
      .maybeSingle();
      
    if (existing) {
      return existing;
    }
    
    const { score, components } = await computeFitScore(job, profile, null, useAI);
    
    const { data: saved, error } = await supabase
      .from('fit_scores')
      .insert({
        user_id: profile.id,
        job_id: job.id,
        score,
        components,
        provider: useAI ? 'cascade' : 'fallback'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Failed to save computed fit score:', error);
    }
    return saved || { score, components };
  } catch (err) {
    console.error('Failed to get or compute fit score:', err);
    return { score: 50, components: {} };
  }
}
