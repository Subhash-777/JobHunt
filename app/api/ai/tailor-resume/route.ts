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

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    // 1. Fetch Job
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // 2. Fetch User Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Construct System Prompt
    const systemPrompt = `You are an expert Executive Resume Writer and Career Coach. 
Your objective is to generate a highly tailored, ATS-friendly resume in Markdown format for the candidate based on their profile and the target job description.
Emphasize the skills, courses, and projects from the candidate's profile that align most closely with the job requirements.

# Output Requirements
- Provide the output purely in Markdown.
- Do NOT wrap the output in json or markdown code blocks (e.g. no \`\`\`markdown).
- Include standard resume sections: Header (Name, Links), Education, Skills, Projects, and Experience/Achievements.
- Adapt the descriptions of their projects and skills to match the vocabulary used in the job description where truthful.`;

    const profileContext = `
Full Name: ${profile.full_name}
Email: ${profile.email}
LinkedIn: ${profile.linkedin_url || ''}
GitHub: ${profile.github_url || ''}
LeetCode: ${profile.leetcode_url || ''}

Education:
- ${profile.degree || ''} in ${profile.branch || ''}, ${profile.college || ''} (Graduation: ${profile.graduation_year || ''}, CGPA: ${profile.cgpa || ''})
- 12th Grade: ${profile.school_name_12th || ''} (${profile.percentage_12th ? profile.percentage_12th + '%' : ''})
- 10th Grade: ${profile.school_name_10th || ''} (${profile.percentage_10th ? profile.percentage_10th + '%' : ''})

Skills: ${(profile.skills || []).join(', ')}
Courses: ${(profile.courses || []).join(', ')}
Honors & Awards: ${(profile.honors_awards || []).join(', ')}
Publications: ${(profile.publications || []).join(', ')}

GitHub Projects:
${(profile.github_projects || []).map((p: any) => `- ${p.name} (${p.language}): ${p.description}`).join('\n')}
`;

    const jobContext = `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Job Description:
${job.description || ''}
`;

    const prompt = `Please generate a tailored Markdown resume for me.

### Candidate Profile:
${profileContext}

### Target Job:
${jobContext}
`;

    // 4. Call AI
    const res = await callAICascade({
      prompt,
      systemPrompt,
      jsonMode: false,
      feature: 'tailor_resume'
    });

    return NextResponse.json({ markdown: res.text });

  } catch (error: any) {
    console.error("Tailor resume endpoint error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
