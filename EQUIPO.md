# Yaku: guía rápida para el equipo

Para quienes siguen con el **frontend**, los **datos** y el **pitch**. Estado al 22/11/2026 12:20. El detalle está en `ESTADO.md`; las reglas, en `CONTEXT.md`.

## Qué funciona hoy (backend)

- Semáforo de aludes de las 6 zonas de la Quebrada con datos reales de Open-Meteo, motivos y tendencia de 7 días.
- Sequía de las 2 zonas de la Puna: lluvia de 90 días contra el promedio 1991-2020.
- Modo Replay del alud de Volcán del 10/01/2017, precalculado.
- Avisos: reglas de envío, historial, rojo con confirmación y simulacros desde el panel.
- Bot de Telegram escrito (`/start`, elegir zona, `/zonas`, `/baja`). **Todavía no se probó en vivo: falta el token.**
- Login de la vista institucional.

## Qué NO existe todavía

Suscripción por mail, avisos de sequía (solo se muestra el nivel), base de datos (hoy se guarda en archivos locales) y deploy. No hay link público.

## Cómo levantarlo

Node 20.12 o superior y pnpm. La red es lenta: `pnpm install` puede tardar varios minutos.

```
git pull
pnpm install
pnpm dev:backend     # API en http://localhost:3001
pnpm dev:frontend    # Vite; redirige /api al backend local
pnpm test            # tests del backend
```

Sin `.env` anda el semáforo y el Replay. Para el panel y el bot hay que crear `backend/.env` (ver `.env.example`) con `ADMIN_PASSWORD` y `TELEGRAM_BOT_TOKEN`.

---

## Para el frontend

Stack: React + Vite + TypeScript + Tailwind + Leaflet. La base está en `frontend/` (`src/App.tsx` lista las zonas; `src/api.ts` llama a `/api/estado`). Leaflet ya está instalado.

Los tipos están en `backend/src/tipos.ts` (`EstadoZona`, `TendenciaDia`, `Aviso`) y `config/riesgo.ts` (`Nivel`). Importarlos con `import type`, no copiarlos.

### Endpoints públicos

| Método y ruta | Devuelve |
|---|---|
| `GET /api/estado` | `{ calculadoEn, datosDe, fuente, errorUltimaActualizacion, zonas: EstadoZona[] }` |
| `GET /api/estado/:zonaId` | Lo mismo con una sola zona en el campo `zona`. 404 si no existe |
| `GET /api/zonas` | Zonas de `config/zonas.ts` |
| `GET /api/avisos` | Historial: `Aviso[]`, del más nuevo al más viejo |
| `GET /api/bot` | `{ activo, usuario, enlace }`. Con `activo: false` no mostrar la suscripción |
| `GET /api/replay` | Lista de eventos: `{ id, titulo, fechaEvento, zonaPrincipal, descripcion }[]` |
| `GET /api/replay/:id` | El replay completo (ver abajo) |

Ids de zona: `volcan`, `tumbaya`, `purmamarca`, `maimara`, `tilcara`, `humahuaca`, `abra-pampa`, `susques`.

### EstadoZona

```json
{
  "zonaId": "volcan", "nombre": "Volcán", "region": "Quebrada", "amenaza": "aludes",
  "lat": -23.92, "lon": -65.47,
  "nivel": "verde",
  "motivos": [{ "codigo": "sin_alerta", "texto": "Sin lluvias fuertes ni suelo saturado: hasta 9 mm en 24 horas y humedad del suelo de 0,28." }],
  "variables": { "lluvia24hMm": 8.9, "lluvia72hMm": 3.5, "pronostico24hMm": 8, "suelo": 0.284, "pendiente": "alta" },
  "aviso": null,
  "tendencia": [{ "fecha": "2026-11-16", "nivel": "verde", "lluviaMm": 0.3 }],
  "celda": { "lat": -23.936731, "lon": -65.40253, "elevacionM": 2121 },
  "datosDe": "2026-11-22T14:21:38.648Z",
  "calculadoEn": "2026-11-22T14:21:38.666Z"
}
```

