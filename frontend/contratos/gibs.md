# Capas satelitales NASA GIBS — verificado el 22/11/2026

Fuente: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml` (descargado y leído el 22/11/2026).

| | Lluvia (clave `precipitacion`) | Vegetación (clave `vegetacion`) |
|---|---|---|
| Identifier | `IMERG_Precipitation_Rate` | `MODIS_Terra_NDVI_8Day` |
| Título GIBS | Precipitation Rate (IMERG) | Vegetation Index (rolling 8-Day, MODIS, Terra) |
| TileMatrixSet | `GoogleMapsCompatible_Level6` | `GoogleMapsCompatible_Level9` |
| Zoom máximo nativo | 6 | 9 |
| Formato | `image/png` | `image/png` |
| Dimension Time, Default | 2026-11-21 | 2026-11-21 |
| Rango (P1D, con huecos) | 2000-06-01 a 2026-11-21 | 2025-02-12 a 2026-11-21 |

Otras capas NDVI existentes (no usadas): `VIIRS_SNPP_NDVI_8Day`, `MODIS_Terra_L3_NDVI_16Day`, `MODIS_Terra_L3_NDVI_Monthly`, etc. También existe `IMERG_Precipitation_Rate_30min`.
El rango tiene huecos en algunos días (ej. IMERG: faltan 2025-10-23 a 10-29, 2026-01-08, 2026-02-03, 2026-02-10/11, 2026-05-25/26); pedir esos días no devuelve datos.

## Plantilla de tile (REST)
`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{Identifier}/default/{YYYY-MM-DD}/{TileMatrixSet}/{z}/{y}/{x}.png`
(en Leaflet `{y}` es la fila y `{x}` la columna; el orden es z/fila/columna).

## URLs probadas (Jujuy, lat -23.6, lon -65.4)
Respuesta HTTP 200, `image/png`:
- `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/2026-11-21/GoogleMapsCompatible_Level6/6/36/20.png` (1481 bytes; también 2026-11-20 → 200)
- `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/2026-11-21/GoogleMapsCompatible_Level9/9/290/162.png` (37466 bytes; también 2026-11-20 → 200)

Zoom 7 en IMERG (`.../Level6/7/72/40.png`) → HTTP 400: confirma que 6 es el máximo. Por eso `maxNativeZoom: 6` (Leaflet agranda el tile en zooms mayores). Un tile de lluvia chico es normal: gran parte del mapa está sin lluvia (transparente).

## Fecha por defecto
`fechaPorDefecto()` = anteayer en UTC, no "hoy". El Default de GIBS es ayer, pero se publica con latencia y el último día puede estar incompleto. Con 2 días de margen hay datos. Verificado: 2026-11-20 devuelve 200 en ambas capas.

## Uso desde el mapa
```ts
import { crearCapaGibs, CAPAS_GIBS, type CapaGibs } from './mapa/capaSatelital';

const capa = crearCapaGibs('precipitacion');        // fecha por defecto
const otra = crearCapaGibs('vegetacion', '2026-11-20');
capa.addTo(mapa);          // mapa: L.Map
mapa.removeLayer(capa);    // para apagarla
CAPAS_GIBS.precipitacion.nombre; // "Lluvia satelital (IMERG)" para la UI
```
Opacidad 0.6, atribución "NASA GIBS / EOSDIS" con link (hay que mostrarla en el mapa). Son datos satelitales reales, no ejemplos.
