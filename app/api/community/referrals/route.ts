import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('referral_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

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
    // 3/week rate limit check
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countErr } = await supabase
      .from('referral_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo);

    if (countErr) {
      console.error('Rate limit check error:', countErr);
    } else if ((count || 0) >= 3) {
      return NextResponse.json({ error: 'Weekly limit reached (3/3 referral requests used this week).' }, { status: 429 });
    }

    const body = await req.json();
    const { company_name, role_title, message, is_offering } = body;

    const { data, error } = await supabase
      .from('referral_requests')
      .insert({
        user_id: user.id,
        company_name,
        role_title: role_title || 'Software Engineer',
        message: (message || '').substring(0, 200),
        is_offering: !!is_offering
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, remainingWeekly: 2 - (count || 0) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
