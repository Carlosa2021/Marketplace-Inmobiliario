import { NextRequest } from 'next/server';
import { wlClear } from '@/lib/redis';

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

    const { chainId } = (await req.json()) as { chainId?: number };

    await wlClear(params.listingId, chainId);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
