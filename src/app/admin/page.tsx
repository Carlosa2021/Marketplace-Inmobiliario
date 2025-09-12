// src/app/admin/page.tsx
import NebulaAssistant from '@/components/admin/NebulaAssistant';
import DownloadReceiptButton from '@/components/DownloadReceiptButton';

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
