import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';
import { callAICascade } from '@/lib/ai/cascade';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
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

    // 1. Fetch job details
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // 2. Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Compute missing skills
    const userSkills = new Set((profile.skills || []).map((s: string) => s.toLowerCase()));
    const jobSkills = job.key_skills || [];
    const missingSkills = jobSkills.filter((s: string) => !userSkills.has(s.toLowerCase()));

    if (missingSkills.length === 0) {
      return NextResponse.json({
        missingSkills: [],
        roadmap: { sections: [] }
      });
    }

    // 4. Generate learning roadmap via AI Cascade (preferQuality: true)
    const systemPrompt = `You are a technical career coach. Generate a learning roadmap for the candidate to close their skill gap for the target job.
Focus ONLY on the missing skills listed.
For each missing skill, provide:
- A brief explanation of what to learn
- A curated list of high-quality, completely FREE learning resources (e.g., specific MDN docs, official tutorials, free Youtube courses).
Respond ONLY with a JSON object in this format:
{
  "sections": [
    {
      "skill": "<missing skill name>",
      "topics": ["<topic 1>", "<topic 2>"],
      "resources": [
        { "name": "<resource name>", "url": "<free resource URL>" }
      ]
    }
  ]
}`;

    const prompt = `Target Job Title: ${job.title}
Target Key Skills: ${jobSkills.join(', ')}
Candidate Current Skills: ${(profile.skills || []).join(', ')}
Missing Skills: ${missingSkills.join(', ')}`;

    const res = await callAICascade({
      prompt,
      systemPrompt,
      jsonMode: true,
      preferQuality: true,
      feature: 'roadmap'
    });

    const parsed = JSON.parse(res.text);

    return NextResponse.json({
      missingSkills,
      roadmap: parsed
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { skill } = body;

    if (!skill) {
      return NextResponse.json({ error: 'Missing skill parameter' }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // 1. Fetch current profile
    const { data: profile } = await admin
      .from('profiles')
      .select('skills')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 2. Append skill if not present
    const currentSkills = profile.skills || [];
    if (!currentSkills.some((s: string) => s.toLowerCase() === skill.toLowerCase())) {
      const updatedSkills = [...currentSkills, skill];
      const { data, error } = await admin
        .from('profiles')
        .update({ skills: updatedSkills })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
