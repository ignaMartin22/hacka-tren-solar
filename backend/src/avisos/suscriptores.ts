import { almacen, persistir } from '../servicios/almacen';

export const zonasDe = (chatId: number): string[] => almacen.suscriptores.filter((s) => s.chatId === chatId).map((s) => s.zonaId);

// Devuelve false si ese chat ya estaba suscripto a la zona.
export async function suscribir(chatId: number, zonaId: string): Promise<boolean> {
  if (zonasDe(chatId).includes(zonaId)) return false;
  almacen.suscriptores.push({ chatId, zonaId, creadoEn: new Date().toISOString() });
  await persistir('suscriptores');
  return true;
}

// Quita todas las suscripciones del chat. Devuelve cuántas tenía.
export async function darDeBaja(chatId: number): Promise<number> {
  const antes = almacen.suscriptores.length;
  almacen.suscriptores = almacen.suscriptores.filter((s) => s.chatId !== chatId);
  await persistir('suscriptores');
  return antes - almacen.suscriptores.length;
}

export const cantidadPorZona = (): Record<string, number> =>
  almacen.suscriptores.reduce<Record<string, number>>((acc, s) => ({ ...acc, [s.zonaId]: (acc[s.zonaId] ?? 0) + 1 }), {});
