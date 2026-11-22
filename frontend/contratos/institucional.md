# Contrato: vista institucional

Endpoints propuestos que la vista institucional necesita del backend.
Hoy NO existen: con `INSTITUCIONAL_DISPONIBLE = false` (`src/institucional/api.ts`)
la pantalla funciona en modo de ejemplo (login acepta cualquier clave, avisos
mock de `src/mocks/institucional.ts`).

## POST /api/login

Login simple con una clave compartida.

Request:

```json
{ "clave": "la-clave-del-equipo" }
```

200 OK:

```json
{ "token": "eyJhbGciOi..." }
```

401 cuando la clave es incorrecta:

```json
{ "error": "Clave incorrecta" }
```

Notas:

- Un token firmado (JWT) o un secreto aleatorio guardado en memoria alcanza.
- El frontend guarda el token en `sessionStorage` y lo manda como
  `Authorization: Bearer <token>` en los endpoints protegidos.

## GET /api/avisos

Historial de avisos enviados o pendientes de confirmación. Requiere
`Authorization: Bearer <token>`.

200 OK:

```json
{
  "avisos": [
    {
      "id": "av_01J...",
      "creadoEn": "2026-11-22T13:40:00.000Z",
      "zonaId": "tumbaya",
      "zonaNombre": "Tumbaya",
      "nivel": "naranja",
      "destinatarios": 34,
      "estado": "enviado",
      "mensaje": "YAKU · NARANJA · Tumbaya\nLluvias fuertes y suelo muy húmedo en la zona. Hay riesgo de aludes en las próximas 24 h. Evitá cruzar ríos y quebradas. Seguí las indicaciones de Defensa Civil."
    },
    {
      "id": "av_01K...",
      "creadoEn": "2026-11-22T15:05:00.000Z",
      "zonaId": "maimara",
      "zonaNombre": "Maimará",
      "nivel": "rojo",
      "destinatarios": 21,
      "estado": "pendiente-confirmacion",
      "mensaje": "YAKU · ROJO · Maimará\nLluvia muy fuerte y suelo saturado en la zona. Riesgo alto de aludes en las próximas horas. No cruces ríos ni quebradas. Seguí las indicaciones de Defensa Civil."
    }
  ]
}
```

Campos:

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | string | Id único del aviso. |
| `creadoEn` | string (ISO 8601, UTC) | Cuándo el motor generó el aviso. |
| `zonaId` / `zonaNombre` | string | Zona del aviso. |
| `nivel` | `"naranja" \| "rojo"` | Solo se avisan estos niveles (CONTEXT.md §8). |
| `destinatarios` | number | Personas suscriptas que recibieron o recibirían el aviso. |
| `estado` | `"enviado" \| "pendiente-confirmacion"` | El ROJO queda pendiente hasta que alguien lo confirma. |
| `mensaje` | string | Texto exacto que se envía por Telegram; el diálogo de confirmación lo muestra tal cual. Formato `YAKU · <NIVEL> · <Zona>` + cuerpo corto con acción concreta. |

Orden sugerido: más reciente primero.

## POST /api/avisos/:id/confirmar

Confirma un aviso pendiente y lo manda a los suscriptos de la zona.
Requiere `Authorization: Bearer <token>`.

Sin body (o body vacío). Solo tiene sentido para avisos con
`estado: "pendiente-confirmacion"` (los ROJO).

200 OK — devuelve el aviso ya actualizado:

```json
{
  "aviso": {
    "id": "av_01K...",
    "creadoEn": "2026-11-22T15:05:00.000Z",
    "zonaId": "maimara",
    "zonaNombre": "Maimará",
    "nivel": "rojo",
    "destinatarios": 21,
    "estado": "enviado",
    "mensaje": "YAKU · ROJO · Maimará\n..."
  }
}
```

Errores sugeridos:

| Código | Caso |
|---|---|
| 401 | Sin token o token inválido. |
| 404 | `id` no existe. |
| 409 | El aviso ya fue confirmado/enviado. |
