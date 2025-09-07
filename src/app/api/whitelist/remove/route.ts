// src/app/api/whitelist/remove/route.ts
import { NextRequest } from 'next/server';
import { requireApiKey } from '@/lib/auth';
import { wlRemove } from '@/lib/redis';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    requireApiKey(req);
    const { listingId, address } = (await req.json()) as {
      listingId: string;
      address: `0x${string}`;
    };
    if (!listingId || !address) {
      return Response.json(
        { error: 'listingId y address requeridos' },
        { status: 400 },
      );
    }
    await wlRemove(String(listingId), address);
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
