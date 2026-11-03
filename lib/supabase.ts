import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function serverSupabase() {
  const jar = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),

        setAll: (
          items: {
            name: string;
            value: string;
            options: Parameters<typeof jar.set>[2];
          }[]
        ) => {
          try {
            items.forEach(({ name, value, options }) => {
              jar.set(name, value, options);
            });
          } catch {}
        },
      },
    }
  );
}

export function isAdminEmail(email?: string | null) {
  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(x => x.trim().toLowerCase())
    .filter(Boolean);

  return !!email && allowed.includes(email.toLowerCase());
}