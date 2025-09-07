// src/lib/whitelist.ts
import { redis } from './redis';

const KEY = 'whitelist:users';

// ✅ Añadir usuario
export async function addToWhitelist(address: string) {
  await redis.sadd(KEY, address.toLowerCase());
}

// ✅ Comprobar si está en whitelist
export async function isWhitelisted(address: string): Promise<boolean> {
  return await redis.sismember(KEY, address.toLowerCase());
}

// ✅ Obtener todos
export async function getWhitelist(): Promise<string[]> {
  return await redis.smembers(KEY);
}
