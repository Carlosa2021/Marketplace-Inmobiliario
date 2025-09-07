import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Aquí podrías listar dinámicamente tus listings
  const base = 'https://tu-dominio.com';
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/marketplace`, priority: 0.9 },
    // …añade rutas clave
  ];
}
