import { NextRequest } from 'next/server';
import { wlCount } from '@/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: { listingId: string } },
) {
  try {
    const url = new URL(req.url);
    const chainIdParam = url.searchParams.get('chainId');
    const chainId = chainIdParam ? Number(chainIdParam) : undefined;

    const n = await wlCount(params.listingId, chainId);
    return new Response(JSON.stringify({ count: n }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
