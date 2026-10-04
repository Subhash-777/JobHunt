import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const sbUser = await createClient();
    const { data: { user } } = await sbUser.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to message.' }, { status: 401 });
    }

    const { request_id } = await request.json();
    if (!request_id) {
      return NextResponse.json({ error: 'Missing request_id.' }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Fetch the referral request
    const { data: refReq, error: refErr } = await sb
      .from('referral_requests')
      .select('id, user_id, company_name, role_title')
      .eq('id', request_id)
      .maybeSingle();

    if (refErr || !refReq) {
      return NextResponse.json({ error: 'Referral request not found.' }, { status: 404 });
    }

    const userA = refReq.user_id; // seeker / author
    const userB = user.id;        // provider / replier

    // Check if conversation already exists
    const { data: existingConv } = await sb
      .from('dm_conversations')
      .select('*')
      .eq('request_id', request_id)
      .or(`and(user_a.eq.${userA},user_b.eq.${userB}),and(user_a.eq.${userB},user_b.eq.${userA})`)
      .maybeSingle();

    if (existingConv) {
      return NextResponse.json({ conversation: existingConv });
    }

    // Create new conversation
    const { data: newConv, error: createErr } = await sb
      .from('dm_conversations')
      .insert({
        request_id,
        user_a: userA,
        user_b: userB,
      })
      .select()
      .single();

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 500 });
    }

    return NextResponse.json({ conversation: newConv });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
