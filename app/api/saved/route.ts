import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';

// GET: Fetch user's saved/bookmarked jobs
export async function GET() {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('saved_jobs')
      .select('*, jobs(*)')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Upsert (save/update) bookmark details
export async function POST(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, folder, notes, ignored } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const payload: any = {
      user_id: user.id,
      job_id: jobId,
    };

    if (folder !== undefined) payload.folder = folder;
    if (notes !== undefined) payload.notes = notes;
    if (ignored !== undefined) payload.ignored = ignored;

    const { data, error } = await supabase
      .from('saved_jobs')
      .upsert(payload, { onConflict: 'user_id,job_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync saved folder stage to applications status
    if (folder !== undefined) {
      if (['applied', 'oa', 'interview', 'offer', 'rejected'].includes(folder)) {
        await supabase
          .from('applications')
          .upsert({
            user_id: user.id,
            job_id: jobId,
            status: folder,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,job_id' });
      } else if (folder === 'shortlisted') {
        await supabase
          .from('applications')
          .delete()
          .match({ user_id: user.id, job_id: jobId });
      }
    }

    if (jobId) {
      try {
        const { syncJobDeadline } = await import('@/lib/calendar/sync');
        syncJobDeadline(user.id, jobId).catch((e) => {
          console.error('Background Google Calendar sync failed:', e);
        });
      } catch (e) {
        console.error('Error importing calendar sync utility:', e);
      }
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove bookmark
export async function DELETE(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .match({ user_id: user.id, job_id: jobId });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
