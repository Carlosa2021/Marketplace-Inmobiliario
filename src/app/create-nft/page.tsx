// pages/create.nft.tsx
import CreateNFTContractForm from '@/components/NFT/CreateNFTContractForm';

export default function CreateNFTPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-indigo-100 to-pink-200 dark:from-zinc-900 dark:via-indigo-950 dark:to-pink-950 py-20 px-4">
      <CreateNFTContractForm />
    </div>
  );
}
