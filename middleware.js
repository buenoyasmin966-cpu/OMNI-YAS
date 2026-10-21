import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { supabaseConfig } from './lib/supabase/config';

export async function middleware(request) {
  let response = NextResponse.next({ request });
  const settings = supabaseConfig();
  if (!settings) return response;
  const supabase = createServerClient(settings.url, settings.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = { matcher: ['/', '/login'] };
