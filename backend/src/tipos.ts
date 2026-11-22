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

export interface TendenciaDia {
  // Fecha local de Jujuy, AAAA-MM-DD.
  fecha: string;
  // Nivel más alto que alcanzó ese día.
  nivel: Nivel;
  lluviaMm: number;
  // Humedad del suelo promedio del día, en m³/m³. null si no hay datos.
  sueloMedio: number | null;
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
  // Números detrás del nivel en zonas de aludes; null en las de sequía.
  variables: VariablesAludes | null;
  // Números detrás del nivel en zonas de sequía; null en las de aludes.
  sequia: VariablesSequia | null;
  aviso: string | null;
  // Últimos 7 días (el último es hoy). Vacío si no hay nivel.
  tendencia: TendenciaDia[];
  celda: Lectura['celda'] | null;
  // Momento en que se bajaron los datos de Open-Meteo.
  datosDe: string | null;
  // Momento en que se calculó el nivel.
  calculadoEn: string | null;
}

export interface Suscriptor {
  // Chat de Telegram que recibe los avisos.
  chatId: number;
  zonaId: string;
  creadoEn: string;
}

// Qué pasó con el aviso a los vecinos suscriptos:
// - no_corresponde: ese nivel no se envía a vecinos (amarillo) o no había alerta previa que cerrar.
// - pendiente_confirmacion: rojo a la espera de que una persona responsable lo confirme.
// - enviado: salió por Telegram a `destinatarios` personas.
// - vencido: el nivel bajó antes de que alguien confirmara.
// - sin_canal: correspondía enviarlo pero el bot de Telegram no está configurado.
export type EnvioVecinos = 'no_corresponde' | 'pendiente_confirmacion' | 'enviado' | 'vencido' | 'sin_canal';

export interface Aviso {
  id: string;
  zonaId: string;
  zonaNombre: string;
  tipo: 'alerta' | 'fin_alerta';
  nivel: Nivel;
  // true si lo generó una persona desde el panel para probar, no el motor de riesgo.
  simulacro: boolean;
  texto: string;
  motivos: Motivo[];
  creadoEn: string;
  envioVecinos: EnvioVecinos;
  enviadoEn: string | null;
  // Personas a las que se les entregó el mensaje.
  destinatarios: number;
}

export interface VariablesSequia {
  // Ventana de 90 días evaluada (fechas locales). Termina en el último día publicado por el reanálisis.
  desde: string;
  hasta: string;
  lluvia90dMm: number;
  // Promedio 1991-2020 de la lluvia en esos mismos 90 días del año.
  promedio90dMm: number;
  // lluvia90dMm / promedio90dMm. null en época seca, cuando el promedio es demasiado bajo para comparar.
  cociente: number | null;
}

export interface ResultadoSequia {
  nivel: Nivel | null;
  motivos: Motivo[];
  aviso: string | null;
  variables: VariablesSequia;
  obtenidaEn: string;
}
