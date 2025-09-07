// src/lib/ratelimit.ts
import { rcmd } from '@/lib/redis';

/**
 * Rate limit por ventana deslizante simple (INCR + EXPIRE).
 * @param key       Bucket (ej: "wlreq:1.2.3.4")
 * @param limit     Número de acciones permitidas en la ventana
 * @param windowSec Ventana en segundos (ej: 60)
 * @returns true si permitido, false si superó el límite
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  const redisKey = `rl:${key}`;
  const count = await rcmd<number>(['INCR', redisKey]);
  if (count === 1) {
    // Primer hit: aplicar expiración
    await rcmd<number>(['EXPIRE', redisKey, String(windowSec)]);
  }
  return count <= limit;
}
