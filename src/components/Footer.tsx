'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full mt-20 bg-gradient-to-r from-indigo-950 via-blue-900 to-fuchsia-900 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 text-white dark:text-zinc-300 py-4 px-6 rounded-2xl shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo y marca */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent text-xl tracking-tight select-none">
            ChainX
          </span>
        </div>
        {/* Enlaces y redes sociales */}
        <div className="flex items-center gap-6">
          <Link
            href="https://twitter.com/"
            target="_blank"
            aria-label="Twitter"
            className="hover:text-blue-400 transition h-8 w-8 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.633 7.997c.013.176.013.352.013.528 0 5.37-4.087 11.562-11.562 11.562A11.49 11.49 0 010 18.135a8.332 8.332 0 006.13-1.706A4.12 4.12 0 012.86 14.05c.245.04.498.061.756.061a4.108 4.108 0 001.276-.175A4.117 4.117 0 01.805 10.32v-.052a4.1 4.1 0 001.858.522A4.114 4.114 0 012.072 5.5a11.66 11.66 0 008.457 4.292 4.635 4.635 0 01-.099-.942 4.112 4.112 0 017.111-2.806 8.204 8.204 0 002.605-.996 4.092 4.092 0 01-1.804 2.272 8.233 8.233 0 002.366-.646 8.773 8.773 0 01-2.061 2.125z" />
            </svg>
          </Link>
          <Link
            href="https://discord.com/"
            target="_blank"
            aria-label="Discord"
            className="hover:text-indigo-300 transition h-8 w-8 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.369A19.791 19.791 0 0016.885 3.18a.118.118 0 00-.125.06 13.874 13.874 0 00-.619 1.268c-3.813-.573-7.63-.573-11.442 0a12.164 12.164 0 00-.626-1.268.117.117 0 00-.125-.06c-1.437.356-2.79.877-4.104 1.638C.234 9.047.13 13.631 2.314 19.061a.117.117 0 00.172.055c1.785-1.302 3.454-2.046 5.074-2.359a.118.118 0 01.125.052c.357.504.732.98 1.125 1.426a.117.117 0 00.121.034c.371-.085.752-.144 1.134-.175v.332c0 .126.107.226.238.217C9.372 21.951 10.668 22 12 22s2.628-.049 3.698-.21a.216.216 0 00.237-.217V19.77a7.902 7.902 0 002.006-.27.117.117 0 00.121-.034c.393-.446.768-.922 1.125-1.426a.118.118 0 01.125-.052c1.62.313 3.289 1.057 5.074 2.36a.117.117 0 00.172-.055c2.186-5.43 2.08-10.014-.515-14.693z" />
            </svg>
          </Link>
          <Link
            href="https://github.com/"
            target="_blank"
            aria-label="GitHub"
            className="hover:text-gray-300 transition h-8 w-8 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.031c-3.338.724-4.033-1.416-4.033-1.416-.546-1.387-1.334-1.756-1.334-1.756-1.086-.744.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.776.418-1.305.76-1.605-2.665-.304-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.304-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.872.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.804 5.625-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </Link>
        </div>
        {/* Copyright */}
        <div className="text-sm text-zinc-200 dark:text-zinc-400 font-light text-center md:text-right mt-4 md:mt-0">
          © {new Date().getFullYear()} ChainX. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
