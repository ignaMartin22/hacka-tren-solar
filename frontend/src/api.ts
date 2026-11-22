import type { EstadoZona } from '../../backend/src/tipos';

export type { EstadoZona };

export interface RespuestaEstado {
  calculadoEn: string | null;
  datosDe: string | null;
  fuente: string;
  errorUltimaActualizacion: string | null;
  zonas: EstadoZona[];
}

const BASE = import.meta.env.VITE_API_URL ?? '';

export async function obtenerEstado(): Promise<RespuestaEstado> {
  const res = await fetch(`${BASE}/api/estado`);
  if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
  return res.json();
}
