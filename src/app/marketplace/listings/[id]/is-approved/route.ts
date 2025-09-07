// src/app/api/marketplace/listings/[id]/is-approved/route.ts
import { NextRequest } from 'next/server';
import { getContract } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import {
  isBuyerApprovedForReservedListing, // <-- extensión marketplace (lectura)
} from 'thirdweb/extensions/marketplace';
import { client } from '@/lib/thirdweb/client-server';

export const runtime = 'nodejs';

type Query = {
  marketplace: string;
  buyer: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const marketplace = searchParams.get('marketplace')!;
    const buyer = searchParams.get('buyer')!;
    const listingId = BigInt(params.id);

    const contract = getContract({
      client,
      chain: polygon,
      address: marketplace,
    });

    const approved = await isBuyerApprovedForReservedListing({
      contract,
      listingId,
      buyer,
    });

    return new Response(JSON.stringify({ ok: true, approved }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
