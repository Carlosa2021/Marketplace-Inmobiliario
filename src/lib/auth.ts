// src/lib/auth.ts
import { NextRequest } from 'next/server';
import { parse as parseCookie } from 'cookie';

export type User = {
  id: string;
  address: string; // wallet
  email?: string | null;
  // añade campos que necesites
};

/**
 * getUserFromRequest
 * - En producción sustituir por lógica real (thirdweb auth verifyJWT o verify cookie)
 * - En dev: si no hay cookie devolvemos usuario fijo para poder seguir trabajando
 */
export async function getUserFromRequest(
  req: NextRequest,
): Promise<User | null> {
  try {
    const cookieHeader = req.headers.get('cookie') ?? '';
    if (!cookieHeader) {
      // DEV fallback (sin cookie)
      return { id: 'u-dev', address: '0xAAA', email: 'test@example.com' };
    }

    const cookies = parseCookie(cookieHeader);
    const jwt =
      cookies['NEXT_AUTH_TOKEN'] || cookies['token'] || cookies['jwt'];

    if (!jwt) {
      // DEV fallback
      return { id: 'u-dev', address: '0xAAA', email: 'test@example.com' };
    }

    // Aquí deberías verificar el JWT con thirdweb auth (o tu función).
    // Ejemplo (pseudocódigo):
    // const { valid, parsedJWT } = await auth.verifyJWT({ jwt })
    // if (!valid) return null;
    // return { id: parsedJWT.sub, address: parsedJWT.address }

    // Por ahora en dev devolvemos usuario fijo (pero usando jwt evita warning de var sin usar)
    // Puedes parsearlo si guardas info en el JWT.
    return { id: 'u-dev', address: '0xAAA', email: 'test@example.com' };
  } catch (err) {
    // Si algo falla devolver null
    console.error('getUserFromRequest error:', err);
    return null;
  }
}
