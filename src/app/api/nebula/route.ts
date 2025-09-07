// src/app/api/nebula/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const BASE = process.env.THIRDWEB_AI_BASE_URL || 'https://api.thirdweb.com/ai';
const API_KEY = process.env.THIRDWEB_SECRET_KEY || '';

export async function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string };
type ChatBody = { messages: ChatMsg[]; from?: string; chain_ids?: number[] };

async function postToThirdweb(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res;
}

export async function POST(req: NextRequest) {
  try {
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing THIRDWEB_SECRET_KEY' }),
        { status: 500, headers: { 'content-type': 'application/json' } },
      );
    }

    const { messages, from, chain_ids } = (await req.json()) as ChatBody;

    const payload = {
      model: 't0',
      stream: false,
      messages,
      // thirdweb extiende el schema OpenAI con `context`
      context: { from, chain_ids },
    };

    // 1) ruta recomendada (OpenAI-compatible bajo /ai)
    let upstream = await postToThirdweb('/chat/completions', payload);

    // 2) fallback por si algún proxy espera /v1
    if (upstream.status === 404) {
      upstream = await postToThirdweb('/v1/chat/completions', payload);
    }

    const text = await upstream.text();

    // SIEMPRE devolvemos JSON al cliente
    try {
      const json = JSON.parse(text);
      return new Response(JSON.stringify(json), {
        status: upstream.status,
        headers: { 'content-type': 'application/json' },
      });
    } catch {
      // Si thirdweb/edge devolviera HTML o texto plano, lo envolvemos
      return new Response(JSON.stringify({ error: text }), {
        status: upstream.status,
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
