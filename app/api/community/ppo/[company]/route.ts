import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ company: string }> }
) {
  try {
    const { company } = await params;
    if (!company) {
      return NextResponse.json({ error: 'Company parameter is required.' }, { status: 400 });
    }

    const decoded = decodeURIComponent(company);
    const sb = supabaseAdmin();

    const { data, error } = await sb
      .from('company_pages')
      .select('*')
      .or(`name.ilike.${decoded},slug.eq.${decoded}`)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ ppo_rate: 0, ppo_reports: 0, name: decoded });
    }

    return NextResponse.json({ company: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
