import { UMBRALES_SEQUIA, type Nivel } from '../../../config/riesgo';
import type { Motivo } from '../tipos';

export interface VariablesSequia {
  // Lluvia acumulada en los últimos 90 días, en mm.
  lluvia90dMm: number;
  // Promedio 1991-2020 de la lluvia acumulada en los mismos 90 días del año, en mm.
  promedio90dMm: number;
  // lluvia90dMm / promedio90dMm. null en época seca (el promedio es demasiado bajo para comparar).
  cociente: number | null;
  // Último día incluido en la ventana (AAAA-MM-DD).
  hasta: string;
}

export interface ResultadoSequia {
  // null = época seca, sin dato.
  nivel: Nivel | null;
  motivos: Motivo[];
  variables: VariablesSequia;
}

const num = (n: number, decimales = 0) => n.toFixed(decimales).replace('.', ',');

// Aplica las reglas de CONTEXT.md (sección 6): cociente entre la lluvia de 90 días y su promedio histórico.
export function evaluarSequia(lluvia90dMm: number, promedio90dMm: number, hasta: string): ResultadoSequia {
  const u = UMBRALES_SEQUIA;
  const base = { lluvia90dMm: Number(lluvia90dMm.toFixed(1)), promedio90dMm: Number(promedio90dMm.toFixed(1)), hasta };

  if (promedio90dMm < u.promedioMinimoMm)
    return {
      nivel: null,
      motivos: [
        {
          codigo: 'epoca_seca',
          texto: `Época seca, sin dato: en estos ${u.diasVentana} días normalmente llueven solo ${num(promedio90dMm)} mm, muy poco para comparar (mínimo: ${u.promedioMinimoMm} mm).`,
        },
      ],
      variables: { ...base, cociente: null },
    };

  const cociente = lluvia90dMm / promedio90dMm;
  const nivel: Nivel = cociente >= u.verdeDesde ? 'verde' : cociente >= u.amarilloDesde ? 'amarillo' : cociente >= u.naranjaDesde ? 'naranja' : 'rojo';
  const porcentaje = num(cociente * 100);
  const comparacion = `Llovieron ${num(lluvia90dMm)} mm en los últimos ${u.diasVentana} días; lo normal para esta época son ${num(promedio90dMm)} mm (promedio 1991-2020).`;
  const texto =
    nivel === 'verde'
      ? `${comparacion} Es el ${porcentaje} % de lo normal: sin señal de sequía.`
      : `${comparacion} Es solo el ${porcentaje} % de lo normal.`;
  return { nivel, motivos: [{ codigo: 'lluvia_90d', texto }], variables: { ...base, cociente: Number(cociente.toFixed(2)) } };
}

// Suma de los `dias` valores diarios que terminan en la posición `fin` (inclusive). null si la ventana no entra en la serie.
export function acumulado(lluviaDiariaMm: (number | null)[], fin: number, dias: number): number | null {
  if (fin - dias + 1 < 0 || fin >= lluviaDiariaMm.length) return null;
  let total = 0;
  for (let i = fin - dias + 1; i <= fin; i++) total += lluviaDiariaMm[i] ?? 0;
  return total;
}

// Promedio, por día del año (MM-DD), de la lluvia acumulada en los `dias` días que terminan en esa fecha,
// tomando solo los años entre `desdeAnio` y `hastaAnio`.
export function promediosPorDia(fechas: string[], lluviaDiariaMm: (number | null)[], dias: number, desdeAnio: number, hastaAnio: number): Record<string, number> {
  const sumas = new Map<string, { total: number; n: number }>();
  fechas.forEach((fecha, i) => {
    const anio = Number(fecha.slice(0, 4));
    if (anio < desdeAnio || anio > hastaAnio) return;
    const valor = acumulado(lluviaDiariaMm, i, dias);
    if (valor === null) return;
    const s = sumas.get(fecha.slice(5)) ?? { total: 0, n: 0 };
    s.total += valor;
    s.n += 1;
    sumas.set(fecha.slice(5), s);
  });
  return Object.fromEntries([...sumas].sort(([a], [b]) => a.localeCompare(b)).map(([dia, s]) => [dia, Number((s.total / s.n).toFixed(1))]));
}
