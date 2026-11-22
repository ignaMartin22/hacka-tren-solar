# data/replay

JSON precalculados del Modo Replay, uno por evento. Los sirve el backend en `GET /api/replay` y `GET /api/replay/:id`.

- Los eventos se cargan en `config/eventos.ts`, con sus fuentes. Solo van eventos con fecha confirmada.
- Cada archivo se genera con `pnpm --filter yaku-backend replay <id>` (usa el histórico de Open-Meteo y el mismo motor que el semáforo en vivo).
- No editar los JSON a mano: si cambian los umbrales, se vuelven a generar.

Eventos cargados: `volcan-2017-01-10` (alud de Volcán del 10/01/2017).
