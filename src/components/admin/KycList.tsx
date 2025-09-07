// src/components/admin/KycList.tsx
'use client';
import React, { useEffect, useState } from 'react';
import type { KycSubmission } from '@/lib/types';

type ApiListResponse =
  | { ok: true; data: KycSubmission[] }
  | { ok: false; error?: unknown };
type ApiSingleResponse =
  | { ok: true; data: KycSubmission }
  | { ok: false; error?: unknown };

export default function KycList() {
  const [items, setItems] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // id en acción

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/kyc');
      const json = (await res.json()) as ApiListResponse;
      if (res.ok && json.ok) {
        setItems(json.data || []);
      } else {
        console.error('KYC list error', json);
        alert('Error cargando solicitudes KYC');
      }
    } catch (err) {
      console.error('KYC list fetch error', err);
      alert('Error de red cargando solicitudes KYC');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id: string, act: 'approve' | 'reject') {
    const notes = prompt('Notas (opcional)') ?? undefined;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/kyc/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, notes }),
      });
      const json = (await res.json()) as ApiSingleResponse;
      if (res.ok && json.ok) {
        // refrescar lista
        await load();
      } else {
        console.error('KYC action error', json);
        alert('Error al actualizar la solicitud: ' + JSON.stringify(json));
      }
    } catch (err) {
      console.error('KYC action fetch error', err);
      alert('Error de red al actualizar la solicitud');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-3">
      {items.length === 0 && <div>No hay solicitudes</div>}
      {items.map((it) => (
        <div key={it.id} className="p-3 border rounded">
          <div>
            <b>{it.name}</b> — {it.email} — <i>{it.status}</i>
          </div>
          <div>
            ID: {it.idNumber} - {it.idType}
          </div>
          {it.idImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={it.idImageUrl} alt="id" className="max-w-xs mt-2" />
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleAction(it.id, 'approve')}
              className="px-3 py-1 bg-green-600 text-white rounded"
              disabled={actionLoading === it.id}
            >
              {actionLoading === it.id ? 'Procesando...' : 'Aprobar'}
            </button>
            <button
              onClick={() => handleAction(it.id, 'reject')}
              className="px-3 py-1 bg-red-600 text-white rounded"
              disabled={actionLoading === it.id}
            >
              {actionLoading === it.id ? 'Procesando...' : 'Rechazar'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
