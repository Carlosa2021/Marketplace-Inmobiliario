// src/app/kyc/page.tsx
import KycForm from '@/components/admin/KycForm';

export const metadata = {
  title: 'KYC - ChainX',
};

export default function Page() {
  return (
    <main className="container mx-auto px-4 py-12">
      <KycForm />
    </main>
  );
}
