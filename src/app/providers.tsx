'use client';

import { ThirdwebProvider } from 'thirdweb/react';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Providers simplificados para evitar loops y errores masivos
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThirdwebProvider>{children}</ThirdwebProvider>
    </ThemeProvider>
  );
}
