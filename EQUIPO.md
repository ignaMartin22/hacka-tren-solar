# Yaku: guía rápida para el equipo

Para quienes siguen con el **frontend** y el **pitch**. Estado al 22/11/2026 11:37. El detalle de lo hecho y lo pendiente está en `ESTADO.md`; las reglas del proyecto, en `CONTEXT.md`.

## Qué funciona hoy

- Backend en TypeScript (Express) que baja lluvia y humedad del suelo de Open-Meteo para las 8 zonas en una sola llamada, al arrancar y cada 3 horas.
- Motor de riesgo de aludes con reglas simples. Cada nivel sale con sus motivos (el "por qué") ya redactados.
- API de estado por zona, probada con datos reales de hoy.

## Qué NO existe todavía

Mapa, ficha de zona con tendencia de 7 días, bot de Telegram, vista institucional, base de datos y deploy. No hay link público. Del Modo Replay, la sequía y la capa satelital están los datos listos (ver "Datos listos para usar"), pero falta la pantalla y el endpoint. Las 2 zonas de la Puna figuran en la API pero sin nivel (`nivel: null`).

## Cómo levantarlo

Hace falta Node 20.12 o superior y pnpm. La red del tren es lenta: `pnpm install` puede tardar varios minutos.

```
git pull
pnpm install
pnpm dev:backend     # API en http://localhost:3001
pnpm dev:frontend    # Vite; redirige /api al backend local
pnpm test            # tests del motor de riesgo
```

No hace falta ningún `.env` para desarrollar.

---

## Para el frontend

Stack decidido: React + Vite + TypeScript + Tailwind + Leaflet. No agregar otras librerías sin una razón fuerte.

La base de `frontend/` ya está subida y probada: `src/App.tsx` muestra la lista de zonas con nivel, motivos y hora de actualización, y `src/api.ts` tiene la llamada a `/api/estado` con sus tipos. Leaflet ya está instalado (todavía sin usar). Partan de ahí para el mapa y la ficha.

### API disponible

| Método y ruta | Devuelve |
|---|---|
| `GET /api/estado` | Todas las zonas con su nivel y motivos |
| `GET /api/estado/:zonaId` | Una zona (mismos datos, en el campo `zona`). 404 si no existe |
| `GET /api/zonas` | Lista de zonas de `config/zonas.ts` (id, nombre, lat, lon, amenaza, pendiente) |
| `GET /api/salud` | `{ ok, calculadoEn }` |

Ids de zona: `volcan`, `tumbaya`, `purmamarca`, `maimara`, `tilcara`, `humahuaca`, `abra-pampa`, `susques`.

Respuesta real de `GET /api/estado` (recortada a una zona):

```json
{
  "calculadoEn": "2026-11-22T14:21:38.666Z",
  "datosDe": "2026-11-22T14:21:38.648Z",
  "fuente": "Open-Meteo (datos satelitales y de modelos meteorológicos)",
  "errorUltimaActualizacion": null,
  "zonas": [
    {
      "zonaId": "volcan",
      "nombre": "Volcán",
      "region": "Quebrada",
      "amenaza": "aludes",
      "lat": -23.92,
      "lon": -65.47,
      "nivel": "verde",
      "motivos": [
        { "codigo": "sin_alerta", "texto": "Sin lluvias fuertes ni suelo saturado: hasta 9 mm en 24 horas y humedad del suelo de 0,28." }
      ],
      "variables": { "lluvia24hMm": 8.9, "lluvia72hMm": 3.5, "pronostico24hMm": 8, "suelo": 0.284, "pendiente": "alta" },
      "aviso": null,
      "celda": { "lat": -23.936731, "lon": -65.40253, "elevacionM": 2121 },
      "datosDe": "2026-11-22T14:21:38.648Z",
      "calculadoEn": "2026-11-22T14:21:38.666Z"
    }
  ]
}
```

### Qué significa cada campo

- `nivel`: `"verde"`, `"amarillo"`, `"naranja"`, `"rojo"` o `null`. Con `null` no hay nivel: mostrar "Sin dato" y el texto de `aviso`.
- `motivos[].texto`: el "por qué", listo para mostrar tal cual. `codigo` sirve como `key` o para elegir un ícono (`lluvia_24h`, `lluvia_72h`, `suelo`, `pendiente`, `pronostico_24h`, `sin_alerta`).
- `variables`: los números detrás del nivel, para la vista institucional. Lluvias en mm, `suelo` en m³/m³ (puede ser `null`).
- `datosDe`: cuándo se bajaron los datos. Es la "última actualización" que hay que mostrar siempre. Viene en UTC: convertir a hora local.
- `amenaza`: `"aludes"` (Quebrada) o `"sequia"` (Puna).
- `lat` / `lon`: dónde dibujar la zona en el mapa. `celda` es el punto del modelo que respondió; no hace falta mostrarlo.
- `errorUltimaActualizacion`: si no es `null`, Open-Meteo falló y se muestran los últimos datos guardados.

