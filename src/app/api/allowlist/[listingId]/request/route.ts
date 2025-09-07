import { NextRequest } from 'next/server';
import { wlReqAdd } from '@/lib/redis';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: { listingId: string } },
) {
  try {
    const { address, chainId, email } = (await req.json()) as {
      address: string;
      chainId?: number;
      email?: string;
    };

    if (!address || !address.startsWith('0x')) {
      return new Response(JSON.stringify({ error: 'bad_address' }), {
        status: 400,
      });
    }

    await wlReqAdd(params.listingId, address, chainId, email);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
