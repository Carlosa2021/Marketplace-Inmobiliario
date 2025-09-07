'use client';

import { useEffect, useMemo, useState } from 'react';

type Params = {
  listingId: string | number | bigint;
  address?: string | null;
  chainId?: number; // por defecto 137 (Polygon)
};

type State =
  | { loading: true; allowed: false; error?: undefined }
  | { loading: false; allowed: boolean; error?: string };

export function useAllowlist({
  listingId,
  address,
  chainId = 137,
}: Params): State {
  const [state, setState] = useState<State>({ loading: true, allowed: false });

  // Evita llamadas mientras no hay address
  const canQuery = useMemo(
    () => !!address && String(address).startsWith('0x'),
    [address],
  );

  useEffect(() => {
    let cancel = false;

    async function run() {
      if (!canQuery) {
        setState({ loading: false, allowed: false });
        return;
      }
      setState({ loading: true, allowed: false });
      try {
        const url =
          `/api/allowlist/${String(listingId)}/has` +
          `?address=${address}&chainId=${chainId}`;
        const r = await fetch(url, { cache: 'no-store' });
        const j = await r.json();
        if (!cancel) {
          setState({ loading: false, allowed: !!j.allowed });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancel) setState({ loading: false, allowed: false, error: msg });
      }
    }

    run();
    return () => {
      cancel = true;
    };
  }, [listingId, address, chainId, canQuery]);

  return state;
}
