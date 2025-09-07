// src/app/api/auth/verify/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { serialize } from 'cookie';
import auth from '@/lib/thirdweb-auth'; // tu wrapper de thirdweb (server-side)

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'nx_auth';
const COOKIE_MAX_AGE = Number(
  process.env.AUTH_COOKIE_MAX_AGE || 60 * 60 * 24 * 30,
);

/**
 * Tipos locales ligeros (no importamos tipos del SDK para evitar incompatibilidades).
 * LoginPayload: representación mínima que necesitamos comprobar (contiene address string).
 */
type LoginPayload = Record<string, unknown> & { address?: string };

/** helpers de guardas seguros - sin any */
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function isStringField(obj: Record<string, unknown>, key: string): boolean {
  const v = obj[key];
  return typeof v === 'string';
}

function isLoginPayload(x: unknown): x is LoginPayload {
  if (!isObject(x)) return false;
  return isStringField(x, 'address');
}

/**
 * La result de verifyPayload puede venir envuelta (según versión del SDK).
 * Queremos detectar la forma { valid: boolean, payload: LoginPayload } o directamente LoginPayload.
 */
function isVerifyResultWithValid(
  x: unknown,
): x is { valid: boolean; payload: LoginPayload } {
  if (!isObject(x)) return false;
  if (!('valid' in x)) return false;
  const maybeValid = (x as Record<string, unknown>)['valid'];
  const maybePayload = (x as Record<string, unknown>)['payload'];
  if (typeof maybeValid !== 'boolean') return false;
  return isLoginPayload(maybePayload);
}

/** Extrae una dirección si el resultado es válido */
function extractAddressFromVerifyResult(x: unknown): string | undefined {
  if (isVerifyResultWithValid(x) && x.valid && isLoginPayload(x.payload)) {
    return x.payload.address;
  }
  // A veces auth.verifyPayload devuelve directamente el payload verificado
  if (isLoginPayload(x)) return x.address;
  return undefined;
}

/**
 * POST /api/auth/verify
 * Body expected: { payload: {...}, signature: "0x..." }
 */
export async function POST(req: NextRequest) {
  try {
    // parsear body con seguridad (podría lanzar)
    const bodyRaw = (await req.json().catch(() => ({}))) as unknown;

    // sacar candidatos de payload y signature de forma segura
    const payloadCandidate = isObject(bodyRaw)
      ? (bodyRaw as Record<string, unknown>).payload
      : undefined;
    const signatureCandidate = isObject(bodyRaw)
      ? (bodyRaw as Record<string, unknown>).signature
      : undefined;

    if (!payloadCandidate || typeof signatureCandidate !== 'string') {
      return NextResponse.json(
        { error: 'payload and signature required' },
        { status: 400 },
      );
    }

    /**
     * Llamada a tu wrapper auth.verifyPayload.
     * No forzamos `any` en el resto del archivo; hacemos una conversión de tipo limitada
     * para describir la forma de la API que esperamos del wrapper.
     */
    const authClient = auth as unknown as {
      verifyPayload(params: {
        payload: unknown;
        signature: string;
      }): Promise<unknown>;
      generateJWT(params: { payload: unknown }): Promise<string>;
    };

    const verified = await authClient.verifyPayload({
      payload: payloadCandidate,
      signature: signatureCandidate,
    });

    // extraer dirección (si verifyPayload devolvió { valid, payload } o el payload directamente)
    const address = extractAddressFromVerifyResult(verified);
    if (!address) {
      return NextResponse.json(
        { error: 'Invalid signature or payload' },
        { status: 401 },
      );
    }

    // generar JWT (pasamos el "verified" tal como vino, el wrapper lo firmará)
    const jwt = await authClient.generateJWT({ payload: verified });

    const cookie = serialize(COOKIE_NAME, jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    const res = NextResponse.json({ ok: true, address });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (err) {
    console.error('auth/verify error', err);
    return NextResponse.json(
      { error: 'Invalid signature or payload' },
      { status: 401 },
    );
  }
}
