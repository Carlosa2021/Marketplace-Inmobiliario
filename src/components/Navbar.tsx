// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { ConnectButton } from 'thirdweb/react';
import { client } from '@/lib/thirdweb/client-browser';
import { chain } from '@/lib/thirdweb/client-browser';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/marketplace/demo', label: 'Demo' },
  { href: '/mis-nfts', label: 'Mis Inmuebles' },
  { href: '/crear-nft', label: 'Crear NFT' },
  { href: '/kyc', label: 'KYC' },
  { href: '/admin', label: 'Admin' },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-4 z-30 mx-4 rounded-xl bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md shadow-md border border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 select-none">
          <span className="font-extrabold text-xl md:text-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight drop-shadow">
            ChainX
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex gap-6 items-center text-base font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors',
                pathname === link.href
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : '',
              ].join(' ')}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Theme + Wallet + Hamburgesa */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Cambiar tema"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full p-2 border dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {mounted ? (
              theme === 'dark' ? (
                <span role="img" aria-label="Modo oscuro">
                  🌙
                </span>
              ) : (
                <span role="img" aria-label="Modo claro">
                  ☀️
                </span>
              )
            ) : null}
          </button>

          <div className="hidden md:block">
            <ConnectButton
              client={client}
              chain={chain}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          </div>

          <button
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">
              {menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            </span>

            {/* Iconos */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ display: menuOpen ? 'none' : 'block' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ display: menuOpen ? 'block' : 'none' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Drawer Mobile */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={[
          'md:hidden px-4 pb-6 transition-max-h duration-300 overflow-hidden',
          menuOpen ? 'max-h-96' : 'max-h-0',
        ].join(' ')}
      >
        <div className="flex flex-col gap-1 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'block py-3 px-4 rounded-lg font-medium transition-colors text-center',
                pathname === link.href
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-bold'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
              ].join(' ')}
              aria-current={pathname === link.href ? 'page' : undefined}
              tabIndex={menuOpen ? 0 : -1}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-4">
          {/* Wallet en mobile */}
          <ConnectButton
            client={client}
            chain={chain}
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
        </div>
      </div>
    </nav>
  );
}
