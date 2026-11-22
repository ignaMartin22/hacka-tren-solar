// Endpoints PROPUESTOS: todavía no existen en el backend (ver frontend/contratos/replay.md).
// Mientras no estén, la pantalla se prueba con frontend/src/mocks/replay.ts (demo en /replay-demo.html).
import type { EventoReplay, IndiceReplay } from './tipos';

// false = el backend todavía no sirve /api/replay. Pasarlo a true cuando exista.
export const REPLAY_DISPONIBLE = false;

const BASE = import.meta.env.VITE_API_URL ?? '';

export async function obtenerIndiceReplay(): Promise<IndiceReplay> {
  const res = await fetch(`${BASE}/api/replay`);
  if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
  return res.json();
}

export async function obtenerEventoReplay(id: string): Promise<EventoReplay> {
  const res = await fetch(`${BASE}/api/replay/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
  return res.json();
}
