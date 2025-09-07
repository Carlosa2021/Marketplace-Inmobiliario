// src/lib/redis.ts

/**
 * Cliente mínimo para Upstash Redis REST.
 * - Requiere UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN (server env).
 * - Exporta rcmd<T>() para lanzar comandos genéricos (GET, SET, SADD, ...).
 * - Helpers de allowlist: wlAdd/wlRemove/wlHas/wlMembers/wlCount/wlClear.
 * - Helpers de solicitudes WL: wlReqAdd / wlReqList.
 */

type Fetcher = typeof fetch;

export const REDIS_BASE = process.env.UPSTASH_REDIS_REST_URL;
export const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const DEFAULT_TIMEOUT_MS = 8_000;

// Normaliza direcciones
const normAddr = (addr: string) => addr.toLowerCase();

// Key con namespacing por cadena y listing
const nsKey = (
  listingId: string | number | bigint,
  chainId?: number,
  ns = 'wl',
) => `${ns}:${chainId ?? 137}:${String(listingId)}`;

// KEY para solicitudes de allowlist
const reqKey = (listingId: string | number | bigint, chainId?: number) =>
  nsKey(listingId, chainId, 'wlreq');

/**
 * Lanza un comando Redis contra Upstash REST y devuelve el campo `result` tipado.
 * Ej: rcmd<number>(['SADD','myset','0x...'])
 */
export async function rcmd<T>(
  command: string[],
  fetcher: Fetcher = fetch,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  if (!REDIS_BASE || !REDIS_TOKEN) {
    throw new Error(
      'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN (server env)',
    );
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const res = await fetcher(REDIS_BASE, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${REDIS_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ command }),
      signal: ac.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Upstash error: ${res.status}`);
    }

    const json = (await res.json()) as { result: T };
    return json.result;
  } finally {
    clearTimeout(timer);
  }
}

/* ===========================
   Helpers de Allowlist (SET)
   =========================== */

/** Añade una address al allowlist de un listing (por chain). */
export async function wlAdd(
  listingId: string | number | bigint,
  addr: string,
  chainId?: number,
) {
  return rcmd<number>(['SADD', nsKey(listingId, chainId), normAddr(addr)]);
}

/** Elimina una address del allowlist. */
export async function wlRemove(
  listingId: string | number | bigint,
  addr: string,
  chainId?: number,
) {
  return rcmd<number>(['SREM', nsKey(listingId, chainId), normAddr(addr)]);
}

/** Comprueba si una address está en el allowlist. */
export async function wlHas(
  listingId: string | number | bigint,
  addr: string,
  chainId?: number,
) {
  const n = await rcmd<number>([
    'SISMEMBER',
    nsKey(listingId, chainId),
    normAddr(addr),
  ]);
  return n === 1;
}

/**
 * Devuelve miembros paginando con SSCAN.
 * @returns { cursor, members, done }
 */
export async function wlMembers(
  listingId: string | number | bigint,
  opts?: { cursor?: string; count?: number; chainId?: number },
) {
  const cursor = opts?.cursor ?? '0';
  const count = String(opts?.count ?? 100);
  const [next, members] = await rcmd<[string, string[]]>([
    'SSCAN',
    nsKey(listingId, opts?.chainId),
    cursor,
    'COUNT',
    count,
  ]);
  return { cursor: next, members, done: next === '0' };
}

/** Número de addresses en el allowlist. */
export async function wlCount(
  listingId: string | number | bigint,
  chainId?: number,
) {
  return rcmd<number>(['SCARD', nsKey(listingId, chainId)]);
}

/** Borra por completo el allowlist del listing. */
export async function wlClear(
  listingId: string | number | bigint,
  chainId?: number,
) {
  return rcmd<number>(['DEL', nsKey(listingId, chainId)]);
}

/* ==========================================
   Solicitudes de acceso (Allowlist Requests)
   Almacén: Lista (LPUSH) con JSON de {address,email,ts}
   ========================================== */

/**
 * Guarda una solicitud de entrada al allowlist.
 * Se guarda como JSON en una lista (LPUSH) para el listing y chain.
 * Devuelve el nuevo tamaño de la lista.
 */
export async function wlReqAdd(
  listingId: string | number | bigint,
  address: string,
  chainId?: number,
  email?: string,
) {
  const payload = JSON.stringify({
    address: normAddr(address),
    email: email ?? null,
    ts: Date.now(),
  });

  // LPUSH para que las más recientes queden al frente
  return rcmd<number>(['LPUSH', reqKey(listingId, chainId), payload]);
}

/**
 * Obtiene las solicitudes más recientes (rango).
 * @param start índice inicial (0 = más reciente)
 * @param stop  índice final (por ejemplo 49 para 50 elementos)
 */
export async function wlReqList(
  listingId: string | number | bigint,
  chainId?: number,
  start = 0,
  stop = 49,
) {
  const items = await rcmd<string[]>([
    'LRANGE',
    reqKey(listingId, chainId),
    String(start),
    String(stop),
  ]);
  // Parse seguro
  return items
    .map((s) => {
      try {
        return JSON.parse(s) as {
          address: string;
          email: string | null;
          ts: number;
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as { address: string; email: string | null; ts: number }[];
}
