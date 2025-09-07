'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BuyDirectListingButton } from 'thirdweb/react';
import { polygon } from 'thirdweb/chains';
import { client } from '@/lib/thirdweb/client-browser';
import { Button } from '@/components/ui/button';
import { BuyWithFiatButton } from '@/components/properties/BuyWithFiatButton';
import { useActiveAccount } from 'thirdweb/react';

type BuyModalProps = {
  open: boolean;
  onClose: () => void;
  listingId: string | number | bigint;
  contractAddress?: string;
  priceEUR?: number;
  title?: string;
  subtitle?: string;
  onCryptoSuccess?: (txHash: string) => void;
  chainId?: number;
};

export function BuyModal({
  open,
  onClose,
  listingId,
  contractAddress = '0x3fD5B4F1058416ea6BEeAc7dd3b239DD014a07a6',
  priceEUR,
  title = 'Completa tu compra',
  subtitle = 'Selecciona método de pago',
  onCryptoSuccess,
  chainId = 137,
}: BuyModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'cripto' | 'tarjeta'>('cripto');

  const account = useActiveAccount();
  const address = account?.address ?? '';

  const listingIdBI = useMemo(
    () =>
      typeof listingId === 'bigint' ? listingId : BigInt(String(listingId)),
    [listingId],
  );

  // —— Estado allowlist
  const [wlLoading, setWlLoading] = useState(false);
  const [wlAllowed, setWlAllowed] = useState<boolean | null>(null);

  // —— Solicitud acceso
  const [reqEmail, setReqEmail] = useState('');
  const [reqSending, setReqSending] = useState(false);
  const [reqMsg, setReqMsg] = useState<string | null>(null);

  // Accesibilidad + ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Chequear allowlist al abrir/cambiar wallet
  useEffect(() => {
    if (!open || !address) {
      setWlAllowed(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setWlLoading(true);
      setReqMsg(null);
      try {
        const r = await fetch(
          `/api/allowlist/${String(
            listingIdBI,
          )}/check?address=${address}&chainId=${chainId}`,
        );
        const data = (await r.json()) as { allowed: boolean };
        if (!cancelled) setWlAllowed(!!data.allowed);
      } catch {
        if (!cancelled) setWlAllowed(false);
      } finally {
        if (!cancelled) setWlLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, address, chainId, listingIdBI]);

  if (!open) return null;

  // UI helpers
  const cryptoDisabled = !address || wlLoading || wlAllowed === false;

  async function requestAccess() {
    if (!address) {
      setReqMsg('Conecta tu wallet primero.');
      return;
    }
    setReqSending(true);
    setReqMsg(null);
    try {
      const r = await fetch(`/api/allowlist/${String(listingIdBI)}/request`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          address,
          chainId,
          email: reqEmail || undefined,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      setReqMsg('Solicitud enviada. Te avisaremos cuando te aprueben.');
      setReqEmail('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setReqMsg(`Error: ${msg}`);
    } finally {
      setReqSending(false);
    }
  }

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="buy-modal-title"
      aria-describedby="buy-modal-desc"
      className="fixed inset-0 z-[9999] grid place-items-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl outline-none dark:bg-zinc-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="buy-modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            <p
              id="buy-modal-desc"
              className="text-sm text-zinc-500 dark:text-zinc-400"
            >
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5">
          <div
            className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800"
            role="tablist"
          >
            <button
              role="tab"
              aria-selected={tab === 'cripto'}
              aria-controls="tab-panel-cripto"
              id="tab-cripto"
              onClick={() => setTab('cripto')}
              className={[
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition',
                tab === 'cripto'
                  ? 'bg-white shadow dark:bg-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              Cripto
            </button>
            <button
              role="tab"
              aria-selected={tab === 'tarjeta'}
              aria-controls="tab-panel-tarjeta"
              id="tab-tarjeta"
              onClick={() => setTab('tarjeta')}
              className={[
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition',
                tab === 'tarjeta'
                  ? 'bg-white shadow dark:bg-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              Tarjeta (EUR)
            </button>
          </div>

          {/* Contenido tabs */}
          <div className="mt-4 space-y-4">
            {/* CRIPTO */}
            <div
              role="tabpanel"
              id="tab-panel-cripto"
              aria-labelledby="tab-cripto"
              hidden={tab !== 'cripto'}
            >
              {/* Estado WL */}
              {wlLoading && (
                <div className="mb-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                  Comprobando allowlist…
                </div>
              )}

              {wlAllowed === false && !wlLoading && (
                <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-300/30 dark:bg-amber-900/20 dark:text-amber-200">
                  Tu wallet{' '}
                  <span className="font-mono">
                    {address.slice(0, 6)}…{address.slice(-4)}
                  </span>{' '}
                  no está autorizada para comprar con cripto. Puedes solicitar
                  acceso o pagar con tarjeta.
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="email"
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="Email (opcional)"
                      className="flex-1 rounded border px-3 py-2 text-sm dark:bg-zinc-900"
                    />
                    <Button onClick={requestAccess} disabled={reqSending}>
                      {reqSending ? 'Enviando…' : 'Solicitar acceso'}
                    </Button>
                  </div>
                  {reqMsg && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {reqMsg}
                    </div>
                  )}
                </div>
              )}

              <BuyDirectListingButton
                disabled={cryptoDisabled}
                contractAddress={contractAddress}
                listingId={listingIdBI}
                quantity={1n}
                client={client}
                chain={polygon}
                onTransactionConfirmed={(tx) => {
                  onCryptoSuccess?.(tx.transactionHash);
                  onClose();
                }}
                onError={(err) => alert('Error en la compra: ' + err.message)}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {cryptoDisabled ? 'Cripto no disponible' : 'Comprar con cripto'}
              </BuyDirectListingButton>

              <p className="mt-2 text-xs text-zinc-500">
                Firmarás la transacción en tu wallet y recibirás el NFT al
                confirmarse en la blockchain.
              </p>
            </div>

            {/* TARJETA */}
            <div
              role="tabpanel"
              id="tab-panel-tarjeta"
              aria-labelledby="tab-tarjeta"
              hidden={tab !== 'tarjeta'}
            >
              {typeof priceEUR === 'number' ? (
                <BuyWithFiatButton
                  propertyId={String(listingIdBI)}
                  priceEUR={priceEUR}
                />
              ) : (
                <div className="rounded-md border border-dashed border-zinc-300 p-3 text-xs text-zinc-500 dark:border-zinc-700">
                  Define <code>priceEUR</code> para habilitar el pago con
                  tarjeta.
                </div>
              )}
              <p className="mt-2 text-xs text-zinc-500">
                Pagas en EUR; convertimos a USDC y, al confirmarse el pago, se
                entrega el NFT automáticamente a tu wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6">
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
