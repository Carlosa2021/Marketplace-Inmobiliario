// src/components/NFT/NFTAttributeInputs.tsx
import React from 'react';
export type Attribute = { trait_type: string; value: string };

export default function NFTAttributeInputs({
  attributes,
  setAttributes,
}: {
  attributes: Attribute[];
  setAttributes: (a: Attribute[]) => void;
}) {
  const addAttr = () =>
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  const removeAttr = (i: number) =>
    setAttributes(attributes.filter((_, idx) => idx !== i));
  const handleAttr = (
    i: number,
    field: 'trait_type' | 'value',
    val: string,
  ) => {
    const copy = [...attributes];
    copy[i][field] = val;
    setAttributes(copy);
  };
  return (
    <div>
      <label className="block font-semibold mb-1">Atributos</label>
      {attributes.map((attr, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input
            className="input w-1/2"
            placeholder="Nombre"
            value={attr.trait_type}
            onChange={(e) => handleAttr(idx, 'trait_type', e.target.value)}
          />
          <input
            className="input w-1/2"
            placeholder="Valor"
            value={attr.value}
            onChange={(e) => handleAttr(idx, 'value', e.target.value)}
          />
          <button
            type="button"
            className="text-red-400 font-bold"
            onClick={() => removeAttr(idx)}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addAttr}
        className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded"
      >
        + Añadir atributo
      </button>
    </div>
  );
}
