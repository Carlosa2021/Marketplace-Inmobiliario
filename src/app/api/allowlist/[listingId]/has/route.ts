// src/app/api/allowlist/[listingId]/has/route.ts
import { NextRequest } from 'next/server';
import { wlHas } from '@/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: { listingId: string } },
) {
  try {
    const url = new URL(req.url);
    const address = url.searchParams.get('address');
    const chainIdParam = url.searchParams.get('chainId');
    const chainId = chainIdParam ? Number(chainIdParam) : undefined;

    if (!address) {
      return new Response(JSON.stringify({ error: 'Missing address' }), {
        status: 400,
      });
    }

    const allowed = await wlHas(params.listingId, address, chainId);

    return new Response(JSON.stringify({ allowed }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
