import { AVISOS, NIVELES, type Nivel } from '../../../config/riesgo';
import type { Aviso } from '../tipos';

export interface Decision {
  tipo: Aviso['tipo'];
  nivel: Nivel;
  envioVecinos: 'no_corresponde' | 'pendiente_confirmacion' | 'enviar';
}

// Qué hacer con los vecinos según el nivel (CONTEXT.md, sección 8).
export const envioSegunNivel = (nivel: Nivel): Decision['envioVecinos'] =>
  nivel === 'rojo' ? 'pendiente_confirmacion' : nivel === 'naranja' ? 'enviar' : 'no_corresponde';

// Decide si un cambio de nivel en una zona genera un aviso. `avisosZona` es el historial de esa zona.
// Solo se avisa cuando el nivel sube, y cuando vuelve a verde (fin de alerta).
export function decidirAviso(previo: Nivel, actual: Nivel, avisosZona: Aviso[], ahora: Date): Decision | null {
  const reales = avisosZona.filter((a) => !a.simulacro);
  if (NIVELES.indexOf(actual) > NIVELES.indexOf(previo)) {
    const desde = ahora.getTime() - AVISOS.horasEntreAvisosDelMismoNivel * 3600 * 1000;
    const repetido = reales.some((a) => a.tipo === 'alerta' && a.nivel === actual && Date.parse(a.creadoEn) > desde);
    return repetido ? null : { tipo: 'alerta', nivel: actual, envioVecinos: envioSegunNivel(actual) };
  }
  if (actual === 'verde' && previo !== 'verde') {
    // A los vecinos solo se les avisa el fin si antes recibieron una alerta de este episodio.
    const ultimoFin = Math.max(0, ...reales.filter((a) => a.tipo === 'fin_alerta').map((a) => Date.parse(a.creadoEn)));
    const vecinosAvisados = reales.some((a) => a.tipo === 'alerta' && a.envioVecinos === 'enviado' && Date.parse(a.creadoEn) > ultimoFin);
    return { tipo: 'fin_alerta', nivel: 'verde', envioVecinos: vecinosAvisados ? 'enviar' : 'no_corresponde' };
  }
  return null;
}
