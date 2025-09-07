import React from 'react';
import { Attribute } from './NFTAttributeInputs';

type NFTLivePreviewProps = {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[];
  type: 'ERC721' | 'ERC1155';
  amount: number;
};

export default function NFTLivePreview({
  name,
  description,
  image,
  attributes,
  type,
  amount,
}: NFTLivePreviewProps) {
  return (
    <div className="rounded-2xl shadow-xl bg-gradient-to-br from-indigo-100 to-pink-100 dark:from-zinc-800 dark:to-indigo-950 p-6 flex flex-col items-center w-full max-w-md mx-auto">
      <span
        className="mb-2 text-xs px-3 py-1 rounded-full font-semibold"
        style={{
          background: type === 'ERC721' ? '#6366f1' : '#f43f5e',
          color: 'white',
        }}
      >
        {type === 'ERC721'
          ? 'NFT ÚNICO (721)'
          : `COLECCIÓN (1155)${amount ? ' · ' + amount + ' uds' : ''}`}
      </span>
      <img
        src={image}
        alt={name}
        className="w-48 h-48 object-cover rounded-lg border mb-4"
      />
      <h2 className="text-xl font-bold mb-2">{name || 'Tu NFT'}</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-200">{description}</p>
      {!!attributes.length && (
        <div className="mt-3 w-full">
          <div className="font-bold text-xs text-zinc-400 mb-1">Atributos:</div>
          <ul className="grid grid-cols-2 gap-1">
            {attributes.map((attr, i) => (
              <li
                key={i}
                className="bg-zinc-100 dark:bg-zinc-800 rounded px-3 py-1 text-xs flex flex-col"
              >
                <span className="font-bold">{attr.trait_type}</span>
                <span className="">{attr.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
