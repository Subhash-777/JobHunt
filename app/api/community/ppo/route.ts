import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const minRate = Number(searchParams.get('minRate') || '0');
    
    const sb = supabaseAdmin();
    let query = sb
      .from('company_pages')
      .select('*')
      .gte('ppo_reports', 1)
      .order('ppo_rate', { ascending: false });

    if (minRate > 0) {
      query = query.gte('ppo_rate', minRate);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = data || [];
    if (search) {
      filtered = filtered.filter((c: any) => c.name.toLowerCase().includes(search));
    }

    return NextResponse.json({ companies: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, role, year, gotPPO, stipend, ctc, location, anonymous } = body;

    if (!company || typeof gotPPO !== 'boolean') {
      return NextResponse.json({ error: 'Company and gotPPO status are required.' }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const cleanCompany = company.trim();

    // Check existing company_pages row
    const { data: existing } = await sb
      .from('company_pages')
      .select('id, name, ppo_rate, ppo_reports, slug')
      .ilike('name', cleanCompany)
      .maybeSingle();

    const prevRate = Number(existing?.ppo_rate ?? 0);
    const prevCount = Number(existing?.ppo_reports ?? 0);
    const newCount = prevCount + 1;
    const newRate = Math.round(((prevRate * prevCount) + (gotPPO ? 100 : 0)) / newCount);
    const slug = existing?.slug || cleanCompany.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data: upserted, error } = await sb
      .from('company_pages')
      .upsert({
        name: existing?.name || cleanCompany,
        slug,
        ppo_rate: newRate,
        ppo_reports: newCount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'name' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, company: upserted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
