'use client';

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import NFTAttributeInputs, { Attribute } from './NFTAttributeInputs';
import NFTImageUpload from './NFTImageUpload';
import NFTFeedbackBanner from './NFTFeedbackBanner';
import NFTLivePreview from './NFTLivePreview';

export default function CreateNFTForm() {
  const account = useActiveAccount();
  const [nftType, setNFTType] = useState<'ERC721' | 'ERC1155'>('ERC721');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [amount, setAmount] = useState<number>(1);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [minted, setMinted] = useState<boolean>(false);
  const [mintedUri, setMintedUri] = useState<string>('');

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(undefined);

    // Simulación: reemplaza por lógica real de minteo thirdweb.
    try {
      setTimeout(() => {
        setIsPending(false);
        setMinted(true);
        setMintedUri('ipfs://demoUri-postmint');
      }, 1500);
    } catch {
      setIsPending(false);
      setError('Error al mintear');
    }
  }

  const erc721BtnClass = [
    'px-5 py-2 rounded-xl font-bold border',
    nftType === 'ERC721'
      ? 'bg-indigo-600 text-white'
      : 'bg-white text-zinc-900',
  ].join(' ');
  const erc1155BtnClass = [
    'px-5 py-2 rounded-xl font-bold border',
    nftType === 'ERC1155' ? 'bg-pink-500 text-white' : 'bg-white text-zinc-900',
  ].join(' ');

  return (
    <form
      onSubmit={handleMint}
      className="max-w-xl mx-auto py-10 px-6 rounded-3xl bg-white/70 dark:bg-zinc-900/90 shadow-2xl relative border-[1.5px] border-zinc-100 dark:border-zinc-800"
    >
      <div className="mb-6 flex gap-4 justify-center">
        <button
          type="button"
          className={erc721BtnClass}
          onClick={() => setNFTType('ERC721')}
        >
          NFT Único (ERC-721)
        </button>
        <button
          type="button"
          className={erc1155BtnClass}
          onClick={() => setNFTType('ERC1155')}
        >
          Colección (ERC-1155)
        </button>
      </div>
      <NFTImageUpload
        image={image}
        setImage={(file) => {
          setImage(file);
          setImagePreview(URL.createObjectURL(file));
        }}
      />
      <div>
        <label className="block font-semibold">Nombre</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-semibold">Descripción</label>
        <textarea
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={2}
        />
      </div>
      {nftType === 'ERC1155' && (
        <div>
          <label className="block font-semibold">Cantidad a mintear</label>
          <input
            type="number"
            min={1}
            max={10000}
            className="input"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
          <span className="text-xs text-zinc-400">
            Puedes mintear copias múltiples.
          </span>
        </div>
      )}
      <div className="mb-3">
        <label className="block font-semibold">Atributos (opcional)</label>
        <p className="text-xs text-zinc-500 mb-2">
          Añade traits como “Rareza: Épico”, “Fuerza: 24”, “Color: Azul”. Cada
          atributo ayuda a filtrar y destacar en marketplaces premium.
        </p>
        <NFTAttributeInputs
          attributes={attributes}
          setAttributes={setAttributes}
        />
      </div>
      {/* Preview en vivo antes de mintear */}
      {imagePreview && !minted && (
        <div className="my-8">
          <NFTLivePreview
            name={name}
            description={description}
            image={imagePreview}
            attributes={attributes}
            type={nftType}
            amount={amount}
          />
        </div>
      )}
      {/* Si tienes la lógica de mint con URI, puedes añadir este render */}
      {/* {mintedUri && minted && <NFTMintPreview uri={mintedUri} />} */}
      <button
        type="submit"
        disabled={isPending || !account}
        className="w-full py-4 mt-2 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 transition text-white shadow-lg text-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Minteando...' : 'Mintear NFT'}
      </button>
      <NFTFeedbackBanner minted={minted} error={error} data={mintedUri} />
    </form>
  );
}
