import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const handler: ProxyHandler<any> = {
      get(target, prop) {
        if (prop === 'then') {
          const dataProxy = new Proxy([], {
            get(t, p) {
              if (p === 'user') return null;
              const val = (t as any)[p];
              if (typeof val === 'function') return val.bind(t);
              return val;
            }
          });
          return (resolve: any) =>
            resolve({
              data: dataProxy,
              error: { message: 'Supabase URL and Anon Key must be configured in Vercel environment variables.' }
            });
        }
        return new Proxy(() => {}, handler);
      },
      apply(target, thisArg, argumentsList) {
        return new Proxy(() => {}, handler);
      }
    };
    return new Proxy({}, handler) as any;
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// For use in background jobs/scripts ONLY. Never use in user-facing routes.
export function supabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}
