// src/app/api/allowlist/[listingId]/remove/route.ts
import { NextRequest } from 'next/server';
import { wlRemove } from '@/lib/redis';

export async function POST(
  req: NextRequest,
  { params }: { params: { listingId: string } },
) {
  try {
    const token = req.headers.get('x-admin-token');
    if (token !== process.env.ADMIN_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const { address, chainId } = (await req.json()) as {
      address: string;
      chainId?: number;
    };

    await wlRemove(params.listingId, address, chainId);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
