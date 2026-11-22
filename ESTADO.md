# Estado del proyecto

Actualizar este archivo cada vez que se termine algo o cambie el plan. Lo leen las personas que retoman el trabajo.

Última actualización: 22/11/2026 13:38 (hora de Jujuy)

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
- Frontend (`frontend/`): Vite + React + Tailwind + Leaflet, todo integrado en `feat/frontend`. Pantalla principal con mapa (marcadores por nivel, selector de capa satelital NASA GIBS), ficha con "por qué" + gráfico de tendencia, lista, leyenda, esqueletos de carga, banner de datos viejos y refresco automático. Hash routing: `#/` (principal), `#/replay`, `#/suscribirse`, `#/institucional`. Las pantallas con datos de ejemplo van tras flags `VITE_MOSTRAR_*` (prendidas en dev, apagadas en producción; ver `frontend/.env.example` y `frontend/src/funciones.ts`). Auditoría en `frontend/AUDITORIA.md`; contratos propuestos al backend en `frontend/contratos/`. `pnpm build` y `pnpm typecheck` en verde; probado a 360/768/1280 px con datos reales.

## En curso
- Frontend: integrado en `feat/frontend`; quedan menores anotados en `frontend/AUDITORIA.md`. Lo que falta del lado del backend: los endpoints propuestos en `frontend/contratos/` (tendencia de 7 días, replay, avisos/suscripción, login institucional). Sistema de diseño en `frontend/DESIGN.md`. No tocar `frontend/` desde el backend.

## Pendiente (en orden de prioridad)
1. Tendencia de 7 días en el backend: la serie horaria ya se guarda, falta calcularla y exponerla (`GET /api/estado/:zonaId/tendencia`, contrato en `frontend/contratos/tendencia.md`; el frontend ya la muestra con datos de ejemplo marcados)
2. Base de datos: Postgres (Neon) con Prisma. Hoy las lecturas van a memoria y a `backend/.datos/lecturas.json` (fuera del repo). Falta `DATABASE_URL`.
3. Bot de Telegram y vista institucional (falta `TELEGRAM_BOT_TOKEN`; el frontend ya tiene ambas pantallas, contratos en `frontend/contratos/suscripcion.md` e `institucional.md`)
4. Modo Replay (verificar antes fechas y datos de los eventos; el frontend ya tiene la pantalla con un evento de ejemplo marcado, contrato en `frontend/contratos/replay.md`)
5. Sequía (la capa satelital GIBS ya está en el mapa, con identificadores verificados: `frontend/contratos/gibs.md`)
6. Deploy y README final

## Datos verificados y sin verificar
- Verificado contra la API de Open-Meteo (22/11/2026): variables `precipitation`, `soil_moisture_0_to_1cm`, `soil_moisture_1_to_3cm`, `soil_moisture_3_to_9cm`, `soil_moisture_9_to_27cm` (pronóstico) y `soil_moisture_0_to_7cm`, `soil_moisture_7_to_28cm` (histórico). Todas responden en m³/m³ y sin valores nulos para nuestras zonas.
- Verificado con el geocodificador de Open-Meteo: coordenadas de Tumbaya, Purmamarca, Maimará, Tilcara, Humahuaca, Abra Pampa y Susques.
- SIN verificar: coordenadas de Volcán (el geocodificador no respondió; queda el valor aproximado de CONTEXT.md, marcado con `coordenadasVerificadas: false`).
- SIN verificar: la pendiente (alta/media/baja) de cada zona. Es una estimación cargada a mano.
- SIN verificar: fechas y datos de los eventos del Replay, e identificadores de capas de GIBS. No se cargó nada de eso todavía.

## Problemas abiertos
- Volcán y Tumbaya caen en la misma celda de la grilla de Open-Meteo (unos 9 km), así que hoy reciben exactamente los mismos datos. El endpoint devuelve en `celda` la coordenada que respondió el modelo.
- La humedad del suelo se promedia de 0 a 27 cm en el pronóstico y de 0 a 28 cm en el histórico (ponderada por espesor de capa). Es una decisión nuestra para que el Replay y el semáforo en vivo sean comparables; los umbrales no están calibrados contra ese promedio.
- `npm` no funciona desde Git Bash en esta máquina (error de WSL). `pnpm` 11 sí. La red del tren es lenta: las instalaciones tardan varios minutos.
- Para el deploy en Render: `tsx` está en devDependencies y el backend arranca con `tsx`. Hay que moverlo a dependencies o instalar también las de desarrollo.

## Cómo correrlo
- Requisitos: Node 20.12 o superior y pnpm.
- `pnpm install` en la raíz.
- Backend: `pnpm dev:backend` (queda en http://localhost:3001). Opcional: copiar `.env.example` a `backend/.env`.
- Frontend: `pnpm dev:frontend` (Vite redirige `/api` al backend local).
- Tests: `pnpm test`. Tipos: `pnpm typecheck`.
- Probar: `curl http://localhost:3001/api/estado` o `curl http://localhost:3001/api/estado/volcan`.