- `nivel`: `"verde"`, `"amarillo"`, `"naranja"`, `"rojo"` o `null`. Con `null`, mostrar "Sin dato" y el texto de `aviso`.
- `motivos[].texto`: el "por qué", listo para mostrar. `codigo`: `lluvia_24h`, `lluvia_72h`, `suelo`, `pendiente`, `pronostico_24h`, `sin_alerta`.
- `tendencia`: 7 días, el último es hoy. Cada día trae el nivel más alto que alcanzó y la lluvia del día.
- `datosDe`: la "última actualización" que hay que mostrar siempre. Viene en UTC.
- `variables`: los números detrás del nivel en zonas de aludes (`null` en las de sequía). `suelo` puede ser `null`.
- `sequia`: solo en zonas de la Puna: `{ desde, hasta, lluvia90dMm, promedio90dMm, cociente }`. En época seca `nivel` y `cociente` son `null` y `aviso` dice "Época seca, sin dato: ...". Hoy Abra Pampa está en verde (131 % de lo normal) y Susques sin dato por época seca. Las zonas de sequía no tienen `tendencia`.

### Suscripción por Telegram

`GET /api/bot` devuelve `enlace` (`https://t.me/<usuario>`). Para suscribir directo a una zona, usar `<enlace>?start=<zonaId>` (sirve para un QR por zona). Solo hay avisos de las 6 zonas de la Quebrada.

### Aviso (historial y panel)

Campos: `id`, `zonaId`, `zonaNombre`, `tipo` (`alerta` o `fin_alerta`), `nivel`, `simulacro`, `texto`, `motivos`, `creadoEn`, `envioVecinos`, `enviadoEn`, `destinatarios`.

`envioVecinos`: `no_corresponde` (amarillo no va a vecinos), `pendiente_confirmacion` (rojo esperando), `enviado`, `vencido` (el nivel bajó antes de confirmar), `sin_canal` (bot apagado). Si `simulacro` es `true`, mostrarlo siempre como SIMULACRO.

### Vista institucional (requiere login)

| Método y ruta | Uso |
|---|---|
| `POST /api/admin/login` con `{ "clave": "..." }` | Devuelve `{ token, venceEn }`. 401 si la clave está mal, 503 si falta configurarla |
| `GET /api/admin/avisos/pendientes` | Rojos que esperan confirmación |
| `POST /api/admin/avisos/:id/confirmar` | Envía el rojo a los vecinos y devuelve el aviso. 503 si el bot está apagado |
| `POST /api/admin/simulacros` con `{ "zonaId", "nivel" }` | Crea un aviso de prueba. Naranja sale al instante; rojo queda pendiente |
| `GET /api/admin/suscriptores` | `{ total, porZona }` |

Todas menos el login llevan el header `Authorization: Bearer <token>`. El token dura 12 horas.

Hoy todo está en verde, así que para mostrar el circuito del rojo en la demo hay que usar un simulacro. El mensaje que llega dice "SIMULACRO: esto es una prueba, no una alerta real".

### Replay

`GET /api/replay/volcan-2017-01-10` devuelve `titulo`, `fechaEvento`, `descripcion`, `fuentes`, `nota` y `zonas`. Cada zona trae 8 `dias` (7 previos y el del evento):

```json
{
  "fecha": "2017-01-09", "esDiaDelEvento": false, "lluviaMm": 13.9,
  "nivel": "rojo", "desdeHora": "11:00",
  "motivos": [{ "codigo": "lluvia_24h", "texto": "Hasta 96 mm de lluvia en 24 horas, ..." }],
  "variables": { "lluvia24hMm": 95.7, "lluvia72hMm": 13.6, "pronostico24hMm": 95.7, "suelo": 0.485, "pendiente": "alta" },
  "nivelSoloObservado": "verde", "desdeHoraSoloObservado": "01:00", "motivosSoloObservado": []
}
```

- `nivel`: el más alto del día. `desdeHora`: hora local en que llegó a ese nivel.
- `nivelSoloObservado`: el nivel usando únicamente lo que ya había llovido, sin mirar hacia adelante.
- Mostrar el texto de `nota` en la pantalla del Replay: explica qué es precalculado.

### Reglas de interfaz (de CONTEXT.md)

- Mobile first. El color nunca va solo: siempre con el nivel escrito.
- Pocas palabras y cero jerga. Mostrar siempre la última actualización.
- Pie con crédito a Open-Meteo y la frase "datos satelitales y de modelos meteorológicos".
- No mostrar botones de cosas que no funcionan (suscripción por mail, avisos de sequía).

### Para no pisarnos

El asistente trabaja en `backend/`, `config/`, `data/` y los `.md`. No toca `frontend/`: lo lleva el equipo (sistema de diseño en `frontend/DESIGN.md`, auditoría en `frontend/AUDITORIA.md`). Hagan `git pull` antes de cada push.

