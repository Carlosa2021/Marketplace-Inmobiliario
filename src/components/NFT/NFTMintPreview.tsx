// src/components/NFT/NFTMintPreview.tsx
'use client';

import React from 'react';
import Image from 'next/image';

export default function NFTMintPreview({ uri }: { uri: string }) {
  // Si tu URI es metadata, podrías hacer fetch aquí del JSON para extraer la imagen real.
  // Aquí asumimos que `uri` es directamente una URL de imagen válida.

  // ¿Es una imagen soportada?
  const isImg = /\.(jpg|jpeg|png|gif|webp|svg)$/.test(uri);

  return (
    <div className="mt-6">
      <h2 className="font-bold text-lg mb-2">Vista previa IPFS:</h2>
      <a
        href={uri}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-indigo-700 break-all"
      >
        {uri}
      </a>
      {isImg && (
        <div className="relative my-3 rounded-lg border shadow max-h-48 mx-auto aspect-square w-48 h-48">
          {/* Por defecto, Next.js bloquea imágenes externas poco seguras.
              Si es IPFS, asegúrate de tener las URLs gateway admitidas en next.config.js */}
          <Image
            src={uri}
            alt="NFT IPFS"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
            unoptimized={uri.startsWith('ipfs://')} // Opcional para evitar advertencias si IPFS
          />
        </div>
      )}
    </div>
  );
}
