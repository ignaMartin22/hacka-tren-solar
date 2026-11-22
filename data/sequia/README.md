# Datos de sequía (Puna)

Archivos precalculados con `pnpm sequia`. Hay que volver a correrlo una vez por semana para actualizar `actual.json`.

- `promedios.json`: para cada zona y cada día del año (`MM-DD`), la lluvia normal de los 90 días que terminan en esa fecha (promedio 1991-2020).
- `actual.json`: nivel de sequía de hoy por zona, con su motivo, y el cierre de cada uno de los últimos 12 meses (`mensual`).

## Cómo se calcula

Lluvia de los últimos 90 días dividida por la lluvia normal de esos mismos 90 días. Verde desde 0,8; amarillo desde 0,6; naranja desde 0,4; rojo por debajo. Los umbrales están en `config/riesgo.ts` y son iniciales, sin validar científicamente.

Si lo normal para esos 90 días es menos de 20 mm, no se calcula: `nivel` es `null` y el motivo dice "época seca, sin dato". En la Puna eso pasa aproximadamente de junio a octubre.

## Límites

- Lo llovido y lo normal salen del reanálisis ERA5 de Open-Meteo (celdas de unos 9 km), no de pluviómetros. Sirve para comparar un período contra su propia historia, no como registro oficial de lluvia.
- El reanálisis llega con unos días de atraso: el campo `hasta` indica el último día incluido.
- Mide solo falta de lluvia. No mira vegetación, vegas ni caudales.
