// src/components/Investment/InvestmentWizard.tsx
import { useState } from 'react';
import WizardStepInvestment from './WizardStepInvestment';

export default function InvestmentWizard({ asset, price }) {
  const [step, setStep] = useState(1);
  // Puedes pasar asset/listingId/price según tu flow

  function handleBuySuccess() {
    setStep(3); // o muestras feedback
    // Aquí disparas preview, receipt, etc.
  }

  return (
    <div>
      {step === 1 && (
        <div>
          {/* Tu selector de activo, ejemplo: */}
          {/* <AssetSelect onSelect={(a, p) => { setAsset(a); setPrice(p); setStep(2); }} /> */}
          <button className="btn btn-indigo" onClick={() => setStep(2)}>
            (Simular selección activo, siguiente)
          </button>
        </div>
      )}
      {step === 2 && (
        <WizardStepInvestment
          listingPrice={price}
          onBuySuccess={handleBuySuccess}
        />
      )}
      {step === 3 && (
        <div className="bg-green-100 p-6 rounded-xl text-green-800 font-semibold">
          ¡Compra completada con éxito!
        </div>
      )}
    </div>
  );
}
