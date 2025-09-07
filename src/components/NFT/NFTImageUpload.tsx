// src/components/NFT/NFTImageUpload.tsx
import { useState } from 'react';

export default function NFTImageUpload({
  image,
  setImage,
}: {
  image: File | null;
  setImage: (f: File) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div>
      <label className="block font-semibold mb-1">Imagen del NFT</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        required
        className="file:rounded-full file:bg-indigo-600 file:text-white mt-1"
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="my-3 rounded-lg shadow-md max-h-48 mx-auto"
        />
      )}
    </div>
  );
}
