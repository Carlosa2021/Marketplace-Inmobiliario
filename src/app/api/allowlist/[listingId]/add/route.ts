// src/app/api/allowlist/[listingId]/route.ts
import { NextRequest } from 'next/server';
import { wlMembers } from '@/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: { listingId: string } },
) {
  try {
    const url = new URL(req.url);
    const cursor = url.searchParams.get('cursor') ?? '0';
    const count = Number(url.searchParams.get('count') ?? '100');
    const chainIdParam = url.searchParams.get('chainId');
    const chainId = chainIdParam ? Number(chainIdParam) : undefined;

    const data = await wlMembers(params.listingId, {
      cursor,
      count,
      chainId,
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
