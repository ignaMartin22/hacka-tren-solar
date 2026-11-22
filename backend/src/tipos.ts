import type { Nivel } from '../../config/riesgo';
import type { Amenaza } from '../../config/zonas';

export interface SerieHoraria {
  // Segundos Unix (UTC) del inicio de cada hora.
  tiempos: number[];
  // mm caídos en la hora previa a cada marca de tiempo.
  lluviaMm: (number | null)[];
  // Humedad del suelo promedio de 0 a 27 cm (pronóstico) o 0 a 28 cm (histórico), en m³/m³.
  suelo: (number | null)[];
}

export interface Lectura {
  zonaId: string;
  fuente: 'open-meteo-forecast' | 'open-meteo-archive';
  // Celda de grilla que realmente respondió Open-Meteo (puede no coincidir con la coordenada pedida).
  celda: { lat: number; lon: number; elevacionM: number | null };
  obtenidaEn: string;
  serie: SerieHoraria;
}

export interface VariablesAludes {
  lluvia24hMm: number;
  lluvia72hMm: number;
  pronostico24hMm: number;
  suelo: number | null;
  pendiente: 'alta' | 'media' | 'baja';
}

export interface Motivo {
  codigo: string;
  texto: string;
}

export interface ResultadoRiesgo {
  nivel: Nivel;
  motivos: Motivo[];
  variables: VariablesAludes;
}

export interface EstadoZona {
  zonaId: string;
  nombre: string;
  region: string;
  amenaza: Amenaza;
  lat: number;
  lon: number;
  // null = todavía no hay nivel calculado para esta zona (ver `aviso`).
  nivel: Nivel | null;
  motivos: Motivo[];
  variables: VariablesAludes | null;
  aviso: string | null;
  celda: Lectura['celda'] | null;
  // Momento en que se bajaron los datos de Open-Meteo.
  datosDe: string | null;
  // Momento en que se calculó el nivel.
  calculadoEn: string | null;
}
