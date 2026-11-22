# Estado del proyecto

Actualizar este archivo cada vez que se termine algo o cambie el plan. Lo leen las personas que retoman el trabajo.

Última actualización: 22/11/2026 12:16 (hora de Jujuy)

Reparto: el asistente hace el backend (`backend/`, `config/`, `data/`); el resto del equipo, frontend, datos y pitch. La API está documentada en `EQUIPO.md`.

## Hecho
- Estructura del repo: workspace pnpm con `backend/`, `frontend/`, `config/` y `data/replay/`. Todo en TypeScript.
- `config/zonas.ts` (8 zonas), `config/riesgo.ts` (umbrales y tope de avisos) y `config/eventos.ts` (eventos del Replay con fuentes).
- Open-Meteo: una sola llamada para todas las zonas (10 días pasados + 3 de pronóstico, por hora). Actualiza al arrancar y cada 3 horas; si falla, sigue con lo guardado.
- Motor de aludes con motivos, y tendencia de 7 días por zona (`GET /api/estado`, `GET /api/estado/:zonaId`).
- Avisos: solo cuando el nivel sube y al volver a verde; naranja sale solo a vecinos; rojo espera confirmación; tope de un aviso por zona y nivel cada 6 horas. Historial en `GET /api/avisos`.
- Vista institucional: login con clave compartida, rojos pendientes, confirmar y enviar, simulacros y conteo de suscriptores (`/api/admin/...`).
- Bot de Telegram con grammY: `/start`, elegir zona, `/zonas`, `/baja`, enlace directo por zona. Webhook si hay URL pública, polling si no.
- Modo Replay: alud de Volcán del 10/01/2017 (fecha confirmada con IFRC y La Nación), en `data/replay/` y `GET /api/replay`.
- `POST /api/jobs/run` (header `x-job-secret`) para el cron externo.
- Frontend base: lista de zonas con nivel, motivos y hora de actualización.
- 19 tests del backend (`pnpm test`).

## En curso
- Motor de sequía para las 2 zonas de la Puna.

## Pendiente (en orden de prioridad)
1. **Probar el bot en vivo.** Falta `TELEGRAM_BOT_TOKEN` (se pide a @BotFather). El código pasa los tests de envío con un canal simulado, pero nunca habló con Telegram.
2. Deploy: backend en Render y frontend en Vercel. Ver "Deploy" más abajo.
3. Base de datos: Postgres (Neon) con Prisma. Falta `DATABASE_URL`. Hoy todo va a archivos JSON en `backend/.datos/`.
4. Aviso por mail a Defensa Civil, Vialidad y el Tren: no hay proveedor de correo. Hoy el canal institucional es el panel.
5. Capa satelital de GIBS (verificar el identificador de capa en el GetCapabilities).
6. README final.

## Datos verificados y sin verificar
- Verificado contra la API de Open-Meteo: `precipitation`, `soil_moisture_0_to_1cm`, `_1_to_3cm`, `_3_to_9cm`, `_9_to_27cm` (pronóstico) y `soil_moisture_0_to_7cm`, `_7_to_28cm` (histórico).
- Verificado: coordenadas de todas las zonas menos Volcán; fecha y cifras del alud de Volcán de 2017.
- SIN verificar: coordenadas de Volcán, la pendiente de cada zona, las crecidas de marzo de 2025 (no se cargaron) y los identificadores de capas de GIBS.
- SIN verificar en el deploy: que Render defina `RENDER_EXTERNAL_URL`. Si no, hay que cargar `PUBLIC_URL` a mano.

## Problemas abiertos
- **En Render el disco se borra en cada reinicio**: sin base de datos se pierden suscriptores, historial y el último nivel de cada zona. Para la demo alcanza si el servicio no se reinicia; para algo real hace falta Postgres.
- Los umbrales no se ajustaron. En el Replay de 2017 dieron rojo, pero es un solo evento y no se midieron falsas alarmas. La humedad del suelo del histórico de ese verano (0,48 a 0,51) queda muy por encima del umbral de 0,35: es posible que en época de lluvias el semáforo suba seguido.
- El Replay no usa pronósticos reales de 2017 (no existen archivados): ver la explicación en `EQUIPO.md`.
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
