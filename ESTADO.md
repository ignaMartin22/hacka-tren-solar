# Estado del proyecto

Actualizar este archivo cada vez que se termine algo o cambie el plan. Lo leen las personas que retoman el trabajo.

Última actualización: 22/11/2026 (hora de Jujuy)

Reparto: el asistente hace el backend (`backend/`, `config/`, `data/`); el resto del equipo, frontend, datos y pitch. La API está documentada en `EQUIPO.md`.

## Hecho
- Estructura del repo: workspace pnpm con `backend/`, `frontend/`, `config/` y `data/replay/`. Todo en TypeScript.
- `config/zonas.ts` (8 zonas), `config/riesgo.ts` (umbrales y tope de avisos) y `config/eventos.ts` (eventos del Replay con fuentes).
- Open-Meteo: una sola llamada para todas las zonas (10 días pasados + 3 de pronóstico, por hora). Actualiza al arrancar y cada 3 horas; si falla, sigue con lo guardado.
- Motor de aludes con motivos, y tendencia de 7 días por zona (`GET /api/estado`, `GET /api/estado/:zonaId`).
- Avisos: solo cuando el nivel sube y al volver a verde; naranja sale solo a vecinos; rojo espera confirmación; tope de un aviso por zona y nivel cada 6 horas. Historial en `GET /api/avisos`.
- Vista institucional: login con clave compartida, rojos pendientes, confirmar y enviar, simulacros y conteo de suscriptores (`/api/admin/...`).
- Bot de Telegram con grammY: `/start`, elegir zona, `/zonas`, `/baja`, enlace directo por zona. Webhook si hay URL pública, polling si no.
- Sequía (Abra Pampa y Susques): lluvia de los últimos 90 días sobre el promedio 1991-2020 del mismo período, todo con el reanálisis ERA5. El promedio está precalculado en `data/sequia/climatologia.json` (`pnpm --filter yaku-backend climatologia`). Se recalcula una vez por semana. Si el promedio es menor a 20 mm devuelve "época seca, sin dato". No genera avisos.
- Modo Replay: alud de Volcán del 10/01/2017 (fecha confirmada con IFRC y La Nación), en `data/replay/` y `GET /api/replay`.
- `POST /api/jobs/run` (header `x-job-secret`) para el cron externo.
- Frontend (`frontend/`): Vite + React + Tailwind + Leaflet. Pantalla principal con mapa (marcadores por nivel con etiquetas que no se superponen, selector de capa satelital NASA GIBS), ficha con el "por qué" y gráfico de 7 días, lista, leyenda, esqueletos de carga, aviso de datos viejos y refresco automático. Rutas: `#/`, `#/replay`, `#/suscribirse`, `#/institucional`. Las pantallas que todavía usan datos de ejemplo van tras flags `VITE_MOSTRAR_*` (prendidas en desarrollo, apagadas en producción; ver `frontend/.env.example`). Auditoría en `frontend/AUDITORIA.md`. Build y typecheck en verde; probado a 360, 768 y 1366 px con datos reales.
- 23 tests del backend (`pnpm test`).

## En curso
- Frontend: conectar las pantallas a la API real del backend (hoy usan datos de ejemplo y contratos propuestos en `frontend/contratos/`, que no coinciden del todo con lo que expone el backend). Ver pendiente 5.

## Pendiente (en orden de prioridad)
1. **Probar el bot en vivo.** Falta `TELEGRAM_BOT_TOKEN` (se pide a @BotFather). El código pasa los tests de envío con un canal simulado, pero nunca habló con Telegram.
2. Deploy: backend en Render y frontend en Vercel. Ver "Deploy" más abajo.
3. Base de datos: Postgres (Neon) con Prisma. Falta `DATABASE_URL`. Hoy todo va a archivos JSON en `backend/.datos/`.
4. Aviso por mail a Defensa Civil, Vialidad y el Tren: no hay proveedor de correo. Hoy el canal institucional es el panel.
5. Conectar el frontend a la API real: tendencia (ya viene en `EstadoZona.tendencia` de `/api/estado`, no en un endpoint aparte), Replay (`/api/replay`), avisos (`/api/avisos`), vista institucional (`/api/admin/...`), suscripción (enlace del bot) y sequía (`EstadoZona.sequia`). La capa satelital ya está en el mapa (`frontend/src/mapa/capaSatelital.ts`, mismos identificadores que `config/capasSatelitales.ts`).
6. README final.

