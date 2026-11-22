import { ACTUALIZACION } from '../../../config/riesgo';
import type { Zona } from '../../../config/zonas';
import type { Lectura, SerieHoraria } from '../tipos';

const URL_PRONOSTICO = 'https://api.open-meteo.com/v1/forecast';
const URL_HISTORICO = 'https://archive-api.open-meteo.com/v1/archive';

// Nombres de variables comprobados contra la API el 22/11/2026 (son distintos entre pronóstico e histórico).
// Cada capa lleva su espesor en cm para promediar ponderado.
const CAPAS_SUELO_PRONOSTICO = [
  ['soil_moisture_0_to_1cm', 1],
  ['soil_moisture_1_to_3cm', 2],
  ['soil_moisture_3_to_9cm', 6],
  ['soil_moisture_9_to_27cm', 18],
] as const;
const CAPAS_SUELO_HISTORICO = [
  ['soil_moisture_0_to_7cm', 7],
  ['soil_moisture_7_to_28cm', 21],
] as const;

type Capas = readonly (readonly [string, number])[];

interface RespuestaOpenMeteo {
  latitude: number;
  longitude: number;
  elevation?: number;
  hourly: { time: number[] } & Record<string, (number | null)[]>;
}

function promedioSuelo(hourly: RespuestaOpenMeteo['hourly'], capas: Capas, i: number): number | null {
  let suma = 0;
  let espesor = 0;
  for (const [nombre, cm] of capas) {
    const v = hourly[nombre]?.[i];
    if (v === null || v === undefined) continue;
    suma += v * cm;
    espesor += cm;
  }
  return espesor > 0 ? suma / espesor : null;
}

function aSerie(hourly: RespuestaOpenMeteo['hourly'], capas: Capas): SerieHoraria {
  return {
    tiempos: hourly.time,
    lluviaMm: hourly.precipitation ?? [],
    suelo: hourly.time.map((_, i) => promedioSuelo(hourly, capas, i)),
  };
}

async function pedir(url: string, params: Record<string, string>, zonas: Zona[], capas: Capas, fuente: Lectura['fuente']): Promise<Lectura[]> {
  const query = new URLSearchParams({
    latitude: zonas.map((z) => z.lat).join(','),
    longitude: zonas.map((z) => z.lon).join(','),
    hourly: ['precipitation', ...capas.map(([nombre]) => nombre)].join(','),
    timeformat: 'unixtime',
    timezone: 'GMT',
    ...params,
  });
  const res = await fetch(`${url}?${query}`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const cuerpo = (await res.json()) as RespuestaOpenMeteo | RespuestaOpenMeteo[];
  // Con una sola coordenada Open-Meteo devuelve un objeto; con varias, un arreglo en el mismo orden.
  const respuestas = Array.isArray(cuerpo) ? cuerpo : [cuerpo];
  if (respuestas.length !== zonas.length) throw new Error(`Open-Meteo devolvió ${respuestas.length} series para ${zonas.length} zonas`);
  const obtenidaEn = new Date().toISOString();
  return zonas.map((zona, i) => {
    const r = respuestas[i]!;
    return {
      zonaId: zona.id,
      fuente,
      celda: { lat: r.latitude, lon: r.longitude, elevacionM: r.elevation ?? null },
      obtenidaEn,
      serie: aSerie(r.hourly, capas),
    };
  });
}

// Lluvia y humedad del suelo de todas las zonas en una sola llamada: últimos días + pronóstico.
export function consultarPronostico(zonas: Zona[]): Promise<Lectura[]> {
  return pedir(
    URL_PRONOSTICO,
    { past_days: String(ACTUALIZACION.diasPasados), forecast_days: String(ACTUALIZACION.diasPronostico) },
    zonas,
    CAPAS_SUELO_PRONOSTICO,
    'open-meteo-forecast',
  );
}

// Reanálisis histórico (para el Modo Replay). Fechas en formato AAAA-MM-DD.
export function consultarHistorico(zonas: Zona[], desde: string, hasta: string): Promise<Lectura[]> {
  return pedir(URL_HISTORICO, { start_date: desde, end_date: hasta }, zonas, CAPAS_SUELO_HISTORICO, 'open-meteo-archive');
}
