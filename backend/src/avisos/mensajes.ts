import type { Nivel } from '../../../config/riesgo';
import type { Aviso } from '../tipos';

// Mensajes cortos: qué pasa, dónde y qué hacer. Yaku da una alerta de riesgo, no una predicción.
const CUERPO: Record<Nivel, string> = {
  verde: 'Fin de la alerta. El riesgo de aludes en la zona volvió al nivel más bajo. Seguí atento a los avisos.',
  amarillo: 'Lluvia o suelo húmedo por encima de lo habitual en la zona. Situación a vigilar. No se envía aviso a los vecinos.',
  naranja:
    'Lluvias fuertes y suelo muy húmedo en la zona. Hay riesgo de aludes en las próximas 24 h. Evitá cruzar ríos y quebradas. Seguí las indicaciones de Defensa Civil.',
  rojo: 'Riesgo alto de aludes en la zona. Alejate de ríos y quebradas y buscá un lugar alto y seguro. Seguí las indicaciones de Defensa Civil.',
};

export function textoAviso(tipo: Aviso['tipo'], nivel: Nivel, zonaNombre: string, simulacro: boolean): string {
  const titulo = tipo === 'fin_alerta' ? `YAKU · FIN DE ALERTA · ${zonaNombre}` : `YAKU · ${nivel.toUpperCase()} · ${zonaNombre}`;
  const cuerpo = CUERPO[tipo === 'fin_alerta' ? 'verde' : nivel];
  return [...(simulacro ? ['SIMULACRO: esto es una prueba, no una alerta real.'] : []), titulo, cuerpo].join('\n');
}
