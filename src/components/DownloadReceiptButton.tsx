// src/components/DownloadReceiptButton.tsx
'use client';

import React, { useState } from 'react';

type Props = {
  orderId: string;
  label?: string;
};

export default function DownloadReceiptButton({
  orderId,
  label = 'Descargar recibo',
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      console.log('[DownloadReceiptButton] calling /api/receipts', orderId);
      const res = await fetch(
        `/api/receipts?orderId=${encodeURIComponent(orderId)}`,
      );
      const json = await res.json();
      console.log('[DownloadReceiptButton] response', res.status, json);

      if (res.ok && json?.url && typeof json.url === 'string') {
        const url = json.url;
        const opened = window.open(url, '_blank', 'noopener');

        if (!opened) {
          // fallback
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      } else {
        alert('Error generando recibo: ' + (json?.error ?? 'unknown'));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert('Network error: ' + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
    >
      {loading ? 'Generando...' : label}
    </button>
  );
}