Los tipos ya están escritos: `EstadoZona` en `backend/src/tipos.ts` y `Nivel` en `config/riesgo.ts`. Importarlos con `import type`, no copiarlos.

### Reglas de interfaz (de CONTEXT.md)

- Mobile first. En celular, mapa arriba y ficha abajo; en escritorio, mapa a la izquierda y ficha a la derecha.
- El color nunca va solo: siempre con el nivel escrito (VERDE, AMARILLO, NARANJA, ROJO).
- Pocas palabras y cero jerga.
- Pie de página con crédito a Open-Meteo y la frase "datos satelitales y de modelos meteorológicos".
- No mostrar botones ni pantallas de cosas que todavía no funcionan.

### Datos listos para usar

- **Replay:** `data/replay/volcan-2017-01-10.json` (el que conviene mostrar) y `data/replay/huichaira-2025-03-06.json`. Cada uno trae, por zona, el color de cada día (`dias`) y de cada 3 horas (`pasos`) con sus motivos. El formato y lo que se puede decir están en `data/replay/README.md`.
- **Sequía:** `data/sequia/actual.json` trae el nivel de Abra Pampa y Susques con su motivo y el cierre de los últimos 12 meses (`mensual`). `nivel: null` se muestra como "época seca, sin dato", en gris.
- **Capa satelital:** `config/capasSatelitales.ts`. En Leaflet: `L.tileLayer(urlDeCapa(capa), { maxNativeZoom: capa.zoomMaximo, opacity: capa.opacidad, attribution: capa.credito })`. Para el Replay, `urlDeCapa(capa, '2017-01-10')` muestra la lluvia satelital de ese día.

### Para no pisarnos

El asistente sigue en `backend/`, `config/` y `data/`. Si el equipo toma `frontend/`, avisen y no se toca desde acá. Commits chicos y `git pull` antes de cada push. Los endpoints que falten (tendencia de 7 días, Replay, suscripción) se anotan en este archivo cuando existan.

---

## Para el pitch

### En una frase

Yaku ("agua" en quechua) vigila el agua del norte jujeño con datos satelitales y de modelos meteorológicos, y la traduce a un semáforo de riesgo por zona con un aviso a tiempo: cuando sobra y amenaza con aludes, y cuando falta y seca la Puna.

### Lo que se puede afirmar hoy

- Usa datos reales y abiertos de Open-Meteo: lluvia de los últimos días, lluvia pronosticada y humedad del suelo, por hora y por zona.
- El riesgo se calcula con reglas simples y visibles, sin IA. Cada color viene con su explicación.
- Agregar una zona es agregar una línea en un archivo.
- Todo el código se escribió hoy, durante el hackathon.

### Cómo decirlo

| Decir | No decir |
|---|---|
| "Alerta de riesgo" | "Predecimos aludes", "detectamos aludes" |
| "Datos satelitales y de modelos meteorológicos" | "Imágenes satelitales en vivo" |
| "Umbrales iniciales, todavía sin validar" | "Modelo validado", "calibrado científicamente" |
| "El aviso rojo lo confirma una persona responsable" | "Avisa solo" |

### Datos sin verificar: no ponerlos en diapositivas todavía

- La pendiente de cada cuenca: es una estimación cargada a mano.
- Cualquier cifra de daños o afectados que no esté en las fuentes de `config/eventos.ts`.
- Tiempos de anticipación: el Replay de Volcán 2017 da rojo 20 horas antes solo con "pronóstico perfecto" (usa la lluvia que realmente cayó). Decirlo así o no decir el número.

### Eventos del Replay ya verificados

- Alud del 10/01/2017 en Volcán, Tumbaya y Bárcena, cerca de las 8 de la mañana.
- Crecida del arroyo Huichaira del 6/03/2025 con corte de la Ruta 9. El reanálisis casi no la registra: no usarla como demo principal.

Las fuentes están en `config/eventos.ts`.

### Dato real de hoy, por si sirve

A las 11:21, las 6 zonas de la Quebrada estaban en verde. En Volcán: hasta 8,9 mm de lluvia en 24 horas y humedad del suelo de 0,28 (el amarillo empieza en 15 mm). Estos valores cambian con cada actualización: revisar `/api/estado` antes de presentar.

### Guion sugerido para 3 minutos

1. Problema (30 s): en la Quebrada el agua que sobra baja como alud en horas; en la Puna el agua que falta seca las vegas en meses. El aviso suele llegar tarde o no llegar.
2. Qué es Yaku (30 s): un semáforo por zona que explica su porqué, y un aviso al celular.
3. Demo (90 s): mapa con el semáforo de hoy, ficha de una zona con el porqué, Replay de un evento pasado, y suscripción por Telegram con un aviso de prueba en vivo.
4. Cierre (30 s): para quién es (vecinos, municipios, Defensa Civil, Vialidad, Tren Solar), qué es real y qué falta, y el siguiente paso.

De la demo, hoy solo existe el semáforo por API. El mapa, el Replay y Telegram están pendientes: confirmar en `ESTADO.md` qué llegó antes de armar el guion final.
