// src/app/admin/page.tsx
import NebulaAssistant from '@/components/admin/NebulaAssistant';
import DownloadReceiptButton from '@/components/DownloadReceiptButton';
import KycList from '@/components/admin/KycList';
import KycForm from '@/components/admin/KycForm';

export default function AdminPage() {
  const demoOrderId = 'test-123'; // o coge uno real de tu lista de orders

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      {/* Nebula assistant */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Asistente on-chain</h2>
        <NebulaAssistant />
      </section>

      {/* KYC - admin */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Solicitudes KYC</h2>
            <p className="text-sm text-zinc-400">
              Revisa y gestiona las solicitudes de verificación.
            </p>
          </div>
        </div>

        <div className="border rounded p-4 bg-white/50 dark:bg-zinc-900/40">
          <KycList />
        </div>
      </section>

      {/* KYC form (para pruebas) */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Enviar KYC (pruebas)</h2>
        <p className="text-sm text-zinc-400 mb-3">
          Formulario útil para enviar entradas de KYC desde el admin (solo
          pruebas).
        </p>
        <div className="border rounded p-4 bg-white/50 dark:bg-zinc-900/40">
          <KycForm />
        </div>
      </section>

      {/* Recibos / otras utilidades */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Prueba: generar recibo</h2>
        <p className="mb-2 text-sm text-zinc-400">OrderId: {demoOrderId}</p>
        <DownloadReceiptButton
          orderId={demoOrderId}
          label="Generar recibo (PDF)"
        />
      </section>
    </main>
  );
}
