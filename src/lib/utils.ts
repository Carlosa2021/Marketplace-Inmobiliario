import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { resolveScheme } from 'thirdweb/storage';
import { client } from '@/lib/thirdweb/client-browser'; // ✅ asegúrate de importar el correcto

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const resolveIPFS = async (url?: string) => {
  if (!url) return '';
  return resolveScheme({ uri: url, client });
};
