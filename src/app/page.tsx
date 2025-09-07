// src/app/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <section className="w-full flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-tr from-indigo-100/50 via-white to-indigo-50/20 px-6 pt-20 pb-10">
        <div className="flex flex-col items-center max-w-2xl text-center gap-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-indigo-800 drop-shadow-sm">
            Compra, vende o subasta propiedades tokenizadas.
          </h1>
          <p className="text-lg text-gray-600 max-w-xl">
            Accede al marketplace inmobiliario Web3 líder. Listados, subastas y
            gestión de propiedades respaldadas por NFTs y contratos inteligentes
            en Polygon. Simple. Seguro. Global.
          </p>
          <Link href="/marketplace">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-full hover:bg-indigo-700 transition text-lg font-semibold shadow-lg mt-4">
              Explorar propiedades
            </button>
          </Link>
        </div>

        {/* ✅ Imagen optimizada */}
        <div className="relative mt-12 w-full max-w-3xl rounded-3xl shadow-xl border overflow-hidden aspect-[16/9]">
          <Image
            src="/images/fondo.png"
            alt="Banner Web3 Real Estate"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1024px"
          />
        </div>
      </section>

      {/* Sección de beneficios/valores del marketplace */}
      <section className="w-full flex flex-col md:flex-row justify-center items-stretch gap-10 py-14 bg-white border-t">
        <div className="flex-1 px-4 max-w-xs text-center">
          <h3 className="text-xl font-bold text-indigo-700 mb-2">
            Trading Inmobiliario 24/7
          </h3>
          <p className="text-gray-500">
            Compra y vende propiedades en cualquier horario, sin burocracia ni
            intermediarios.
          </p>
        </div>
        <div className="flex-1 px-4 max-w-xs text-center">
          <h3 className="text-xl font-bold text-indigo-700 mb-2">
            Auditoría On-chain
          </h3>
          <p className="text-gray-500">
            Todas las transacciones son públicas, verificables y garantizadas
            por contratos inteligentes.
          </p>
        </div>
        <div className="flex-1 px-4 max-w-xs text-center">
          <h3 className="text-xl font-bold text-indigo-700 mb-2">
            Pagos flexibles
          </h3>
          <p className="text-gray-500">
            Acepta stablecoins, $ , POLYGON y más. Cobros y pagos directos, sin
            comisiones ocultas.
          </p>
        </div>
      </section>

      {/* Llamado secundario */}
      <section className="flex flex-col items-center justify-center py-14 bg-indigo-50 border-t border-indigo-100">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
          ¿Tienes una propiedad tokenizada?
        </h2>
        <Link href="/crear-nft">
          <button className="bg-indigo-500 hover:bg-indigo-700 text-white px-7 py-3 rounded-full text-base font-bold shadow-md">
            Publica tu propiedad
          </button>
        </Link>
      </section>
    </>
  );
}
