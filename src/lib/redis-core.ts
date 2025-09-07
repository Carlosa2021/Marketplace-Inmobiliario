// src/lib/redis-core.ts
type Fetcher = typeof fetch;
const BASE = process.env.UPSTASH_REDIS_REST_URL!;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

export async function rcmd<T>(
  cmd: string[],
  fetcher: Fetcher = fetch,
): Promise<T> {
  const res = await fetcher(BASE, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ command: cmd }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()).result as T;
}
