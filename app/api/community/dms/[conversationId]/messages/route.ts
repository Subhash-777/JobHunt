import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const sbUser = await createClient();
    const { data: { user } } = await sbUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = supabaseAdmin();

    // Security: Verify caller is a participant before returning any messages
    const { data: conv } = await sb
      .from('dm_conversations')
      .select('id, user_a, user_b')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conv || (conv.user_a !== user.id && conv.user_b !== user.id)) {
      return NextResponse.json({ error: 'Conversation not found or access denied.' }, { status: 403 });
    }

    const { data: messages, error } = await sb
      .from('dm_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const sbUser = await createClient();
    const { data: { user } } = await sbUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Message exceeds maximum limit of 500 characters.' }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Verify conversation access
    const { data: conv } = await sb
      .from('dm_conversations')
      .select('id, user_a, user_b, request_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conv || (conv.user_a !== user.id && conv.user_b !== user.id)) {
      return NextResponse.json({ error: 'Conversation not found or access denied.' }, { status: 403 });
    }

    // Rate Limiting: Max 20 messages per conversation per user per 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countErr } = await sb
      .from('dm_messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('sender_id', user.id)
      .gte('created_at', twentyFourHoursAgo);

    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }

    if ((count || 0) >= 20) {
      return NextResponse.json(
        { error: 'Daily DM message limit reached (max 20 messages/day per conversation).' },
        { status: 429 }
      );
    }

    // Insert message
    const { data: message, error: insertErr } = await sb
      .from('dm_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim()
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
