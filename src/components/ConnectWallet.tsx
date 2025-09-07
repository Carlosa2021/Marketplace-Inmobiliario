// src/components/ConnectWallet.tsx
'use client';

import dynamic from 'next/dynamic';
import { client } from '@/lib/thirdweb/client-browser';

// Carga el ConnectButton solo en cliente para evitar SSR de wallet
const ConnectButton = dynamic(
  () => import('thirdweb/react').then((m) => m.ConnectButton),
  { ssr: false },
);

type Props = {
  theme?: 'dark' | 'light';
};

export function ConnectWallet({ theme }: Props) {
  return (
    <ConnectButton
      client={client}                  // ✅ requerido por tu versión
      autoConnect={false}              // ✅ evita reconexión en cada navegación
      connectModal={{ size: 'compact' }}
      theme={theme}
    />
  );
}