---

## Para los datos

- `config/zonas.ts`: coordenadas y pendiente de cada zona. Las coordenadas están verificadas; las pendientes no.
- `config/riesgo.ts`: umbrales. Son los iniciales de CONTEXT.md, sin validar ni ajustar.
- `config/eventos.ts`: eventos del Replay. Para sumar uno hace falta la fecha exacta y una fuente; después se genera con `pnpm --filter yaku-backend replay <id>`. La crecida de Huichaira de marzo de 2025 está verificada pero no se cargó: el histórico casi no la registra (ver `data/replay/README.md`).
- `config/capasSatelitales.ts`: 2 capas de NASA GIBS verificadas, lluvia satelital (IMERG) y vegetación (MODIS). En Leaflet: `L.tileLayer(urlDeCapa(capa), { maxNativeZoom: capa.zoomMaximo, opacity: capa.opacidad, attribution: capa.credito })`. En el Replay, `urlDeCapa(capa, '2017-01-10')` muestra la lluvia satelital de ese día.

---

## Para el pitch

### En una frase

Yaku ("agua" en quechua) vigila el agua del norte jujeño con datos satelitales y de modelos meteorológicos, y la traduce a un semáforo de riesgo por zona con un aviso a tiempo.

### Cómo decirlo

| Decir | No decir |
|---|---|
| "Alerta de riesgo" | "Predecimos aludes", "detectamos aludes" |
| "Datos satelitales y de modelos meteorológicos" | "Imágenes satelitales en vivo" |
| "Umbrales iniciales, todavía sin validar" | "Modelo validado", "calibrado" |
| "El aviso rojo lo confirma una persona responsable" | "Avisa solo" |

### El Replay de Volcán: qué muestra y qué no

Evento confirmado: alud del 10 de enero de 2017 en Volcán, Tumbaya y Bárcena. Según el informe de la Cruz Roja (IFRC, en ReliefWeb): 2 personas fallecidas, 2.666 afectadas y 446 evacuadas. Las fuentes están en `config/eventos.ts`.

Lo que dio el motor para Volcán, con los umbrales iniciales sin tocar:

| Día | 03/01 | 04/01 | 05/01 | 06/01 | 07/01 | 08/01 | 09/01 | 10/01 (evento) |
|---|---|---|---|---|---|---|---|---|
| Nivel | verde | naranja | naranja | naranja | verde | amarillo | rojo | rojo |
| Solo con lo ya llovido | verde | verde | naranja | naranja | verde | verde | verde | rojo |
| Lluvia del día | 3,5 mm | 1,2 mm | 35 mm | 11,4 mm | 2,8 mm | 2,1 mm | 13,9 mm | 88,8 mm |

**Cuidado con cómo se cuenta:**

- El rojo del 09/01 aparece a las 11:00, pero usa la lluvia de las 24 horas siguientes tomada del registro histórico, como si el pronóstico hubiera acertado. No tenemos el pronóstico real de esa fecha.
- Usando solo lo que ya había llovido, el rojo recién aparece el 10/01 a las 11:00. El informe del Comité Operativo de Emergencias de Jujuy ubica la llegada del alud a Tumbaya alrededor de las 8:30, así que en ese caso el rojo llega después del alud: no hay anticipación.
- Frase honesta: "con un pronóstico que hubiera anticipado esa lluvia, Yaku habría marcado rojo el día anterior; y ya había marcado naranja cinco días antes". No decir "Yaku lo habría avisado 24 horas antes" a secas.
- Es un solo evento. No sabemos cuántas veces el semáforo se habría puesto rojo sin que pasara nada.
- Volcán y Tumbaya comparten el mismo punto del modelo, por eso dan idéntico.

### Dato real de hoy

Las 6 zonas de la Quebrada están en verde. Los valores cambian con cada actualización: revisar `/api/estado` antes de presentar.

### Guion sugerido para 3 minutos

1. Problema (30 s): en la Quebrada el agua que sobra baja como alud en horas; en la Puna el agua que falta seca las vegas en meses.
2. Qué es Yaku (30 s): un semáforo por zona que explica su porqué, y un aviso al celular.
3. Demo (90 s): mapa de hoy, ficha de una zona con el porqué, Replay de Volcán 2017, y suscripción por Telegram con un simulacro en vivo.
4. Cierre (30 s): para quién es, qué es real y qué falta, y el siguiente paso.
