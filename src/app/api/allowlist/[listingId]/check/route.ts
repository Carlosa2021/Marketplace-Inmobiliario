import { NextRequest } from 'next/server';
import { wlHas } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { listingId: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const address = (searchParams.get('address') || '').toLowerCase();
    const chainId = Number(searchParams.get('chainId') || '137');

    if (!address || !address.startsWith('0x')) {
      return new Response(
        JSON.stringify({ allowed: false, error: 'bad_address' }),
        { status: 400 },
      );
    }

    const allowed = await wlHas(params.listingId, address, chainId);
    return new Response(JSON.stringify({ allowed }), { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ allowed: false, error: msg }), {
      status: 500,
    });
  }
}
