// src/components/NFT/NFTFeedbackBanner.tsx
import React from 'react';

export default function NFTFeedbackBanner({
  minted,
  error,
  data,
}: {
  minted: boolean;
  error?: any;
  data?: any;
}) {
  if (error)
    return (
      <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-4">
        {error.message ?? 'Error inesperado.'}
      </div>
    );
  if (minted)
    return (
      <div className="bg-green-100 text-green-700 px-4 py-2 rounded mt-4 flex flex-col items-center">
        <span>✅ NFT minteado con éxito</span>
        {data?.transactionHash && (
          <a
            href={`https://polygonscan.com/tx/${data?.transactionHash}`}
            className="underline text-indigo-800 mt-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver transacción
          </a>
        )}
      </div>
    );
  return null;
}
