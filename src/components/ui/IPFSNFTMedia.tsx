'use client';
import { MediaRenderer } from 'thirdweb/react';
import { getNFT } from 'thirdweb/extensions/erc721';
import type { ThirdwebContract } from 'thirdweb';
import { useEffect, useState } from 'react';
import { client } from '@/lib/thirdweb/client-browser';

interface Props {
  contract: ThirdwebContract;
  tokenId: number | bigint;
  className?: string;
}

const gateways = [
  (cid: string, filename: string) => `https://ipfs.io/ipfs/${cid}/${filename}`,
  (cid: string, filename: string) =>
    `https://cloudflare-ipfs.com/ipfs/${cid}/${filename}`,
  (cid: string, filename: string) =>
    `https://gateway.pinata.cloud/ipfs/${cid}/${filename}`,
  (cid: string, filename: string) =>
    `https://ipfs.thirdwebcdn.com/ipfs/${cid}/${filename}`,
];

const resolveIPFS = (ipfsUrl: string): string[] => {
  if (!ipfsUrl.startsWith('ipfs://')) return [ipfsUrl];
  const withoutScheme = ipfsUrl.replace('ipfs://', '');
  const [cid, ...rest] = withoutScheme.split('/');
  const filename = rest.join('/');
  return gateways.map((fn) => fn(cid, filename));
};

export const IPFSNFTMedia = ({ contract, tokenId, className = '' }: Props) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchMetadata = async () => {
      try {
        const nft = await getNFT({
          contract,
          tokenId: BigInt(tokenId),
        });
        const rawImage = nft.metadata?.image || '';
        const urls = resolveIPFS(rawImage);
        if (!cancelled) {
          setImageUrls(urls);
          setCurrentIdx(0);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };
    fetchMetadata();
    return () => {
      cancelled = true;
    };
  }, [contract, tokenId]);

  if (error || imageUrls.length === 0) {
    return <p className="text-sm text-red-500">No se pudo cargar la imagen</p>;
  }

  // Fallback manual si falla el renderizado
  // MediaRenderer NO soporta onError, así que prueba con un img auxiliar para fallback avanzado
  return (
    <span
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Trick: Usa img para cambiar a otro gateway si falla, pero renderiza con MediaRenderer "normal" primero */}
      <MediaRenderer
        client={client}
        src={imageUrls[currentIdx]}
        className={className}
      />
      {/* Imagen oculta que sólo controla errores, para fallback manual por gateways */}
      <img
        src={imageUrls[currentIdx]}
        alt="NFT preview"
        style={{ display: 'none' }}
        onError={() => {
          if (currentIdx + 1 < imageUrls.length) {
            setCurrentIdx(currentIdx + 1);
          } else {
            setError(true);
          }
        }}
      />
    </span>
  );
};
