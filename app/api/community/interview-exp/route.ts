import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const company = searchParams.get('company');

  let query = supabase.from('interview_experiences').select('*').order('created_at', { ascending: false });
  if (company) {
    query = query.ilike('company_name', `%${company}%`);
  }

  const { data, error } = await query.limit(30);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { company_name, role_title, difficulty, outcome, rounds, tags, is_anonymous } = body;

    const { data, error } = await supabase
      .from('interview_experiences')
      .insert({
        user_id: is_anonymous ? null : user.id,
        company_name,
        role_title,
        difficulty: difficulty || 'Medium',
        outcome: outcome || 'Pending',
        rounds: rounds || [],
        tags: tags || [],
        upvotes: 0,
        is_anonymous: !!is_anonymous
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
