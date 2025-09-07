// pages/crear-nft.tsx
import CreateNFTForm from '@/components/NFT/CreateNFTForm';

export default function CrearNFTPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-indigo-100 to-pink-200 dark:from-zinc-900 dark:via-indigo-950 dark:to-pink-950 py-20 px-4">
      <CreateNFTForm />
    </div>
  );
}
