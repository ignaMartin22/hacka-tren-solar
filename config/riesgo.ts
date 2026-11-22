// Único lugar donde viven los umbrales del motor de riesgo.
// Son valores INICIALES (CONTEXT.md, sección 6): no están validados científicamente.

export type Nivel = 'verde' | 'amarillo' | 'naranja' | 'rojo';

export const NIVELES: Nivel[] = ['verde', 'amarillo', 'naranja', 'rojo'];

export const UMBRALES_ALUDES = {
  rojo: { lluvia24hMm: 45, suelo: 0.35, lluvia72hMm: 90 },
  naranja: { lluvia24hMm: 25, suelo: 0.3, pendientes: ['media', 'alta'] as const },
  amarillo: { lluvia24hMm: 15, suelo: 0.3, pronostico24hMm: 5 },
};

// Cociente entre la lluvia de los últimos 90 días y el promedio histórico del mismo período.
// El motor de sequía todavía no está implementado.
export const UMBRALES_SEQUIA = {
  verdeDesde: 0.8,
  amarilloDesde: 0.6,
  naranjaDesde: 0.4,
  diasVentana: 90,
  promedioMinimoMm: 20,
};

export const ACTUALIZACION = {
  aludesCadaHoras: 3,
  // 7 días de tendencia más 3 para que el primero tenga sus 72 horas previas.
  diasPasados: 10,
  diasPronostico: 3,
};
