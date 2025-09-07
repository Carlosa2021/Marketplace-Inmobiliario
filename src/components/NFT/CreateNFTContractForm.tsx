import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useMintNFTContract } from '@/hooks/useMintNFTContract';
import NFTImageUpload from './NFTImageUpload';
import NFTFeedbackBanner from './NFTFeedbackBanner';
import NFTMintPreview from './NFTMintPreview';
import { uploadToIPFS } from '@/lib/thirdweb/uploadToIPFS';

export default function CreateNFTContractForm() {
  const user = useActiveAccount();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUri, setImageUri] = useState<string>('');
  // SOLO las claves que existen:
  const { mint, minted, isPending, error, data } = useMintNFTContract();

  async function handleImage(file: File) {
    setImage(file);
    const uri = await uploadToIPFS(file);
    setImageUri(uri);
  }

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.address || !imageUri) return;
    await mint({ to: user.address, uri: imageUri });

    setName('');
    setDesc('');
    setImage(null);
    setImageUri('');
  }

  return (
    <form
      onSubmit={handleMint}
      className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl max-w-lg mx-auto space-y-6"
    >
      <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-500 via-pink-400 to-purple-700 text-transparent bg-clip-text">
        Mintear NFT (Contrato Directo)
      </h1>
      <NFTImageUpload image={image} setImage={handleImage} />
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
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !user}
        className="w-full py-3 rounded-xl font-bold bg-indigo-600 hover:bg-pink-500 transition text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Minteando...' : 'Mintear NFT'}
      </button>
      <NFTFeedbackBanner minted={minted} error={error} data={data} />
      {/* Puedes mostrar la imagen/uri que subiste a IPFS después del mint*/}
      {minted && imageUri && <NFTMintPreview uri={imageUri} />}
    </form>
  );
}
