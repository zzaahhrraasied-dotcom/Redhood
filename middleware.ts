import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies) => { cookies.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } }
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (path.startsWith('/admin') && path !== '/admin/login' && !user) return NextResponse.redirect(new URL('/admin/login', request.url));
  if (path.startsWith('/admin') && path !== '/admin/login' && user) {
    const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(x => x.trim().toLowerCase());
    if (!user.email || !allowed.includes(user.email.toLowerCase())) return NextResponse.redirect(new URL('/', request.url));
  }
  return response;
}
export const config = { matcher: ['/admin/:path*'] };
