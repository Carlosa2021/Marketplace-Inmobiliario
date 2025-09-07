import { NextRequest } from 'next/server';
import { kycSet } from '@/lib/kyc';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { address } = (await req.json()) as { address: string };
  if (!address) return new Response('address required', { status: 400 });
  await kycSet(address, 'pending');
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
