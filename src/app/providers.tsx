'use client';

import { ThirdwebProvider } from 'thirdweb/react';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Componente CLIENTE que envuelve ThemeProvider y ThirdwebProvider.
 * OJO: ThirdwebProvider en tu versión NO recibe `client` ni `autoConnect`.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThirdwebProvider>{children}</ThirdwebProvider>
    </ThemeProvider>
  );
}
