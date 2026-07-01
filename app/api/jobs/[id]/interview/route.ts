import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';
import { callAICascade } from '@/lib/ai/cascade';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch job description to customize questions
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // 2. Generate questions via AI Cascade
    const systemPrompt = `You are an expert interviewer. Generate a structured list of interview questions tailored to the job details.
For SDE roles, return:
- 3 DSA/technical questions
- 2 System Design questions
- 3 Domain-specific questions
- 2 HR/behavioral questions
For other roles, generate appropriate equivalent categories.
Respond ONLY with a JSON object in this format:
{
  "questions": [
    { "id": "<string unique>", "text": "<question text>", "category": "<string category>" }
  ]
}`;

    const prompt = `Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description || ''}`;

    const res = await callAICascade({
      prompt,
      systemPrompt,
      jsonMode: true,
      feature: 'mock_interview'
    });

    const parsed = JSON.parse(res.text);
    const questions = parsed.questions || [];

    // 3. Insert new mock session
    const admin = supabaseAdmin();
    const { data: session, error: insertErr } = await admin
      .from('mock_sessions')
      .insert({
        user_id: user.id,
        job_id: jobId,
        questions,
        answers: [],
        completed: false
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json(session);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, questionId, questionText, answerText } = body;

    if (!sessionId || !questionId || !questionText || !answerText) {
      return NextResponse.json({ error: 'Missing required evaluation fields' }, { status: 400 });
    }

    // 1. Fetch current session
    const admin = supabaseAdmin();
    const { data: session } = await admin
      .from('mock_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Evaluate answer via AI Cascade
    const systemPrompt = `You are an expert interviewer. Assess the candidate's answer to the given question.
Provide a score between 0 and 100, and constructive, concise feedback.
Respond ONLY with a JSON object in this format:
{
  "score": <number>,
  "feedback": "<string feedback>"
}`;

    const prompt = `Question: ${questionText}
Candidate Answer: ${answerText}`;

    const res = await callAICascade({
      prompt,
      systemPrompt,
      jsonMode: true,
      feature: 'mock_interview_eval'
    });

    const evalResult = JSON.parse(res.text);

    // 3. Append to answers array and check if all questions are answered
    const currentAnswers = Array.isArray(session.answers) ? session.answers : [];
    const updatedAnswers = [
      ...currentAnswers.filter((a: any) => a.questionId !== questionId),
      {
        questionId,
        answer: answerText,
        score: evalResult.score || 50,
        feedback: evalResult.feedback || 'Answer evaluated.'
      }
    ];

    const completed = updatedAnswers.length >= session.questions.length;

    const { data: updatedSession, error: updateErr } = await admin
      .from('mock_sessions')
      .update({
        answers: updatedAnswers,
        completed
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json(updatedSession);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
