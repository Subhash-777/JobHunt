import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/route-handler';

export async function GET() {
  try {
    const supabase = await supabaseRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Select outcomes joined with resume versions
    const { data, error } = await supabase
      .from('resume_outcomes')
      .select('*, resume_versions!inner(version_name, user_id)')
      .eq('resume_versions.user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
