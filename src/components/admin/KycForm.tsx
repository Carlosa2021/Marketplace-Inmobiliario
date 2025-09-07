'use client';
import React, { useRef, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export default function KycForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState<
    'passport' | 'id' | 'driving_license' | 'other'
  >('passport');
  const [idNumber, setIdNumber] = useState('');
  const [idImageBase64, setIdImageBase64] = useState<string | null>(null); // fallback (dev)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null); // blob / data url
  const [isPdfPreview, setIsPdfPreview] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const account = useActiveAccount();
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Sube un archivo al endpoint server-side /api/kyc/upload
   * Devuelve la URL subida o null si no se pudo subir.
   */
  async function uploadToCloud(file: File): Promise<string | null> {
    try {
      setErrorMsg(null);
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/kyc/upload', {
        method: 'POST',
        body: fd,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        // si el servidor responde con { ok:false } lo registramos
        console.warn('uploadToCloud failed', json);
        return null;
      }

      if (json && json.ok && typeof json.url === 'string') {
        return json.url as string;
      }

      // fallback: si devuelve string directo
      if (typeof json === 'string') return json;

      return null;
    } catch (err) {
      console.error('uploadToCloud error', err);
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email || !idNumber) {
      setErrorMsg('Por favor completa nombre, email y número de documento.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        idType,
        idNumber,
        idImageUrl: idImageBase64 ?? null,
        submittedBy: account?.address ?? null,
      };

      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(json));

      alert('KYC enviado. ID: ' + (json?.data?.id ?? '---'));
      // reset
      setName('');
      setEmail('');
      setIdNumber('');
      clearFile();
    } catch (err) {
      console.error('send kyc err', err);
      setErrorMsg('Error enviando KYC. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  }

  // limpia preview / base64 / input
  function clearFile() {
    if (localPreviewUrl) {
      try {
        URL.revokeObjectURL(localPreviewUrl);
      } catch {
        /* ignore */
      }
    }
    setIdImageBase64(null);
    setLocalPreviewUrl(null);
    setIsPdfPreview(false);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  // file handler con tipado y subida opcional a cloud
  async function handleFile(file?: File) {
    setErrorMsg(null);
    if (!file) {
      clearFile();
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setErrorMsg(
        `El archivo excede el tamaño máximo (${
          MAX_FILE_BYTES / (1024 * 1024)
        }MB).`,
      );
      return;
    }

    // preview blob/url
    try {
      const blobUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(blobUrl);
      setIsPdfPreview(file.type === 'application/pdf');
      setFileName(file.name);
    } catch (err) {
      console.error('preview err', err);
      setLocalPreviewUrl(null);
      setIsPdfPreview(false);
      setFileName(null);
    }

    // base64 fallback para payload si la subida falla
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setIdImageBase64(result);
    };
    reader.onerror = (e) => {
      console.error('file reader error', e);
    };
    reader.readAsDataURL(file);

    // intentar subir a cloud (recomendado server-side)
    setUploading(true);
    try {
      const cloudUrl = await uploadToCloud(file);
      if (cloudUrl) {
        // si recibimos URL, usamos esa en lugar de la base64
        setIdImageBase64(cloudUrl);
      }
    } catch (err) {
      console.error('uploadToCloud err', err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-semibold mb-2">Verificación KYC</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Completa este formulario para verificar tu identidad. En producción las
        imágenes deben subirse a S3/Cloud storage.
      </p>

      {errorMsg && <div className="mb-4 text-sm text-red-600">{errorMsg}</div>}

      <label className="block mb-4">
        <div className="text-sm mb-1">Nombre</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-md border bg-white/90 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700"
        />
      </label>

      <label className="block mb-4">
        <div className="text-sm mb-1">Email</div>
        <input
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-md border bg-white/90 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700"
        />
      </label>

      <div className="flex gap-4 mb-4 items-center">
        <label className="flex items-center gap-2">
          <span className="text-sm">Tipo:</span>
          <select
            value={idType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setIdType(
                e.target.value as
                  | 'passport'
                  | 'id'
                  | 'driving_license'
                  | 'other',
              )
            }
            className="px-3 py-2 rounded-md border bg-white/90 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700"
          >
            <option value="passport">Passport</option>
            <option value="id">ID</option>
            <option value="driving_license">Driving license</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="flex-1">
          <div className="text-sm mb-1">Número</div>
          <input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md border bg-white/90 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700"
          />
        </label>
      </div>

      {/* File input styled */}
      <div className="mb-4">
        <div className="text-sm mb-2">
          Foto del documento / PDF (producción: sube a cloud)
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="kyc-file"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer"
          >
            {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
          </label>

          <div className="text-sm text-zinc-400">
            {fileName ?? 'No hay archivo seleccionado'}
          </div>

          {fileName && (
            <button
              type="button"
              onClick={clearFile}
              className="ml-3 text-sm text-zinc-400 hover:text-zinc-600"
            >
              Quitar
            </button>
          )}
        </div>

        <input
          id="kyc-file"
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleFile(e.target.files?.[0] ?? undefined)
          }
          className="sr-only"
        />

        <p className="text-xs text-zinc-500 mt-2">
          Aceptado: imágenes y PDF. Máx {MAX_FILE_BYTES / (1024 * 1024)}MB.
        </p>

        {/* preview */}
        {localPreviewUrl && !isPdfPreview && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={localPreviewUrl}
              alt="preview"
              className="max-w-xs rounded-md shadow-md border"
            />
          </div>
        )}
        {localPreviewUrl && isPdfPreview && (
          <div className="mt-4">
            <a
              href={localPreviewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-3 py-2 bg-indigo-600 text-white rounded-md"
            >
              Abrir PDF
            </a>
          </div>
        )}
      </div>

      <div>
        <button
          disabled={loading || uploading}
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-60"
        >
          {loading ? 'Enviando...' : uploading ? 'Subiendo...' : 'Enviar KYC'}
        </button>
      </div>
    </form>
  );
}
