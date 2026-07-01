import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';
import { callAICascade } from '@/lib/ai/cascade';

export async function POST(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, resumeVersionId, tone, customProject } = body;

    if (!jobId || !resumeVersionId) {
      return NextResponse.json({ error: 'Missing jobId or resumeVersionId' }, { status: 400 });
    }

    // 1. Fetch job description
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // 2. Fetch resume version text
    const { data: resume } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('id', resumeVersionId)
      .eq('user_id', user.id)
      .single();

    if (!resume) {
      return NextResponse.json({ error: 'Resume version not found' }, { status: 404 });
    }

    // 3. Generate Cover Letter
    const systemPrompt = `You are a professional cover letter writer. Generate a tailored, high-converting cover letter based on the candidate's resume and target job details.
Adjust the tone as requested: ${tone || 'Formal'}.
${customProject ? `Highlight the candidate's project: "${customProject}".` : ''}
Output ONLY the cover letter text, formatted with clean paragraphs. No placeholder brackets, no extra chat.`;

    const prompt = `Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description || ''}

Candidate Resume Text:
${resume.resume_text || ''}`;

    const res = await callAICascade({
      prompt,
      systemPrompt,
      feature: 'cover_letter'
    });

    return NextResponse.json({ coverLetter: res.text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
