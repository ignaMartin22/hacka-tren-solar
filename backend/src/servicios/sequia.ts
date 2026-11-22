import { readFile } from 'node:fs/promises';
import { UMBRALES_SEQUIA } from '../../../config/riesgo';
import { ZONAS } from '../../../config/zonas';
import { fechaLocal } from '../hora';
import { evaluarSequia, promedioHistorico } from '../riesgo/sequia';
import { almacen, persistir } from './almacen';
import { consultarLluviaDiaria } from './openMeteo';

const DIA_MS = 86_400_000;
// El reanálisis llega con demora: se piden días de más para completar la ventana.
const DIAS_DE_MARGEN = 15;

interface Climatologia {
  zonas: Record<string, { promedioDiarioMm: Record<string, number> }>;
}

// Recalcula el indicador de sequía de las zonas de la Puna. Devuelve el error, si lo hubo.
export async function actualizarSequia(ahora = new Date()): Promise<string | null> {
  try {
    const climatologia = JSON.parse(await readFile(new URL('../../../data/sequia/climatologia.json', import.meta.url), 'utf8')) as Climatologia;
    const zonas = ZONAS.filter((z) => z.amenaza === 'sequia');
    const hasta = fechaLocal(ahora.getTime() / 1000);
    const desde = new Date(Date.parse(hasta) - (UMBRALES_SEQUIA.diasVentana + DIAS_DE_MARGEN) * DIA_MS).toISOString().slice(0, 10);
    const series = await consultarLluviaDiaria(zonas, desde, hasta);
    const obtenidaEn = new Date().toISOString();
    for (const serie of series) {
      const promedios = climatologia.zonas[serie.zonaId]?.promedioDiarioMm;
      // Últimos 90 días que el reanálisis ya publicó.
      const dias = serie.fechas.map((fecha, i) => ({ fecha, mm: serie.lluviaMm[i] ?? null })).filter((d) => d.mm !== null).slice(-UMBRALES_SEQUIA.diasVentana);
      if (!promedios || dias.length < UMBRALES_SEQUIA.diasVentana) throw new Error(`Faltan datos de sequía para ${serie.zonaId}`);
      const lluvia = dias.reduce((total, d) => total + d.mm!, 0);
      const fechas = dias.map((d) => d.fecha);
      almacen.sequia[serie.zonaId] = { ...evaluarSequia(lluvia, promedioHistorico(promedios, fechas), fechas[0]!, fechas.at(-1)!), obtenidaEn };
    }
    await persistir('sequia');
    return null;
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error('No se pudo actualizar la sequía:', error);
    return error;
  }
}

// La sequía se mira una vez por semana: solo se vuelve a pedir si lo guardado tiene más de 7 días.
export async function actualizarSequiaSiHaceFalta(): Promise<void> {
  const guardadas = Object.values(almacen.sequia);
  const reciente = guardadas.length > 0 && guardadas.every((s) => Date.now() - Date.parse(s.obtenidaEn) < 7 * DIA_MS);
  if (!reciente) await actualizarSequia();
}
