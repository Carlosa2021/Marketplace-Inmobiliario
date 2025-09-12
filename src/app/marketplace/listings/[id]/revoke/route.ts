// src/app/api/marketplace/listings/[id]/revoke/route.ts
import { NextResponse } from 'next/server';
// TODO: Re-enable when thirdweb marketplace extensions are available
/*
import { getContract, sendTransaction } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import {
  revokeBuyerFromReservedListing, // <-- extensión marketplace
} from 'thirdweb/extensions/marketplace';
import { client, adminAccount } from '@/lib/thirdweb/client-server';
*/

export const runtime = 'nodejs';

export async function POST() {
  // TODO: Re-enable when thirdweb marketplace extensions are available
  return NextResponse.json(
    { error: 'Marketplace revoke functionality temporarily disabled' },
    { status: 503 }
  );
  
  /*
  try {
    const { marketplace, buyers } = (await req.json()) as Body;
    const listingId = BigInt(params.id);

    const contract = getContract({
      client,
      chain: polygon,
      address: marketplace,
    });

    const results: { buyer: string; txHash: string }[] = [];

    for (const buyer of buyers) {
      const tx = await revokeBuyerFromReservedListing({
        contract,
        listingId,
        buyer,
      });
      const receipt = await sendTransaction({
        transaction: tx,
        account: adminAccount,
      });
      results.push({ buyer, txHash: receipt.transactionHash });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
  */
}