## Datos verificados y sin verificar
- Verificado contra la API de Open-Meteo: `precipitation`, `soil_moisture_0_to_1cm`, `_1_to_3cm`, `_3_to_9cm`, `_9_to_27cm` (pronóstico) y `soil_moisture_0_to_7cm`, `_7_to_28cm` (histórico).
- Verificado: coordenadas de todas las zonas (Volcán con Nominatim/OpenStreetMap, porque el geocodificador de Open-Meteo no lo tiene); fecha, hora aproximada y cifras del alud de Volcán de 2017.
- Verificado en el GetCapabilities de NASA GIBS (22/11/2026), bajando un tile de cada una: `IMERG_Precipitation_Rate` (zoom hasta 6, desde 2000) y `MODIS_Terra_NDVI_8Day` (zoom hasta 9, desde 02/2025).
- Verificado: fecha de la crecida de Huichaira del 6/03/2025. No se cargó como Replay porque el histórico casi no registra la tormenta (ver `data/replay/README.md`).
- SIN verificar: la pendiente de cada zona.
- SIN verificar en el deploy: que Render defina `RENDER_EXTERNAL_URL`. Si no, hay que cargar `PUBLIC_URL` a mano.

## Problemas abiertos
- **En Render el disco se borra en cada reinicio**: sin base de datos se pierden suscriptores, historial y el último nivel de cada zona. Para la demo alcanza si el servicio no se reinicia; para algo real hace falta Postgres.
- Los umbrales no se ajustaron. En el Replay de 2017 dieron rojo, pero es un solo evento y no se midieron falsas alarmas. La humedad del suelo del histórico de ese verano (0,48 a 0,51) queda muy por encima del umbral de 0,35: es posible que en época de lluvias el semáforo suba seguido.
- El Replay no usa pronósticos reales de 2017 (no existen archivados): ver la explicación en `EQUIPO.md`.
- Sequía: ERA5 publica con unos 7 días de demora, así que la ventana de 90 días termina una semana atrás. El promedio anual de ERA5 (434 mm en Abra Pampa, 306 mm en Susques) no se contrastó con estaciones; el cociente compara ERA5 contra ERA5.
- Volcán y Tumbaya caen en la misma celda de Open-Meteo y reciben los mismos datos.
- Si el backend arranca con una zona ya en naranja, el aviso puede salir antes de que el bot termine de conectarse y queda como `sin_canal`.
- La tendencia de días pasados se recalcula con lo que el modelo registró después, no con el pronóstico que había en ese momento.
- `npm` no funciona desde Git Bash en esta máquina; `pnpm` sí. La red es lenta.

## Deploy (todavía no hecho)
- Backend en Render: raíz del repo, instalar con `pnpm install`, arrancar con `pnpm --filter yaku-backend start`. Variables: `JOB_SECRET`, `ADMIN_PASSWORD`, `TELEGRAM_BOT_TOKEN`, `FRONTEND_ORIGIN`.
- Cron externo (cron-job.org o GitHub Actions): `POST /api/jobs/run` con el header `x-job-secret`, cada 3 horas.
- Frontend en Vercel: carpeta `frontend/`, variable `VITE_API_URL` con la URL del backend.

## Cómo correrlo
- Requisitos: Node 20.12 o superior y pnpm. `pnpm install` en la raíz.
- Backend: `pnpm dev:backend` (http://localhost:3001). Para el panel y el bot, copiar `.env.example` a `backend/.env` y completar.
- Frontend: `pnpm dev:frontend` (Vite redirige `/api` al backend local).
- Tests: `pnpm test`. Tipos: `pnpm typecheck`.
- Regenerar un Replay: `pnpm --filter yaku-backend replay volcan-2017-01-10`.
