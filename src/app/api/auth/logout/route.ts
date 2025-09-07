// src/app/api/auth/logout/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'nx_auth';

export async function POST() {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', cookie);
  return res;
}
