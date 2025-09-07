// src/app/api/whitelist/add/route.ts
import { NextRequest } from 'next/server';
import { requireApiKey } from '@/lib/auth';
import { wlAdd } from '@/lib/redis';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    requireApiKey(req); // solo admin u orquestador
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
    await wlAdd(String(listingId), address);
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
