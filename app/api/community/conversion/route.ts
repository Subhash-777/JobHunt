import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');

    const sb = supabaseAdmin();
    let query = sb
      .from('community_conversion_reports')
      .select('*')
      .order('report_count', { ascending: false });

    if (company) {
      query = query.ilike('company', company);
    } else {
      query = query.limit(10);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reports: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, role_category, outcome, got_oa, got_interview, days_to_response } = body;

    if (!company) {
      return NextResponse.json({ error: 'Company is required.' }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const cleanCompany = company.trim();
    const cleanRole = role_category || 'general';

    // Fetch existing report
    const { data: existing } = await sb
      .from('community_conversion_reports')
      .select('*')
      .eq('company', cleanCompany)
      .eq('role_category', cleanRole)
      .maybeSingle();

    const prevCount = existing?.report_count ?? 0;
    const newCount = prevCount + 1;
    const newOA = (existing?.got_oa ?? 0) + (got_oa ? 1 : 0);
    const newInterview = (existing?.got_interview ?? 0) + (got_interview ? 1 : 0);
    const newOffer = (existing?.got_shortlisted ?? 0) + (outcome === 'offer' ? 1 : 0);

    // Calculate rolling response days if provided
    let newDays = existing?.median_response_days;
    if (typeof days_to_response === 'number' && days_to_response > 0) {
      if (!newDays) {
        newDays = days_to_response;
      } else {
        newDays = Math.round((Number(newDays) * prevCount + days_to_response) / newCount);
      }
    }

    const { data: upserted, error } = await sb
      .from('community_conversion_reports')
      .upsert({
        company: cleanCompany,
        role_category: cleanRole,
        got_oa: newOA,
        got_interview: newInterview,
        got_shortlisted: newOffer,
        median_response_days: newDays,
        report_count: newCount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'company,role_category' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, report: upserted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
