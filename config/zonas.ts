// Zonas vigiladas por Yaku. Agregar una zona = agregar una entrada acá; no hay que tocar la lógica.
//
// Coordenadas: contrastadas el 22/11/2026 con el geocodificador de Open-Meteo (GeoNames),
// salvo Volcán, que no se pudo verificar y queda con el valor aproximado de CONTEXT.md.
// Pendiente (alta/media/baja): estimación inicial cargada a mano, SIN validar con un modelo de elevación.

export type Amenaza = 'aludes' | 'sequia';
export type Pendiente = 'alta' | 'media' | 'baja';

export interface Zona {
  id: string;
  nombre: string;
  region: 'Quebrada' | 'Puna';
  amenaza: Amenaza;
  lat: number;
  lon: number;
  pendiente: Pendiente;
  coordenadasVerificadas: boolean;
}

export const ZONAS: Zona[] = [
  { id: 'volcan', nombre: 'Volcán', region: 'Quebrada', amenaza: 'aludes', lat: -23.92, lon: -65.47, pendiente: 'alta', coordenadasVerificadas: false },
  { id: 'tumbaya', nombre: 'Tumbaya', region: 'Quebrada', amenaza: 'aludes', lat: -23.858, lon: -65.467, pendiente: 'alta', coordenadasVerificadas: true },
  { id: 'purmamarca', nombre: 'Purmamarca', region: 'Quebrada', amenaza: 'aludes', lat: -23.746, lon: -65.5, pendiente: 'alta', coordenadasVerificadas: true },
  { id: 'maimara', nombre: 'Maimará', region: 'Quebrada', amenaza: 'aludes', lat: -23.625, lon: -65.409, pendiente: 'media', coordenadasVerificadas: true },
  { id: 'tilcara', nombre: 'Tilcara', region: 'Quebrada', amenaza: 'aludes', lat: -23.578, lon: -65.395, pendiente: 'media', coordenadasVerificadas: true },
  { id: 'humahuaca', nombre: 'Humahuaca', region: 'Quebrada', amenaza: 'aludes', lat: -23.206, lon: -65.347, pendiente: 'media', coordenadasVerificadas: true },
  { id: 'abra-pampa', nombre: 'Abra Pampa', region: 'Puna', amenaza: 'sequia', lat: -22.723, lon: -65.697, pendiente: 'baja', coordenadasVerificadas: true },
  { id: 'susques', nombre: 'Susques', region: 'Puna', amenaza: 'sequia', lat: -23.399, lon: -66.368, pendiente: 'baja', coordenadasVerificadas: true },
];
