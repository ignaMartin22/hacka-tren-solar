// DATOS DE EJEMPLO, NO REALES.
// Historial de avisos inventado para la demo de la vista institucional:
// GET /api/avisos todavía no existe en el backend (ver frontend/contratos/institucional.md).
// En la interfaz se marca con el texto "Datos de ejemplo".
import type { Aviso } from '../institucional/api';

export const AVISOS_EJEMPLO: Aviso[] = [
  {
    id: 'ejemplo-3',
    creadoEn: '2026-11-22T15:05:00.000Z',
    zonaId: 'maimara',
    zonaNombre: 'Maimará',
    nivel: 'rojo',
    destinatarios: 21,
    estado: 'pendiente-confirmacion',
    mensaje:
      'YAKU · ROJO · Maimará\n' +
      'Lluvia muy fuerte y suelo saturado en la zona. Riesgo alto de aludes en las próximas horas. ' +
      'No cruces ríos ni quebradas. Seguí las indicaciones de Defensa Civil.',
  },
  {
    id: 'ejemplo-2',
    creadoEn: '2026-11-22T13:40:00.000Z',
    zonaId: 'tumbaya',
    zonaNombre: 'Tumbaya',
    nivel: 'naranja',
    destinatarios: 34,
    estado: 'enviado',
    mensaje:
      'YAKU · NARANJA · Tumbaya\n' +
      'Lluvias fuertes y suelo muy húmedo en la zona. Hay riesgo de aludes en las próximas 24 h. ' +
      'Evitá cruzar ríos y quebradas. Seguí las indicaciones de Defensa Civil.',
  },
  {
    id: 'ejemplo-1',
    creadoEn: '2026-11-21T22:10:00.000Z',
    zonaId: 'tilcara',
    zonaNombre: 'Tilcara',
    nivel: 'naranja',
    destinatarios: 28,
    estado: 'enviado',
    mensaje:
      'YAKU · NARANJA · Tilcara\n' +
      'Lluvias fuertes y suelo muy húmedo en la zona. Hay riesgo de aludes en las próximas 24 h. ' +
      'Evitá cruzar ríos y quebradas. Seguí las indicaciones de Defensa Civil.',
  },
];
