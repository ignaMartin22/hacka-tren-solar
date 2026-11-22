import L from 'leaflet';

/** Capas satelitales reales de NASA GIBS (WMTS, EPSG:3857, producto "best").
 *  Identificadores verificados contra el GetCapabilities el 22/11/2026.
 *  Detalle y URLs probadas: frontend/contratos/gibs.md */
export type CapaGibs = 'precipitacion' | 'vegetacion';

interface DefinicionCapaGibs {
  /** Identifier exacto de la capa en GIBS. */
  identificador: string;
  /** Nombre corto para la interfaz. */
  nombre: string;
  /** Zoom máximo del TileMatrixSet; más allá GIBS devuelve 400, Leaflet escala. */
  maxNativeZoom: number;
  formato: 'png' | 'jpg';
  /** Fecha (YYYY-MM-DD) que seguro tiene datos. */
  fechaPorDefecto: () => string;
}

/** Fecha UTC de hace `dias` días, en YYYY-MM-DD. */
function fechaUtcHace(dias: number): string {
  return new Date(Date.now() - dias * 86_400_000).toISOString().slice(0, 10);
}

/** Decisión: usamos "anteayer" (UTC) y no "hoy" ni "ayer". El Default del
 *  GetCapabilities era ayer (2026-11-21), pero GIBS publica con latencia:
 *  el último día puede no estar procesado todavía y devolver tiles vacíos.
 *  Con 2 días de margen siempre hay datos. */
const anteayer = () => fechaUtcHace(2);

export const CAPAS_GIBS: Record<CapaGibs, DefinicionCapaGibs> = {
  precipitacion: {
    identificador: 'IMERG_Precipitation_Rate', // TileMatrixSet GoogleMapsCompatible_Level6
    nombre: 'Lluvia satelital (IMERG)',
    maxNativeZoom: 6,
    formato: 'png',
    fechaPorDefecto: anteayer,
  },
  vegetacion: {
    identificador: 'MODIS_Terra_NDVI_8Day', // TileMatrixSet GoogleMapsCompatible_Level9
    nombre: 'Vegetación (NDVI)',
    maxNativeZoom: 9,
    formato: 'png',
    fechaPorDefecto: anteayer,
  },
};

const TILE_MATRIX_SET: Record<CapaGibs, string> = {
  precipitacion: 'GoogleMapsCompatible_Level6',
  vegetacion: 'GoogleMapsCompatible_Level9',
};

/** Crea la capa de tiles de GIBS lista para `.addTo(mapa)`.
 *  `fecha` en YYYY-MM-DD; si falta, usa `fechaPorDefecto()`. */
export function crearCapaGibs(capa: CapaGibs, fecha?: string): L.TileLayer {
  const def = CAPAS_GIBS[capa];
  const dia = fecha ?? def.fechaPorDefecto();
  const url =
    `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${def.identificador}/default/${dia}/` +
    `${TILE_MATRIX_SET[capa]}/{z}/{y}/{x}.${def.formato}`;
  return L.tileLayer(url, {
    opacity: 0.6,
    maxNativeZoom: def.maxNativeZoom,
    maxZoom: 18,
    attribution:
      '<a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener">NASA GIBS / EOSDIS</a>',
  });
}
