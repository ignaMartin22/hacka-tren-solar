import type { TendenciaZona } from './tipos';

const BASE = import.meta.env.VITE_API_URL ?? '';

// El backend todavía no expone este endpoint (propuesto en contratos/tendencia.md).
// Mientras sea false, la interfaz usa tendenciaDeEjemplo() y lo marca como "Datos de ejemplo".
export const TENDENCIA_DISPONIBLE = true;

export async function obtenerTendencia(zonaId: string): Promise<TendenciaZona> {
  const res = await fetch(`${BASE}/api/estado/${encodeURIComponent(zonaId)}/tendencia`);
  if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
  return res.json();
}
