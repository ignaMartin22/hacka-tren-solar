// Llamadas de la vista institucional. Los endpoints todavía no existen en el
// backend: los contratos propuestos están en frontend/contratos/institucional.md.
// Mientras INSTITUCIONAL_DISPONIBLE sea false, todo funciona con datos de ejemplo.
import type { Nivel } from '../../../config/riesgo';
import { AVISOS_EJEMPLO } from '../mocks/institucional';

export const INSTITUCIONAL_DISPONIBLE = false;

export type EstadoAviso = 'enviado' | 'pendiente-confirmacion';

export interface Aviso {
  id: string;
  creadoEn: string;
  zonaId: string;
  zonaNombre: string;
  nivel: Nivel;
  // A cuántas personas llegó (o llegaría) el aviso.
  destinatarios: number;
  estado: EstadoAviso;
  // Texto exacto del mensaje que se envía por Telegram.
  mensaje: string;
}

const BASE = import.meta.env.VITE_API_URL ?? '';
const CLAVE_SESION = 'yaku-institucional-token';

// sessionStorage puede lanzar en modo privado: por eso el try/catch.
export function leerToken(): string | null {
  try {
    return sessionStorage.getItem(CLAVE_SESION);
  } catch {
    return null;
  }
}

export function guardarToken(token: string) {
  try {
    sessionStorage.setItem(CLAVE_SESION, token);
  } catch {
    // Sin almacenamiento: la sesión dura hasta recargar la página.
  }
}

export function borrarToken() {
  try {
    sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // Mismo caso que guardarToken.
  }
}

// Contrato propuesto: POST /api/login { clave } -> { token }.
// En modo ejemplo acepta cualquier clave y devuelve un token de mentira.
export async function entrar(clave: string): Promise<{ token: string }> {
  if (!INSTITUCIONAL_DISPONIBLE) {
    void clave;
    return { token: 'token-de-ejemplo' };
  }
  const res = await fetch(`${BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clave }),
  });
  if (!res.ok) throw new Error(res.status === 401 ? 'Clave incorrecta' : `El servidor respondió ${res.status}`);
  return res.json();
}

// Contrato propuesto: GET /api/avisos (con Authorization: Bearer <token>).
export async function obtenerAvisos(): Promise<Aviso[]> {
  if (!INSTITUCIONAL_DISPONIBLE) {
    return AVISOS_EJEMPLO;
  }
  const res = await fetch(`${BASE}/api/avisos`, {
    headers: { Authorization: `Bearer ${leerToken() ?? ''}` },
  });
  if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
  const datos = await res.json();
  return datos.avisos;
}

// Contrato propuesto: POST /api/avisos/:id/confirmar (con Authorization: Bearer <token>).
export async function confirmarAviso(id: string): Promise<Aviso> {
  const res = await fetch(`${BASE}/api/avisos/${id}/confirmar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${leerToken() ?? ''}` },
  });
  if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
  const datos = await res.json();
  return datos.aviso;
}
