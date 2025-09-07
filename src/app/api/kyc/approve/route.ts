import { NextRequest } from 'next/server';
import { kycSet } from '@/lib/kyc';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const admin = req.headers.get('x-admin-token');
  if (admin !== process.env.ADMIN_API_TOKEN)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });

  const { address, status } = (await req.json()) as {
    address: string;
    status?: 'approved' | 'none' | 'pending';
  };
  if (!address) return new Response('address required', { status: 400 });

  await kycSet(address, status ?? 'approved');
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
