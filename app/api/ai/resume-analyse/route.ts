import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';
import { callAICascade } from '@/lib/ai/cascade';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeVersionId, jobId, optInLeaderboard } = body;

    if (!resumeVersionId || !jobId) {
      return NextResponse.json({ error: 'Missing resumeVersionId or jobId' }, { status: 400 });
    }

    // 1. Fetch resume text
    const { data: resume } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('id', resumeVersionId)
      .eq('user_id', user.id)
      .single();

    if (!resume) {
      return NextResponse.json({ error: 'Resume version not found' }, { status: 404 });
    }

    // 2. Fetch job
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // 3. Analyze via AI Cascade
    const systemPrompt = `You are an expert resume analyzer and ATS optimization system. Analyze the candidate's resume text against the target job description.
Respond ONLY with a JSON object in the following format:
{
  "atsScore": <number between 0 and 100>,
  "missingKeywords": [<string>, <string>],
  "feedback": {
    "summary": "<string>",
    "sections": [
      { "name": "<section name>", "improvement": "<string>" }
    ]
  }
}`;

    const prompt = `Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description || ''}

Candidate Resume Text:
${resume.resume_text || ''}`;

    const res = await callAICascade({
      prompt,
      systemPrompt,
      jsonMode: true,
      feature: 'resume_analyse_detailed'
    });

    const parsed = JSON.parse(res.text);

    // 4. Opt-in submission to resume_leaderboard (anonymous)
    if (optInLeaderboard) {
      const admin = supabaseAdmin();
      await admin
        .from('resume_leaderboard')
        .insert({
          job_id: jobId,
          score: parsed.atsScore || 70
        });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
