// src/app/api/auth/login/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import auth from '@/lib/thirdweb-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const address = body?.address;
    if (!address)
      return NextResponse.json({ error: 'address required' }, { status: 400 });

    const loginPayload = await auth.generatePayload({ address });
    return NextResponse.json(loginPayload);
  } catch (err) {
    console.error('auth/login error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
