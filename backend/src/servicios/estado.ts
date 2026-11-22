import { ZONAS, type Zona } from '../../../config/zonas';
import { calcularAludes } from '../riesgo/aludes';
import { calcularTendencia } from '../riesgo/tendencia';
import type { EstadoZona, Lectura } from '../tipos';
import { guardarLecturas, obtenerLecturas } from './almacen';
import { consultarPronostico } from './openMeteo';

let estados: EstadoZona[] = [];
let calculadoEn: string | null = null;
let ultimoError: string | null = null;

function estadoDeZona(zona: Zona, lectura: Lectura | undefined, ahora: Date): EstadoZona {
  const estado: EstadoZona = {
    zonaId: zona.id,
    nombre: zona.nombre,
    region: zona.region,
    amenaza: zona.amenaza,
    lat: zona.lat,
    lon: zona.lon,
    nivel: null,
    motivos: [],
    variables: null,
    aviso: null,
    tendencia: [],
    celda: lectura?.celda ?? null,
    datosDe: lectura?.obtenidaEn ?? null,
    calculadoEn: ahora.toISOString(),
  };
  if (zona.amenaza === 'sequia') return { ...estado, aviso: 'El indicador de sequía todavía no está disponible.' };
  if (!lectura) return { ...estado, aviso: 'Todavía no hay datos para esta zona.' };
  try {
    const { nivel, motivos, variables } = calcularAludes(lectura.serie, ahora, zona.pendiente);
    return { ...estado, nivel, motivos, variables, tendencia: calcularTendencia(lectura.serie, ahora, zona.pendiente) };
  } catch {
    return { ...estado, aviso: 'Los datos guardados están desactualizados y no alcanzan para calcular el nivel.' };
  }
}

// Recalcula el semáforo de todas las zonas con las lecturas que haya en el almacén.
export function recalcular(ahora = new Date()): EstadoZona[] {
  const lecturas = new Map(obtenerLecturas().map((l) => [l.zonaId, l]));
  estados = ZONAS.map((zona) => estadoDeZona(zona, lecturas.get(zona.id), ahora));
  calculadoEn = ahora.toISOString();
  return estados;
}

// Baja los datos de Open-Meteo para todas las zonas, los guarda y recalcula.
// Si Open-Meteo falla, se sigue con las últimas lecturas guardadas y queda registrado el error.
export async function actualizar(): Promise<{ ok: boolean; error: string | null }> {
  try {
    await guardarLecturas(await consultarPronostico(ZONAS));
    ultimoError = null;
  } catch (e) {
    ultimoError = e instanceof Error ? e.message : String(e);
    console.error('No se pudo actualizar desde Open-Meteo:', ultimoError);
  }
  recalcular();
  return { ok: ultimoError === null, error: ultimoError };
}

export const obtenerEstados = () => ({
  calculadoEn,
  datosDe: estados.find((e) => e.datosDe)?.datosDe ?? null,
  fuente: 'Open-Meteo (datos satelitales y de modelos meteorológicos)',
  errorUltimaActualizacion: ultimoError,
  zonas: estados,
});
