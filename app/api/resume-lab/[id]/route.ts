import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = supabaseAdmin();

    // 1. Set all user's resumes to is_default = false
    await admin
      .from('resume_versions')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // 2. Set this resume to is_default = true
    const { data, error } = await admin
      .from('resume_versions')
      .update({ is_default: true })
      .match({ id, user_id: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = supabaseAdmin();
    
    // Get storage path to delete file from bucket
    const { data: resume } = await admin
      .from('resume_versions')
      .select('storage_path')
      .match({ id, user_id: user.id })
      .maybeSingle();

    if (resume?.storage_path) {
      await admin.storage.from('resumes').remove([resume.storage_path]);
    }

    const { error } = await admin
      .from('resume_versions')
      .delete()
      .match({ id, user_id: user.id });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
