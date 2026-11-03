import { serverSupabase, isAdminEmail } from './supabase';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function adminDb() {
  // First verify the logged-in user
  const authDb = await serverSupabase();

  const {
    data: { user },
    error,
  } = await authDb.auth.getUser();

  if (error || !user || !isAdminEmail(user.email)) {
    throw new Error('Unauthorized');
  }

  // Only verified admins reach this point
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase server configuration');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function fail(e: unknown) {
  const error = e as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  };

  const message =
    e instanceof Error
      ? e.message
      : error?.message || 'Unknown server error';

  console.error('Admin API Error:', e);

  return NextResponse.json(
    {
      error: message,
      details: error?.details || null,
      hint: error?.hint || null,
      code: error?.code || null,
    },
    {
      status: message === 'Unauthorized' ? 401 : 400,
    }
  );
}