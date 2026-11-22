# Contrato: suscripción por Telegram

Endpoints que la página pública de suscripción necesita del backend.
Hoy NO existen: el bot de Telegram todavía no está implementado.

## Cómo se usa desde el frontend

`PantallaSuscripcion` (`src/suscripcion/PantallaSuscripcion.tsx`):

1. Lee las zonas de `GET /api/zonas` (ya existe, no hace falta nada nuevo).
2. Lee `VITE_TELEGRAM_BOT_URL` del entorno: la URL base del bot,
   por ejemplo `https://t.me/YakuBot`. Si no está definida, la página muestra
   "La suscripción por Telegram todavía no está disponible." y no hay botón.
3. El botón "Abrir en Telegram" abre el deep link
   `${VITE_TELEGRAM_BOT_URL}?start=<zonaId>` — por ejemplo
   `https://t.me/YakuBot?start=tilcara`.

## Lo que el bot tiene que hacer con el deep link

Telegram entrega el parámetro `start` como payload del comando `/start`.
El bot debería:

- `start=<zonaId>`: suscribir al chat a esa zona y contestar confirmando
  ("Te suscribiste a Tilcara. Te avisamos cuando el nivel suba a NARANJA.").
- `zonaId` desconocido o sin `start`: responder con la lista de zonas para elegir.

No hace falta endpoint HTTP nuevo del lado del backend para suscribir:
el deep link ya lleva todo. Sí hace falta persistencia de suscriptores
(tabla `suscriptores`: chat_id, zona_id, creado_en) para que el envío de
avisos sepa a quién escribirle.

## Variables de entorno

| Variable | Dónde | Ejemplo |
|---|---|---|
| `VITE_TELEGRAM_BOT_URL` | frontend (`.env` / Vercel) | `https://t.me/YakuBot` |

Nota: el bot tiene que existir con ese username para que el link funcione;
mientras no exista, no definir la variable y la página lo dice.
