import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GROQ_API_KEY',
    'OPENROUTER_API_KEY',
    'GEMINI_API_KEY'
  ];

  const status: Record<string, any> = {};

  for (const key of envKeys) {
    const val = process.env[key];
    if (val) {
      status[key] = {
        present: true,
        length: val.length,
        prefix: val.substring(0, 8) + '...'
      };
    } else {
      status[key] = {
        present: false
      };
    }
  }

  return NextResponse.json({
    message: "JobHunt India Environment Debug",
    status
  });
}
