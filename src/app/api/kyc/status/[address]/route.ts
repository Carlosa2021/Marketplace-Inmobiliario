import { NextRequest } from 'next/server';
import { kycGet } from '@/lib/kyc';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } },
) {
  const status = await kycGet(params.address);
  return new Response(JSON.stringify({ status }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
