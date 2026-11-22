# Estado del proyecto

Actualizar este archivo cada vez que se termine algo o cambie el plan. Lo leen las personas que retoman el trabajo.

Última actualización: 22/11/2026 12:05 (hora de Jujuy)

## Hecho
- Estructura del repo: workspace pnpm con `backend/`, `frontend/`, `config/` y `data/replay/`. Todo en TypeScript.
- `config/zonas.ts`: 6 zonas de la Quebrada (aludes) y 2 de la Puna (sequía). Agregar una zona es agregar una entrada.
- `config/riesgo.ts`: todos los umbrales del motor (valores iniciales de CONTEXT.md, sin validar).
- `backend/src/servicios/openMeteo.ts`: una sola llamada a Open-Meteo para todas las zonas (7 días pasados + 3 de pronóstico, por hora). También está la función para el histórico (para el Replay), probada a mano pero todavía sin uso.
- `EQUIPO.md`: guía rápida para el equipo (API para el frontend y notas para el pitch).
- `backend/src/riesgo/aludes.ts`: motor de riesgo de aludes con la lista de motivos (el "por qué"). 9 tests en `aludes.test.ts`.
- Endpoints: `GET /api/estado`, `GET /api/estado/:zonaId`, `GET /api/zonas`, `GET /api/salud` y `POST /api/jobs/run` (header `x-job-secret`).
- El backend actualiza al arrancar y cada 3 horas. Si Open-Meteo falla, sigue con las últimas lecturas guardadas.
- Probado con datos reales de hoy: las 6 zonas de la Quebrada dan verde (casi sin lluvia).
- Frontend base (`frontend/`): Vite + React + Tailwind. Muestra la lista de zonas con nivel, motivos y hora de actualización leyendo `/api/estado`. Probado en navegador con datos reales; `pnpm build` pasa. Leaflet ya está instalado pero todavía no se usa.
- Modo Replay, parte de datos: `config/eventos.ts` (2 eventos con fuentes), `pnpm replay` y los JSON precalculados en `data/replay/`. Leer `data/replay/README.md` antes de mostrarlo: explica qué se puede decir y qué no. Falta el endpoint y la pantalla.
- Sequía, parte de datos: motor en `backend/src/riesgo/sequia.ts` (3 tests), `pnpm sequia` y los JSON en `data/sequia/` (`promedios.json`: lluvia normal 1991-2020; `actual.json`: nivel de hoy y cierre de los últimos 12 meses). Hoy: Abra Pampa amarillo (60 % de lo normal), Susques "época seca, sin dato". Falta conectarlo a `/api/estado` (las zonas de la Puna siguen con `nivel: null`).
- Capa satelital: `config/capasSatelitales.ts` con 2 capas de NASA GIBS verificadas (lluvia IMERG y vegetación MODIS) y la función `urlDeCapa` para Leaflet. Falta sumarla al mapa.

## En curso
- (nada: el equipo sigue con el frontend y el pitch; ver EQUIPO.md)

## Pendiente (en orden de prioridad)
1. Mapa con Leaflet y ficha de zona (tendencia de 7 días: la serie horaria ya se guarda, falta calcularla y exponerla)
2. Base de datos: Postgres (Neon) con Prisma. Hoy las lecturas van a memoria y a `backend/.datos/lecturas.json` (fuera del repo). Falta `DATABASE_URL`.
3. Bot de Telegram y vista institucional (falta `TELEGRAM_BOT_TOKEN`)
4. Modo Replay: endpoint que sirva `data/replay/<id>.json` y pantalla
5. Sequía: usar `calcularSequia` en `backend/src/servicios/estado.ts` (una vez por semana) y sumar la capa de GIBS al mapa
6. Deploy y README final

## Datos verificados y sin verificar
- Verificado contra la API de Open-Meteo (22/11/2026): variables `precipitation`, `soil_moisture_0_to_1cm`, `soil_moisture_1_to_3cm`, `soil_moisture_3_to_9cm`, `soil_moisture_9_to_27cm` (pronóstico) y `soil_moisture_0_to_7cm`, `soil_moisture_7_to_28cm` (histórico). Todas responden en m³/m³ y sin valores nulos para nuestras zonas.
- Verificado con el geocodificador de Open-Meteo: coordenadas de Tumbaya, Purmamarca, Maimará, Tilcara, Humahuaca, Abra Pampa y Susques.
- Verificado con Nominatim (OpenStreetMap): coordenadas de Volcán (el geocodificador de Open-Meteo no lo tiene).
- Verificado con fuentes (links en `config/eventos.ts`): alud del 10/01/2017 en Volcán, Tumbaya y Bárcena (Gobierno de Jujuy, El Tribuno, Cruz Roja) y crecida del arroyo Huichaira del 6/03/2025 (Vialidad Nacional, El Tribuno, Jujuy al Momento).
- Verificado en el GetCapabilities de NASA GIBS (22/11/2026), bajando un tile de cada una: `IMERG_Precipitation_Rate` (zoom hasta 6, desde 2000) y `MODIS_Terra_NDVI_8Day` (zoom hasta 9, desde 02/2025).
- SIN verificar: la pendiente (alta/media/baja) de cada zona. Es una estimación cargada a mano.

## Problemas abiertos
- Volcán y Tumbaya caen en la misma celda de la grilla de Open-Meteo (unos 9 km), así que hoy reciben exactamente los mismos datos. El endpoint devuelve en `celda` la coordenada que respondió el modelo.
- La humedad del suelo se promedia de 0 a 27 cm en el pronóstico y de 0 a 28 cm en el histórico (ponderada por espesor de capa). Es una decisión nuestra para que el Replay y el semáforo en vivo sean comparables; los umbrales no están calibrados contra ese promedio.
- `npm` no funciona desde Git Bash en esta máquina (error de WSL). `pnpm` 11 sí. La red del tren es lenta: las instalaciones tardan varios minutos.
- Para el deploy en Render: `tsx` está en devDependencies y el backend arranca con `tsx`. Hay que moverlo a dependencies o instalar también las de desarrollo.
- Replay de Volcán 2017: el rojo aparece 20 horas antes del alud solo si se usa como pronóstico la lluvia que realmente cayó. Con solo lo ya llovido, aparece después. No decir "lo hubiéramos avisado 20 horas antes" sin esa aclaración.
- Replay de Huichaira 2025: el reanálisis casi no registra la tormenta (5 mm ese día) y el semáforo no pasa de amarillo. No usarlo como demo principal.
- Sequía: lo llovido y lo normal salen del mismo reanálisis (celdas de unos 9 km), no de pluviómetros. El dato llega con unos días de atraso.

## Cómo correrlo
- Requisitos: Node 20.12 o superior y pnpm.
- `pnpm install` en la raíz.
- Backend: `pnpm dev:backend` (queda en http://localhost:3001). Opcional: copiar `.env.example` a `backend/.env`.
- Frontend: `pnpm dev:frontend` (Vite redirige `/api` al backend local).
- Tests: `pnpm test`. Tipos: `pnpm typecheck`.
- Probar: `curl http://localhost:3001/api/estado` o `curl http://localhost:3001/api/estado/volcan`.
