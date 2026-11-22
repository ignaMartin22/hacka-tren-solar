import { NIVELES, type Nivel } from '../../../config/riesgo';
import type { Pendiente } from '../../../config/zonas';
import type { Motivo, SerieHoraria, VariablesAludes } from '../tipos';
import { calcularAludes } from './aludes';

const HORA = 3600;
// Jujuy no tiene horario de verano: siempre UTC-3.
const DESFASE_LOCAL = -3 * HORA;

export interface PasoReplay {
  // Instante del paso (UTC) y su fecha y hora en Jujuy.
  t: string;
  fechaLocal: string;
  horaLocal: number;
  // Nivel con la lluvia de las 24 h siguientes ya conocida (hace de pronóstico perfecto).
  nivel: Nivel;
  // Nivel usando solo lo que ya había llovido hasta ese instante.
  nivelSoloObservado: Nivel;
  motivos: Motivo[];
  variables: VariablesAludes;
}

export interface DiaReplay {
  fechaLocal: string;
  lluviaMm: number;
  nivelMaximo: Nivel;
  nivelMaximoSoloObservado: Nivel;
}

const maximo = (niveles: Nivel[]): Nivel => NIVELES[Math.max(...niveles.map((n) => NIVELES.indexOf(n)))]!;

const aUnix = (fechaLocal: string, horaLocal: number) => Date.parse(`${fechaLocal}T00:00:00Z`) / 1000 + horaLocal * HORA - DESFASE_LOCAL;

const fechaLocalDe = (t: number) => new Date((t + DESFASE_LOCAL) * 1000).toISOString().slice(0, 10);

export function sumarDias(fecha: string, dias: number): string {
  return new Date(Date.parse(`${fecha}T00:00:00Z`) + dias * 86_400_000).toISOString().slice(0, 10);
}

// Corre el motor de aludes cada `cadaHoras` entre las 00:00 de `desde` y las 23:59 de `hasta` (hora de Jujuy).
// La serie tiene que cubrir 72 h antes del primer paso y 24 h después del último.
export function generarPasos(serie: SerieHoraria, pendiente: Pendiente, desde: string, hasta: string, cadaHoras: number): PasoReplay[] {
  const pasos: PasoReplay[] = [];
  for (let t = aUnix(desde, 0); t < aUnix(hasta, 24); t += cadaHoras * HORA) {
    const ahora = new Date(t * 1000);
    const { nivel, motivos, variables } = calcularAludes(serie, ahora, pendiente);
    const soloObservado = { ...serie, lluviaMm: serie.lluviaMm.map((mm, i) => (serie.tiempos[i]! > t ? 0 : mm)) };
    pasos.push({
      t: ahora.toISOString(),
      fechaLocal: fechaLocalDe(t),
      horaLocal: ((t + DESFASE_LOCAL) % 86_400) / HORA,
      nivel,
      nivelSoloObservado: calcularAludes(soloObservado, ahora, pendiente).nivel,
      motivos,
      variables,
    });
  }
  return pasos;
}

// Resumen por día local: lluvia caída ese día y el nivel más alto que marcó el semáforo.
export function resumirDias(serie: SerieHoraria, pasos: PasoReplay[]): DiaReplay[] {
  const fechas = [...new Set(pasos.map((p) => p.fechaLocal))];
  return fechas.map((fechaLocal) => {
    const delDia = pasos.filter((p) => p.fechaLocal === fechaLocal);
    // Cada valor de lluvia corresponde a la hora previa a su marca de tiempo.
    const lluvia = serie.tiempos.reduce((total, t, i) => (fechaLocalDe(t - 1) === fechaLocal ? total + (serie.lluviaMm[i] ?? 0) : total), 0);
    return {
      fechaLocal,
      lluviaMm: Number(lluvia.toFixed(1)),
      nivelMaximo: maximo(delDia.map((p) => p.nivel)),
      nivelMaximoSoloObservado: maximo(delDia.map((p) => p.nivelSoloObservado)),
    };
  });
}

// Horas entre el primer paso con el nivel pedido (o más alto) y el instante del evento. null si nunca lo alcanzó antes.
export function horasDeAnticipacion(pasos: PasoReplay[], campo: 'nivel' | 'nivelSoloObservado', desdeNivel: Nivel, fechaEvento: string, horaEvento: number): number | null {
  const tEvento = aUnix(fechaEvento, horaEvento);
  const primero = pasos.find((p) => NIVELES.indexOf(p[campo]) >= NIVELES.indexOf(desdeNivel));
  if (!primero) return null;
  const horas = (tEvento - Date.parse(primero.t) / 1000) / HORA;
  return horas >= 0 ? horas : null;
}
