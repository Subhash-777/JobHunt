import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const sb = supabaseAdmin();
    const { data: drives, error } = await sb
      .from('campus_drives')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ drives: drives || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sbUser = await createClient();
    const { data: { user } } = await sbUser.auth.getUser();

    const body = await request.json();
    const {
      company,
      role_title,
      drive_type,
      eligible_batches,
      eligible_degrees,
      cgpa_cutoff,
      registration_url,
      deadline,
      drive_date,
      location,
      stipend_ctc_text,
      bond_flag
    } = body;

    if (!company || !role_title || !registration_url) {
      return NextResponse.json(
        { error: 'Company, role title, and registration URL are required.' },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();
    const { data: drive, error } = await sb
      .from('campus_drives')
      .insert({
        company: company.trim(),
        role_title: role_title.trim(),
        drive_type: drive_type || 'off_campus',
        eligible_batches: Array.isArray(eligible_batches) ? eligible_batches : [2025, 2026],
        eligible_degrees: Array.isArray(eligible_degrees) ? eligible_degrees : ['B.Tech', 'BE'],
        cgpa_cutoff: cgpa_cutoff ? Number(cgpa_cutoff) : null,
        registration_url: registration_url.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        drive_date: drive_date ? new Date(drive_date).toISOString() : null,
        location: location || 'Pan-India',
        stipend_ctc_text: stipend_ctc_text || 'Competitive',
        bond_flag: Boolean(bond_flag),
        submitted_by: user?.id || null,
        approved: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ drive });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
