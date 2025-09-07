'use client';
import { useState, useEffect, useCallback } from 'react';

export default function WLManager({
  listingId,
  adminToken,
  chainId = 137,
}: {
  listingId: string | number | bigint;
  adminToken: string;
  chainId?: number;
}) {
  const [addr, setAddr] = useState('');
  const [rows, setRows] = useState<string[]>([]);
  const [cursor, setCursor] = useState<string>('0');
  const [done, setDone] = useState(false);

  // load memoizado: cambia solo si cambian listingId o chainId
  const load = useCallback(
    async (c: string = '0') => {
      const r = await fetch(
        `/api/allowlist/${String(
          listingId,
        )}?cursor=${c}&count=100&chainId=${chainId}`,
      );
      const data = await r.json();
      setRows((prev) =>
        c === '0' ? data.members : [...prev, ...data.members],
      );
      setCursor(data.next);
      setDone(data.done);
    },
    [listingId, chainId],
  );

  useEffect(() => {
    load('0');
  }, [load]);

  const add = useCallback(async () => {
    await fetch(`/api/allowlist/${String(listingId)}/add`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({ address: addr, chainId }),
    });
    setAddr('');
    load('0');
  }, [addr, adminToken, chainId, listingId, load]);

  const remove = useCallback(
    async (a: string) => {
      await fetch(`/api/allowlist/${String(listingId)}/remove`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ address: a, chainId }),
      });
      load('0');
    },
    [adminToken, chainId, listingId, load],
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="0x..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={add}
          className="px-3 py-2 rounded bg-indigo-600 text-white"
        >
          Añadir
        </button>
      </div>

      <ul className="divide-y rounded border">
        {rows.map((a) => (
          <li key={a} className="flex items-center justify-between px-3 py-2">
            <span className="truncate">{a}</span>
            <button onClick={() => remove(a)} className="text-red-600">
              Quitar
            </button>
          </li>
        ))}
      </ul>

      {!done && (
        <button
          onClick={() => load(cursor)}
          className="px-3 py-2 rounded border"
        >
          Cargar más
        </button>
      )}
    </div>
  );
}
