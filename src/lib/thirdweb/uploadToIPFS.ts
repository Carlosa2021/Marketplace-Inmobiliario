import { upload } from 'thirdweb/storage';
import { client } from './client-server';

export const uploadToIPFS = async (file: File) => {
  const metadata = {
    name: 'Propiedad NFT',
    description: 'Descripción de la propiedad',
    image: file, // este puede ser un archivo File directamente
  };

  const uri = await upload({
    client,
    files: [metadata], // aquí va un array con 1 metadata
  });

  return uri; // ipfs://...
};
