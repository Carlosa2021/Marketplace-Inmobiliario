// src/components/admin/NebulaAssistant.tsx
'use client';

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { defineChain, prepareTransaction, sendTransaction } from 'thirdweb';
import { Button } from '@/components/ui/button';
import { client as twClient } from '@/lib/thirdweb/client-browser';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import * as React from 'react';

// ==== Tipos de la acción que devuelve el modelo ====
type ActionPayload = {
  action: 'prepare_transaction';
  chainId: number;
  to: `0x${string}`;
  data: `0x${string}`;
  value?: string | number | bigint | null;
  description?: string;
};

// Derivamos el tipo del hook (envoltorio que incluye .account)
type WalletConnection = ReturnType<typeof useActiveAccount>;

// ==== Helpers ====
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** Intenta extraer el primer bloque JSON válido y validarlo a ActionPayload */
function tryParseAction(jsonLike: string): ActionPayload | null {
  const match = jsonLike.match(/\{[\s\S]*\}/);
  if (!match) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;

  const action =
    parsed.action === 'prepare_transaction' ? 'prepare_transaction' : null;

  const chainId =
    typeof parsed.chainId === 'number'
      ? parsed.chainId
      : typeof parsed.chainId === 'string'
      ? Number(parsed.chainId)
      : NaN;

  const to =
    typeof parsed.to === 'string' && parsed.to.startsWith('0x')
      ? (parsed.to as `0x${string}`)
      : null;

  const data =
    typeof parsed.data === 'string' && parsed.data.startsWith('0x')
      ? (parsed.data as `0x${string}`)
      : null;

  if (!action || !Number.isFinite(chainId) || !to || !data) return null;

  const value =
    typeof parsed.value === 'string' ||
    typeof parsed.value === 'number' ||
    typeof parsed.value === 'bigint'
      ? parsed.value
      : null;

  const description =
    typeof parsed.description === 'string' ? parsed.description : undefined;

  return { action, chainId, to, data, value, description };
}

/** Ejecuta la transacción preparada por el modelo */
async function executeTx(payload: ActionPayload, wallet: WalletConnection) {
  if (!wallet) {
    throw new Error('Conecta tu wallet para firmar la transacción.');
  }

  const chain = defineChain({ id: payload.chainId });

  const tx = prepareTransaction({
    client: twClient,
    chain,
    to: payload.to,
    data: payload.data,
    value:
      payload.value === null || payload.value === undefined
        ? undefined
        : typeof payload.value === 'bigint'
        ? payload.value
        : BigInt(payload.value),
  });

  const receipt = await sendTransaction({
    transaction: tx,
    account: wallet,
  });

  return receipt;
}

// ==== UI ====
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  action?: ActionPayload | null;
};

// ✅ Tipos locales para los componentes de markdown
type CodeProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  inline?: boolean;
  children?: React.ReactNode;
};

type AnchorProps = React.PropsWithChildren<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>;
type TableProps = React.PropsWithChildren<
  React.TableHTMLAttributes<HTMLTableElement>
>;
type ThProps = React.PropsWithChildren<
  React.ThHTMLAttributes<HTMLTableCellElement>
>;
type TdProps = React.PropsWithChildren<
  React.TdHTMLAttributes<HTMLTableCellElement>
>;

// ✅ Render de Markdown con soporte para tablas y bloques de código
const CodeBlock: React.FC<CodeProps> = ({ inline, children, ...props }) => {
  if (inline) {
    return (
      <code
        className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800"
        {...props}
      >
        {children}
      </code>
    );
  }
  return (
    <code
      className="block p-3 rounded bg-zinc-100 dark:bg-zinc-800 overflow-x-auto"
      {...props}
    >
      {children}
    </code>
  );
};

