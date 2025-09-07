// src/types/fontkit.d.ts
declare module 'fontkit' {
  // interfaz mínima del objeto fontkit que necesitamos (evita usar `any`)
  export interface Fontkit {
    // fontkit exporta funciones y propiedades; aquí dejamos un índice genérico
    openSync?: (...args: unknown[]) => unknown;
    open?: (...args: unknown[]) => unknown;
    [k: string]: unknown;
  }
  const fontkit: Fontkit & ((...args: unknown[]) => unknown);
  export default fontkit;
}
