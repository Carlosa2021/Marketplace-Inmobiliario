'use client';
import { useCallback, useEffect, useState } from 'react';

export function useKyc(address?: string) {
  const [status, setStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/kyc/status/${address}`);
      const j = await r.json();
      setStatus(j.status ?? 'none');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const request = useCallback(async () => {
    if (!address) return;
    await fetch('/api/kyc/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    await refresh();
  }, [address, refresh]);

  return {
    status,
    loading,
    refresh,
    request,
    isApproved: status === 'approved',
  };
}