const markdownComponents: Components = {
  code: CodeBlock,
  a(props: AnchorProps) {
    const { href, children, ...rest } = props;
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="underline text-indigo-600"
        {...rest}
      >
        {children}
      </a>
    );
  },
  table(props: TableProps) {
    const { children, ...rest } = props;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" {...rest}>
          {children}
        </table>
      </div>
    );
  },
  th(props: ThProps) {
    const { children, ...rest } = props;
    return (
      <th
        className="border px-2 py-1 text-left bg-zinc-100 dark:bg-zinc-800"
        {...rest}
      >
        {children}
      </th>
    );
  },
  td(props: TdProps) {
    const { children, ...rest } = props;
    return (
      <td className="border px-2 py-1 align-top" {...rest}>
        {children}
      </td>
    );
  },
};

// ==== NUEVO: tipos para la API de receipts ====
type ReceiptApiResponse = {
  publicPath?: string;
  url?: string;
  error?: string;
};

export default function NebulaAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();

  // ======= Estados NUEVOS para recibos =========
  const [orderId, setOrderId] = useState<string>('test-123');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  // =============================================

  const quick = [
    {
      label: 'Balances + NFTs',
      text:
        'Dime mis balances y NFTs en Polygon. Address: ' +
        (account?.address ?? '0x...') +
        '. Devuélveme una tabla compacta.',
    },
    {
      label: 'Analizar tx',
      text: 'Analiza la tx 0x... en Polygon. ¿Qué contrato interactuó? ¿Qué riesgos ves?',
    },
    {
      label: 'Comprar listing',
      text:
        'Prepara la transacción para comprar el listing 7 del marketplace 0x... en Polygon. ' +
        'Devuélveme el calldata. Responde en JSON con { "action":"prepare_transaction", "chainId":137, "to":"0x...", "data":"0x...", "value": "0" }',
    },
    {
      label: 'Swap USDC→POL',
      text:
        'Prepara un swap de 100 USDC a POL en Polygon. Dame la tx lista para firmar. ' +
        'Responde en JSON con { "action":"prepare_transaction", "chainId":137, "to":"0x...", "data":"0x...", "value":"0" }',
    },
    {
      label: 'Deploy ERC721',
      text:
        'Crea un ERC721 base para "ChainX Properties". Devuélveme args y pasos de deploy. ' +
        'Si preparas tx, usa JSON { "action":"prepare_transaction", "chainId":137, "to":"0x...", "data":"0x...", "value":"0" }',
    },
  ];

  async function send(msg?: string) {
    const content = (msg ?? input).trim();
    if (!content) return;

    setLoading(true);
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await fetch('/api/nebula', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'Eres Nebula, un asistente Web3 para ChainX. ' +
                'Si preparas transacciones, responde en JSON con { "action":"prepare_transaction", "chainId":<id>, "to":"0x...", "data":"0x...", "value":"0" }. ' +
                'No firmes ni envíes tx tú: solo prepara parámetros correctos. Sé conciso.',
            },
            ...messages,
            userMsg,
          ],
          from: account?.address,
          chain_ids: [137],
        }),
      });

      const text = await res.text();

      type ThirdwebChatResponse = {
        choices?: { message?: { content?: string } }[];
        message?: string;
        error?: string;
      };
      function isThirdwebChatResponse(v: unknown): v is ThirdwebChatResponse {
        return typeof v === 'object' && v !== null;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: `Error: ${text.slice(0, 200)}…` },
        ]);
        return;
      }

      const data: ThirdwebChatResponse | undefined = isThirdwebChatResponse(
        parsed,
      )
        ? parsed
        : undefined;

      const contentResp =
        data?.choices?.[0]?.message?.content ??
        data?.message ??
        data?.error ??
        'Sin respuesta';

      const action = tryParseAction(contentResp);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: contentResp, action },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ========== NUEVO: generar recibo ===========
  async function generateReceipt() {
    setReceiptError(null);
    setReceiptUrl(null);
    setLoadingReceipt(true);
    try {
      const resp = await fetch(
        `/api/receipts?orderId=${encodeURIComponent(orderId)}`,
      );
      const json = (await resp.json()) as ReceiptApiResponse;

      if (!resp.ok) {
        setReceiptError(json?.error ?? `HTTP ${resp.status}`);
        return;
      }

      if (json?.url) {
        // abrir en nueva pestaña
        const opened = window.open(json.url, '_blank', 'noopener');
        // si bloquea, fallback por <a>
        if (!opened) {
          const a = document.createElement('a');
          a.href = json.url;
          a.target = '_blank';
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        setReceiptUrl(json.url);
      } else {
        setReceiptError('La API no devolvió una URL válida.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setReceiptError(msg);
    } finally {
      setLoadingReceipt(false);
    }
  }
  // ============================================

  return (
    <div className="space-y-4">
      {/* Prompts rápidos */}
      <div className="flex flex-wrap gap-2">
        {quick.map((q) => (
          <Button
            key={q.label}
            variant="secondary"
            size="sm"
            onClick={() => send(q.text)}
          >
            {q.label}
          </Button>
        ))}
      </div>

      {/* Historial */}
      <div className="border rounded p-3 h-80 overflow-auto text-sm bg-white/50 dark:bg-zinc-900/40">
        {messages.map((m, i) => (
          <div key={i} className="mb-3">
            <div
              className={
                m.role === 'user'
                  ? 'text-indigo-600'
                  : 'text-zinc-800 dark:text-zinc-100'
              }
            >
              <b>{m.role === 'user' ? 'Tú' : 'Nebula'}:</b>
            </div>
            <div className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-200">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {m.content}
              </ReactMarkdown>
            </div>
            {m.action && <TxActionCard action={m.action} canSign={!!account} />}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 bg-white/70 dark:bg-zinc-900/60"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta algo on-chain…"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <Button onClick={() => send()} disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar'}
        </Button>
      </div>

      {/* =================== NUEVA SECCIÓN: Recibos =================== */}
      <div className="pt-4 border-t mt-2">
        <h3 className="text-sm font-medium mb-2">Prueba: generar recibo</h3>

        <div className="flex gap-2 items-center mb-2">
          <label className="text-xs text-zinc-400 mr-2">OrderId:</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="rounded px-2 py-1 bg-white/80 dark:bg-zinc-900/60"
          />
          <Button onClick={generateReceipt} disabled={loadingReceipt}>
            {loadingReceipt ? 'Generando...' : 'Generar recibo (API)'}
          </Button>
        </div>

        {receiptError && (
          <div className="text-red-500 text-sm mb-2">Error: {receiptError}</div>
        )}

        {receiptUrl && (
          <div className="space-y-2">
            <div>
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 underline"
              >
                Abrir recibo en nueva pestaña
              </a>
            </div>
            <div style={{ height: 460, border: '1px solid #2d2d2d' }}>
              <iframe
                src={receiptUrl}
                title="Preview recibo"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        )}
      </div>
      {/* ============================================================= */}
    </div>
  );
}

// ===== Card para firmar/enviar la transacción propuesta por el modelo =====
function TxActionCard({
  action,
  canSign,
}: {
  action: ActionPayload;
  canSign: boolean;
}) {
  const account = useActiveAccount();
  const [sending, setSending] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSign = async () => {
    setErr(null);
    setSending(true);
    try {
      const receipt = await executeTx(action, account);
      setHash(receipt.transactionHash);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2 rounded-lg border p-3 bg-white/60 dark:bg-zinc-900/50">
      <div className="text-sm font-semibold mb-1">Acción propuesta</div>
      <div className="text-xs text-zinc-600 dark:text-zinc-400">
        <div>chainId: {action.chainId}</div>
        <div>to: {action.to}</div>
        <div>value: {String(action.value ?? '0')}</div>
        <div className="truncate">data: {action.data.slice(0, 66)}…</div>
        {action.description && (
          <div className="mt-1">desc: {action.description}</div>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <Button onClick={onSign} disabled={!canSign || sending}>
          {sending ? 'Firmando…' : 'Firmar y enviar'}
        </Button>
        {hash && (
          <a
            className="px-3 py-2 rounded border text-sm"
            href={`https://polygonscan.com/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            Ver en Polygonscan
          </a>
        )}
      </div>

      {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
      {!canSign && (
        <div className="mt-2 text-xs text-zinc-500">
          Conecta tu wallet para firmar la transacción.
        </div>
      )}
    </div>
  );
}
