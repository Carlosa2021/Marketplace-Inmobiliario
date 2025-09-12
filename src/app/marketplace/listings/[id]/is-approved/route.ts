// src/app/api/marketplace/listings/[id]/is-approved/route.ts
import { NextResponse } from 'next/server';
// TODO: Re-enable when thirdweb marketplace extensions are available
/*
import { getContract } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import {
  isBuyerApprovedForReservedListing, // <-- extensión marketplace (lectura)
} from 'thirdweb/extensions/marketplace';
import { client } from '@/lib/thirdweb/client-server';
*/

export const runtime = 'nodejs';

export async function GET() {
  // TODO: Re-enable when thirdweb marketplace extensions are available
  return NextResponse.json(
    { error: 'Marketplace approval check functionality temporarily disabled' },
    { status: 503 }
  );
  
  /*
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
  */
}
