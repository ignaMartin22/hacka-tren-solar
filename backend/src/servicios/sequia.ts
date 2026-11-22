import { UMBRALES_SEQUIA } from '../../../config/riesgo';
import type { Zona } from '../../../config/zonas';
import { acumulado, evaluarSequia, type ResultadoSequia } from '../riesgo/sequia';

const URL_HISTORICO = 'https://archive-api.open-meteo.com/v1/archive';

export interface LluviaDiaria {
  zonaId: string;
  celda: { lat: number; lon: number; elevacionM: number | null };
  fechas: string[];
  lluviaMm: (number | null)[];
}

// Archivo data/sequia/promedios.json, generado con `pnpm sequia`.
export interface PromediosSequia {
  periodo: { desdeAnio: number; hastaAnio: number };
  diasVentana: number;
  zonas: { zonaId: string; celda: LluviaDiaria['celda']; promedio90dMm: Record<string, number> }[];
}

interface RespuestaDiaria {
  latitude: number;
  longitude: number;
  elevation?: number;
  daily: { time: string[]; precipitation_sum: (number | null)[] };
}

// Lluvia diaria del reanálisis (ERA5) para varias zonas en una sola llamada. Los días son en hora local de Jujuy.
export async function consultarLluviaDiaria(zonas: Zona[], desde: string, hasta: string): Promise<LluviaDiaria[]> {
  const query = new URLSearchParams({
    latitude: zonas.map((z) => z.lat).join(','),
    longitude: zonas.map((z) => z.lon).join(','),
    daily: 'precipitation_sum',
    timezone: 'America/Argentina/Jujuy',
    start_date: desde,
    end_date: hasta,
  });
  const res = await fetch(`${URL_HISTORICO}?${query}`, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const cuerpo = (await res.json()) as RespuestaDiaria | RespuestaDiaria[];
  const respuestas = Array.isArray(cuerpo) ? cuerpo : [cuerpo];
  if (respuestas.length !== zonas.length) throw new Error(`Open-Meteo devolvió ${respuestas.length} series para ${zonas.length} zonas`);
  return zonas.map((zona, i) => {
    const r = respuestas[i]!;
    return { zonaId: zona.id, celda: { lat: r.latitude, lon: r.longitude, elevacionM: r.elevation ?? null }, fechas: r.daily.time, lluviaMm: r.daily.precipitation_sum };
  });
}

// Nivel de sequía parado en el último día con dato de la serie. El reanálisis llega con unos días de atraso,
// así que los últimos valores pueden venir vacíos: se descartan.
export function calcularSequia(lluvia: LluviaDiaria, promedios: PromediosSequia): ResultadoSequia {
  const zona = promedios.zonas.find((z) => z.zonaId === lluvia.zonaId);
  if (!zona) throw new Error(`No hay promedios históricos para la zona ${lluvia.zonaId}`);
  const fin = lluvia.lluviaMm.findLastIndex((v) => v !== null);
  const total = acumulado(lluvia.lluviaMm, fin, UMBRALES_SEQUIA.diasVentana);
  const hasta = lluvia.fechas[fin];
  const promedio = hasta === undefined ? undefined : zona.promedio90dMm[hasta.slice(5)];
  if (total === null || hasta === undefined || promedio === undefined) throw new Error('La serie no alcanza para calcular la sequía');
  return evaluarSequia(total, promedio, hasta);
}
