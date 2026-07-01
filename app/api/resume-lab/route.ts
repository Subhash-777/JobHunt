import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';
import * as pdf from 'pdf-parse';
import { callAICascade } from '@/lib/ai/cascade';

export async function GET() {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const versionName = formData.get('versionName') as string;

    if (!file || !versionName) {
      return NextResponse.json({ error: 'Missing file or versionName' }, { status: 400 });
    }

    // 1. Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Parse PDF Text
    let resumeText = '';
    try {
      const parsedPdf = await (pdf as any).PDFParse(buffer);
      resumeText = parsedPdf.text || '';
    } catch (parseErr) {
      console.error('pdf-parse failed, using empty string for text:', parseErr);
    }

    // 3. Upload to Supabase Storage resumes bucket
    const storagePath = `${user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('resumes')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json({ error: `Storage upload failed: ${uploadErr.message}` }, { status: 500 });
    }

    // 4. Calculate base ATS score & tags via AI Cascade
    let atsScore = 70;
    let roleTags: string[] = ['SWE'];
    
    if (resumeText) {
      try {
        const systemPrompt = `You are an expert ATS (Applicant Tracking System) parser. Analyze the resume text and return ONLY a JSON object in this format:
{
  "ats_score": <number between 0 and 100>,
  "role_tags": [<string>, <string>]
}`;
        const res = await callAICascade({
          prompt: resumeText.slice(0, 4000),
          systemPrompt,
          jsonMode: true,
          feature: 'resume_analyse'
        });
        const parsed = JSON.parse(res.text);
        if (parsed.ats_score !== undefined) atsScore = Number(parsed.ats_score);
        if (parsed.role_tags) roleTags = parsed.role_tags;
      } catch (err) {
        console.error('AI ATS parsing failed, using default scores:', err);
      }
    }

    // 5. Insert into resume_versions table
    const { data: inserted, error: insertErr } = await supabase
      .from('resume_versions')
      .insert({
        user_id: user.id,
        version_name: versionName,
        role_tags: roleTags,
        storage_path: storagePath,
        resume_text: resumeText,
        ats_score: atsScore,
        is_default: false,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json(inserted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
