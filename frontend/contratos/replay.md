# Contrato propuesto: Modo Replay

Endpoints **propuestos**: todavía no existen en el backend. El frontend ya está listo en
`frontend/src/replay/` (`api.ts`, `tipos.ts`, `PantallaReplay.tsx`); mientras tanto la pantalla
se prueba con el mock `frontend/src/mocks/replay.ts` desde `/replay-demo.html`
(`REPLAY_DISPONIBLE = false` en `frontend/src/replay/api.ts`).

Los tipos viven en `frontend/src/replay/tipos.ts` y reusan `Nivel` (`config/riesgo.ts`) y
`Motivo` / `VariablesAludes` (`backend/src/tipos.ts`).

## GET /api/replay → `IndiceReplay`

Lista de eventos cargados, para elegir cuál reproducir.

```json
{
  "eventos": [
    { "id": "evento-de-ejemplo", "titulo": "Evento de ejemplo", "diaEvento": "2099-01-10", "verificado": false }
  ]
}
```

## GET /api/replay/:id → `EventoReplay` (404 si no existe)

```json
{
  "id": "evento-de-ejemplo",
  "titulo": "Evento de ejemplo",
  "descripcion": "Texto corto: qué pasó y dónde.",
  "fuente": "Open-Meteo histórico (ERA5) + <fuente del evento>" ,
  "verificado": false,
  "diaEvento": "2099-01-10",
  "dias": [
    {
      "fecha": "2099-01-03",
      "zonas": [
        {
          "zonaId": "volcan",
          "nombre": "Volcán",
          "nivel": "verde",
          "motivos": [{ "codigo": "sin_alerta", "texto": "Sin lluvias fuertes ni suelo saturado: ..." }],
          "variables": {
            "lluvia24hMm": 4,
            "lluvia72hMm": 6,
            "pronostico24hMm": 2,
            "suelo": 0.22,
            "pendiente": "alta"
          }
        }
      ]
    }
  ]
}
```

Notas:

- `dias` va en orden, de más viejo a más nuevo; `diaEvento` (YYYY-MM-DD) tiene que coincidir
  con la `fecha` de alguno de ellos (la pantalla lo marca como "Día del evento").
- `nivel` es el `Nivel` de siempre (`"verde" | "amarillo" | "naranja" | "rojo"`) o `null`
  si ese día la zona no tenía cálculo.
- `motivos` y `variables` tienen exactamente la misma forma que en `/api/estado`: los textos
  los redacta el motor de `backend/src/riesgo/aludes.ts`.
- `verificado` queda en `false` hasta confirmar fecha y datos del evento contra una fuente
  real (CONTEXT.md, sección 7). Mientras sea `false`, la interfaz muestra el aviso de
  datos de ejemplo.

## Cómo servirlo

No hace falta base de datos: el backend puede servir **JSON precalculado desde `data/replay/`**
(un archivo por evento, ver `data/replay/README.md`). Para cada evento, un job corre el mismo
motor de riesgo día por día con la serie histórica de Open-Meteo y guarda el `EventoReplay`
como `<id>.json`. `GET /api/replay/:id` lee y devuelve ese archivo; `GET /api/replay` arma el
índice leyendo el directorio (o un `indice.json` generado en el mismo paso).
