// Capas satelitales de NASA GIBS para superponer en el mapa (tiles WMTS gratuitos, sin clave).
//
// Identificadores, niveles de zoom y fechas verificados el 22/11/2026 en el GetCapabilities:
// https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml
// Se probó bajar un tile de cada capa sobre Jujuy (zoom 6, fila 36, columna 20): las dos responden.
//
// Uso con Leaflet:
//   L.tileLayer(urlDeCapa(capa), { maxNativeZoom: capa.zoomMaximo, opacity: capa.opacidad, attribution: capa.credito })

export interface CapaSatelital {
  id: string;
  nombre: string;
  // Qué se ve, en lenguaje simple, para la leyenda.
  descripcion: string;
  // Identificador de la capa y de su grilla en GIBS.
  capaGibs: string;
  grilla: string;
  // Zoom máximo que publica GIBS. Pasarlo como maxNativeZoom para que Leaflet estire los tiles al acercar.
  zoomMaximo: number;
  // Primer día disponible (AAAA-MM-DD). Hay días sueltos sin dato: si un tile falla, no mostrar la capa.
  disponibleDesde: string;
  opacidad: number;
  credito: string;
}

export const CAPAS_SATELITALES: CapaSatelital[] = [
  {
    id: 'lluvia',
    nombre: 'Lluvia satelital',
    descripcion: 'Lluvia estimada por satélite (IMERG, misión GPM de NASA). Una imagen por día, con celdas de unos 10 km.',
    capaGibs: 'IMERG_Precipitation_Rate',
    grilla: 'GoogleMapsCompatible_Level6',
    zoomMaximo: 6,
    // Cubre el alud de Volcán del 10/01/2017 y la crecida de Huichaira del 6/03/2025: sirve también en el Replay.
    disponibleDesde: '2000-06-01',
    opacidad: 0.6,
    credito: 'Lluvia: NASA GIBS / IMERG (GPM)',
  },
  {
    id: 'vegetacion',
    nombre: 'Vegetación',
    descripcion: 'Verdor de la vegetación (NDVI, sensor MODIS del satélite Terra). Promedio de los últimos 8 días.',
    capaGibs: 'MODIS_Terra_NDVI_8Day',
    grilla: 'GoogleMapsCompatible_Level9',
    zoomMaximo: 9,
    disponibleDesde: '2025-02-12',
    opacidad: 0.6,
    credito: 'Vegetación: NASA GIBS / MODIS Terra',
  },
];

// Plantilla de URL para L.tileLayer. Sin fecha, GIBS devuelve el último día publicado (suele ser ayer).
export function urlDeCapa(capa: CapaSatelital, fecha?: string): string {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${capa.capaGibs}/default/${fecha ?? 'default'}/${capa.grilla}/{z}/{y}/{x}.png`;
}
