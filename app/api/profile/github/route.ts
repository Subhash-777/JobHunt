import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';

export async function POST(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { githubUrl } = await request.json();

    if (!githubUrl || !githubUrl.includes('github.com/')) {
      return NextResponse.json({ error: 'Invalid GitHub URL provided.' }, { status: 400 });
    }

    // Extract username (handles trailing slashes or subpaths if any)
    const match = githubUrl.match(/github\.com\/([^\/]+)/);
    if (!match || !match[1]) {
      return NextResponse.json({ error: 'Could not extract GitHub username from URL.' }, { status: 400 });
    }
    const username = match[1];

    // Fetch repos from GitHub API
    const response = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'JobHunt-India-Integration'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `GitHub API error: ${response.statusText}` }, { status: response.status });
    }

    const repos = await response.json();

    // Map and filter necessary data
    const projects = repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      url: repo.html_url,
      stars: repo.stargazers_count,
      updated_at: repo.updated_at
    }));

    // Save to user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ github_projects: projects })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: `Failed to save projects: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: projects.length, projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
