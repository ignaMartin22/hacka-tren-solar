# data/replay

JSON precalculados del Modo Replay, uno por evento. Los sirve el backend en `GET /api/replay` y `GET /api/replay/:id`.

- Los eventos se cargan en `config/eventos.ts`, con sus fuentes. Solo van eventos con fecha confirmada.
- Cada archivo se genera con `pnpm --filter yaku-backend replay <id>` (usa el histórico de Open-Meteo y el mismo motor que el semáforo en vivo).
- No editar los JSON a mano: si cambian los umbrales, se vuelven a generar.

Eventos cargados: `volcan-2017-01-10` (alud de Volcán del 10/01/2017).

## Evento verificado que no se cargó: crecida de Huichaira, 6 de marzo de 2025

En la tarde-noche del 6 de marzo de 2025 una tormenta entre Huacalera y Maimará hizo crecer el arroyo Huichaira y cortó la Ruta Nacional 9 en Huichaira y Bordo Sococha (Tilcara). La fecha está confirmada por tres fuentes:

- Vialidad Nacional: https://www.argentina.gob.ar/noticias/en-jujuy-vialidad-nacional-realizo-trabajos-de-emergencia-para-habilitar-la-ruta-nacional-9
- El Tribuno de Jujuy: https://eltribunodejujuy.com/municipios/2025-3-6-22-7-0-tormenta-en-la-quebrada-cortes-en-la-rn-9-y-anegamientos-en-varias-localidades
- Jujuy al Momento: https://www.jujuyalmomento.com/huacalera/huacalera-y-el-perchel-tapadas-agua-barro-y-piedras-n185144

Se probó correr el motor sobre esa semana y no sirve como Replay: el histórico de Open-Meteo registra unos 5 mm ese día en Tilcara (17 mm como máximo en un día de esa semana) y el semáforo no pasa de amarillo. Una tormenta local de pocas horas puede no aparecer en un modelo con celdas de varios kilómetros. Es una limitación real de Yaku y conviene decirla si preguntan, no esconderla.
