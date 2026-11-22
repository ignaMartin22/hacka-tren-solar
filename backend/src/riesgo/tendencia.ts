import { NIVELES } from '../../../config/riesgo';
import type { Pendiente } from '../../../config/zonas';
import { fechaLocal, horaLocal } from '../hora';
import type { ResultadoRiesgo, SerieHoraria, TendenciaDia } from '../tipos';
import { evaluarAludes, indiceDe, variablesEnIndice, type OpcionesVariables } from './aludes';

// Nivel más alto de cada uno de los últimos días (el último es hoy, hasta la hora actual) y lluvia del día.
// Para los días pasados el motor se vuelve a correr hora por hora con los datos que hay ahora:
// lo que en su momento era pronóstico se reemplaza por lo que el modelo registró después.
export function calcularTendencia(serie: SerieHoraria, ahora: Date, pendiente: Pendiente, dias = 7): TendenciaDia[] {
  const iAhora = indiceDe(serie, ahora);
  const porDia = new Map<string, TendenciaDia>();
  for (let i = 0; i <= iAhora && serie.tiempos.length - 1 - i >= 24; i++) {
    // La hora que termina en la marca i pertenece al día en que empezó.
    const fecha = fechaLocal(serie.tiempos[i]! - 3600);
    const dia = porDia.get(fecha) ?? { fecha, nivel: 'verde', lluviaMm: 0 };
    const nivel = evaluarAludes(variablesEnIndice(serie, i, pendiente)).nivel;
    if (NIVELES.indexOf(nivel) > NIVELES.indexOf(dia.nivel)) dia.nivel = nivel;
    dia.lluviaMm += serie.lluviaMm[i] ?? 0;
    porDia.set(fecha, dia);
  }
  return [...porDia.values()].slice(-dias).map((d) => ({ ...d, lluviaMm: Number(d.lluviaMm.toFixed(1)) }));
}

// Resumen de un día local completo: lluvia del día y la evaluación más alta del motor entre todas sus horas.
// Devuelve null si la serie no cubre ese día.
export function resumenDelDia(serie: SerieHoraria, fecha: string, pendiente: Pendiente, opciones: OpcionesVariables = {}) {
  let mejor: ResultadoRiesgo | null = null;
  let lluviaMm = 0;
  // Hora local en que el día llegó por primera vez a su nivel más alto (24:00 = al cierre del día).
  let desdeHora = '';
  serie.tiempos.forEach((t, i) => {
    if (fechaLocal(t - 3600) !== fecha) return;
    lluviaMm += serie.lluviaMm[i] ?? 0;
    const r = evaluarAludes(variablesEnIndice(serie, i, pendiente, opciones));
    const sube = !mejor || NIVELES.indexOf(r.nivel) > NIVELES.indexOf(mejor.nivel);
    if (sube) desdeHora = horaLocal(t) === '00:00' ? '24:00' : horaLocal(t);
    if (sube || (r.nivel === mejor!.nivel && r.variables.lluvia24hMm > mejor!.variables.lluvia24hMm)) mejor = r;
  });
  return mejor ? { ...(mejor as ResultadoRiesgo), lluviaMm: Number(lluviaMm.toFixed(1)), desdeHora } : null;
}
