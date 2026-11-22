# YAKU: contexto para el asistente de código

Este archivo es para el asistente de código (Fable/Devin) que va a construir el proyecto. Después de vos, otras personas del equipo siguen el trabajo, así que dejá todo claro y documentado. Leelo completo antes de escribir código.

## 1. Contexto y plazo

- Evento: Cursor Hackathon Jujuy, domingo 22/11/2026, de 8:30 a 20:30, a bordo del Tren Solar (Volcán, Jujuy).
- Tracks: cultura de Jujuy, problemas sociales del norte y telemetría espacial. Yaku apunta a problemas sociales del norte y telemetría espacial.
- Hay que entregar hoy. Prioridad absoluta: que funcione, que sea simple y que se pueda demostrar en 3 minutos. Nada de experimentos.
- La entrega final pide repo, demo desplegada con link público y un video o demo corta. Dejá tiempo al final para deploy y pitch.

## 2. Reglas del proyecto (obligatorias)

1. **Todo el código se escribe hoy, en este repo.** No clones, copies ni pegues código de otros proyectos o repos previos del equipo (Dengue Centinela, Pachamapa). Podés usar patrones generales que ya conocés, pero escribí todo de nuevo.
2. **Commits chicos y frecuentes, con push** cada vez que algo funcione. Mensajes claros. Así queda registro de que el trabajo se hizo hoy.
3. **Mantené `ESTADO.md` al día** (hecho, en curso, pendiente, problemas). Otras personas retoman desde ahí.
4. **Sin secretos en el repo.** Usá `.env` y dejá un `.env.example` con los nombres de las variables.
5. **Honestidad en la interfaz y el README.** Decí de dónde salen los datos. Aclarar qué es simulado o precalculado. No decir "predecimos aludes": Yaku da una alerta de riesgo, no una predicción ni una detección confirmada.
6. **No cambies el stack** ni agregues tecnologías nuevas sin una razón fuerte. Usá `pnpm`; si da cualquier problema, pasá a `npm` sin discutir.
7. **Antes de escribir código, devolvé un plan corto** (5 a 10 líneas) con qué vas a hacer primero. Después arrancá.
8. El README debe decir que el proyecto se construyó durante el hackathon y que Dengue Centinela y Pachamapa son ideas previas del equipo, sin código reutilizado.

## 3. Qué es Yaku

*Yaku* significa "agua" en quechua. Yaku es una plataforma web que vigila el agua del norte jujeño con datos satelitales y de modelos, y la traduce a un **semáforo de riesgo por zona** más un **aviso a tiempo**. Vigila dos amenazas que son la misma: el agua.

| | Agua que sobra: ALUDES | Agua que falta: SEQUÍA |
|---|---|---|
| Dónde | Quebrada de Humahuaca (Volcán, Tumbaya, Purmamarca, Maimará, Tilcara, Humahuaca) | Puna y zonas altas (vegas, pastoreo) |
| Qué la dispara | Lluvia intensa sobre suelo ya mojado y pendiente fuerte | Meses con menos lluvia de lo normal |
| Velocidad | Horas o días | Semanas o meses |
| Se mira | Cada pocas horas | Una vez por semana |

Usuarios: vecinos y comunidades (aviso en el celular), municipios y comisionados, Defensa Civil y Vialidad (mapa completo y confirmación de alertas), productores de la Puna y la operación del Tren Solar.

Cada color del semáforo debe poder explicarse con un "porque": por ejemplo, "Rojo porque llovieron 48 mm en 24 horas y el suelo ya estaba saturado". Eso es lo que diferencia a Yaku de una caja negra.

## 4. Alcance

**Imprescindible (MVP):**
1. Mapa de zonas (5 o 6 cuencas de la Quebrada cargadas a mano, más 2 puntos de Puna para sequía), cada una pintada con su color.
2. Ficha de zona al tocarla: nivel actual, el "por qué" en lenguaje simple, tendencia de los últimos 7 días y hora de la última actualización.
3. Motor de riesgo con reglas simples (sección 6), recalculado por una tarea programada.
4. Modo Replay: reproduce día por día un evento real pasado y muestra cómo el semáforo se ponía rojo antes (sección 7). Es el arma principal de la demo.
5. Avisos por bot de Telegram funcionando en vivo, con suscripción por zona (sección 8).
6. Vista institucional con login simple y botón para confirmar y enviar el aviso rojo.
7. Historial de avisos: cuándo, a qué zona, qué nivel y a cuántas personas.

**Importante:** página pública mínima para suscribirse (elegir zona y Telegram o mail), y una capa satelital real en el mapa (sección 5).

**Suma puntos (solo si sobra tiempo):** vista de la traza del Tren Solar con tramos en riesgo, y panel de sequía con gráfico mensual.

**Fuera de alcance hoy:** IA o modelos de machine learning, imágenes satelitales crudas, WhatsApp, SMS, app móvil nativa, integración formal con Defensa Civil.

## 5. Datos (todo abierto y gratuito)

Usá servicios que ya entregan datos procesados. No descargues imágenes satelitales crudas.

- **Open-Meteo** (sin clave): lluvia pasada y pronosticada, y humedad del suelo, por coordenada.
  - Pronóstico: `https://api.open-meteo.com/v1/forecast`. Soporta `past_days` y varias coordenadas en una sola llamada (separadas por coma).
  - Histórico (ERA5): `https://archive-api.open-meteo.com/v1/archive`.
  - **Leé la documentación oficial** (open-meteo.com/en/docs y /en/docs/historical-weather-api) para los nombres exactos de las variables de humedad del suelo: son distintos entre pronóstico e histórico. No los asumas de memoria.
  - Pedí todas las zonas en una sola llamada y guardá el resultado en la base para no depender de la API en la demo.
  - Dar crédito a Open-Meteo en el pie de la página.
- **Capa satelital real (prioridad media):** NASA GIBS (tiles WMTS gratuitos, sin clave). Probá una capa de precipitación satelital (IMERG) o de vegetación (MODIS NDVI) como overlay de Leaflet. Verificá los identificadores de capa en el GetCapabilities de GIBS; no los inventes.
- **Pendiente:** por ahora se carga a mano por cuenca (alta, media o baja) en el archivo de configuración. Mejorable después con un modelo de elevación.
- **Honestidad sobre la fuente:** la lluvia y la humedad del suelo de Open-Meteo vienen de modelos y reanálisis que asimilan datos satelitales. En la interfaz escribí "datos satelitales y de modelos meteorológicos". No digas que todo es imagen satelital directa.

### Zonas iniciales (coordenadas aproximadas: verificalas y ajustalas)

Quebrada (aludes): Volcán (-23.92, -65.47), Tumbaya (-23.86, -65.47), Purmamarca (-23.74, -65.50), Maimará (-23.62, -65.40), Tilcara (-23.58, -65.40), Humahuaca (-23.20, -65.35).
Puna (sequía): Abra Pampa (-22.72, -65.70) y Susques (-23.40, -66.37).
Las zonas viven en un archivo de datos (por ejemplo `config/zonas.ts` o `.json`): agregar una zona debe ser agregar una entrada, sin tocar la lógica.

## 6. Motor de riesgo (reglas simples, sin IA)

Todos los umbrales viven en un único archivo de configuración (`config/riesgo.ts`) para poder ajustarlos rápido. **Los valores de abajo son iniciales y no están validados científicamente.**

### Aludes (se recalcula cada pocas horas)

Variables por zona: `lluvia_24h` (máxima lluvia acumulada en una ventana de 24 h dentro de las últimas 24 h y las próximas 24 h, mezclando observado y pronóstico), `lluvia_72h` (observada), `suelo` (humedad del suelo promedio de las capas superiores, en m3/m3) y `pendiente` (alta, media o baja, cargada a mano).

| Nivel | Regla inicial |
|---|---|
| Rojo | (`lluvia_24h` >= 45 mm y `suelo` >= 0,35) o `lluvia_72h` >= 90 mm |
| Naranja | `lluvia_24h` >= 25 mm y `suelo` >= 0,30 y pendiente media o alta |
| Amarillo | `lluvia_24h` >= 15 mm, o `suelo` >= 0,30 con pronóstico >= 5 mm |
| Verde | ninguna de las anteriores |

Cada resultado guarda la lista de motivos que lo activaron, para mostrar el "por qué".

### Sequía (se recalcula una vez por semana)

Indicador: lluvia acumulada de los últimos 90 días dividida por el promedio histórico del mismo período (por ejemplo 1991 a 2020, con el endpoint histórico).

| Nivel | Cociente |
|---|---|
| Verde | >= 0,8 |
| Amarillo | 0,6 a 0,8 |
| Naranja | 0,4 a 0,6 |
| Rojo | < 0,4 |

Cuidado: en la Puna la época seca (aprox. mayo a octubre) tiene lluvia casi nula, y el cociente se vuelve inestable. Calculalo solo si el promedio histórico del período supera un mínimo (por ejemplo 20 mm); si no, mostrá "época seca, sin dato". El indicador de vegetación (NDVI) queda como mejora, no como requisito.

## 7. Modo Replay

- Elegir 1 o 2 eventos reales pasados de la Quebrada. Candidatos: el alud de Volcán del 10/01/2017 y las crecidas de marzo de 2025 (Huichaira, Sococha, El Perchel). **Hay que verificar las fechas y los datos antes de presentarlos.**
- Con el endpoint histórico de Open-Meteo, ejecutá el mismo motor día por día (de unos 7 días antes hasta el día del evento) y guardá el resultado como JSON precalculado en el repo.
- La pantalla reproduce la secuencia: verde, amarillo, naranja, rojo, y marca el día del evento.
- Los umbrales iniciales se pueden afinar con estos 1 o 2 eventos. Si lo hacés, **decilo en el README**: están calibrados con pocos casos y no validados.

## 8. Avisos

- **Telegram (bot)**: es el canal de la demo. Gratis y sin trámites. Comandos: `/start`, elegir zona, `/zonas`, `/baja`. En producción, usá webhook (el servicio gratuito de Render se duerme y el polling se corta).
- **Email**: para Defensa Civil, Vialidad y el Tren (resumen o aviso).
- WhatsApp y SMS: solo mencionarlos como siguiente paso, no construirlos.

| Nivel | Defensa Civil o municipio | Vecinos suscriptos |
|---|---|---|
| Amarillo | aviso automático | no se envía (se ve en el mapa) |
| Naranja | aviso automático | aviso automático: "estar atentos" |
| Rojo | aviso automático y pedido de confirmación | se envía cuando una persona responsable lo confirma desde el panel |

Reglas: mensajes cortos (qué pasa, dónde y qué hacer), siempre con una acción concreta, máximo un aviso por zona y por nivel cada cierto número de horas, solo avisar cuando el nivel **sube**, y avisar también el fin de alerta. Cada persona elige su zona.

Ejemplo de formato: `YAKU · NARANJA · Tumbaya` / "Lluvias fuertes y suelo muy húmedo en la zona. Hay riesgo de aludes en las próximas 24 h. Evitá cruzar ríos y quebradas. Seguí las indicaciones de Defensa Civil."

## 9. Interfaz

- Mobile first (la mayoría lo abre desde el celular, a veces con mala señal), pocas palabras y cero jerga ("suelo saturado" sí, "NDWI" no).
- El color nunca es la única señal: el texto también dice el nivel (por daltonismo y pantallas al sol).
- Mostrar siempre la fecha y hora de la última actualización.
- Dos vistas con el mismo sistema: **pública** (mapa simplificado, nivel por zona y suscripción) e **institucional** (con login: detalle técnico, historial y el botón de confirmar y enviar).
- Pantalla principal: mapa a la izquierda y ficha de zona a la derecha en escritorio; en celular, mapa arriba y ficha abajo.
- Marca: nombre **Yaku**, lema "Alertas satelitales para el agua del norte jujeño".

## 10. Stack (decidido)

Un solo lenguaje en todo el proyecto: **TypeScript**.

- Frontend: React + Vite + TypeScript + Tailwind + Leaflet.
- Backend: Node.js 20+ con Express (o Fastify) en TypeScript. Una tarea programada actualiza los datos y recalcula el semáforo.
- Base de datos: Postgres (Neon) con Prisma. Tablas mínimas: zonas, lecturas, niveles, suscriptores y avisos.
- Bot: Telegram con una librería estándar (grammY o Telegraf).
- Deploy: Vercel (frontend) y Render (backend).
- Tareas programadas: el servicio gratuito de Render se duerme. Dejá un endpoint protegido con un secreto (por ejemplo `/api/jobs/run`) y llamalo desde un cron externo (cron-job.org o GitHub Actions) además del cron interno.
- Estructura sugerida: `backend/`, `frontend/`, `config/` (zonas y umbrales), `data/replay/` (JSON de los eventos), `ESTADO.md`, `README.md`.

## 11. Orden de trabajo

1. Plan corto, estructura del repo, primer commit y proyecto base andando.
2. Archivo de zonas, servicio que consulta Open-Meteo para todas las zonas y guarda lecturas.
3. Motor de riesgo (aludes) con los motivos, y endpoint de estado por zona.
4. Mapa con zonas pintadas, ficha de zona, fecha de actualización.
5. Bot de Telegram con suscripción por zona y avisos; vista institucional con login y confirmación del rojo.
6. Modo Replay con el primer evento.
7. Sequía y capa satelital de GIBS.
8. Deploy con link público, prueba desde un celular y README final.
9. Lo que sobre: traza del Tren Solar, panel de sequía.

## 12. Cuándo está terminado

- Hay un link público que se puede navegar desde el celular.
- El mapa muestra el semáforo con datos reales de hoy y la hora de actualización.
- El Replay muestra un evento pasado con la secuencia de colores.
- Una persona escanea un QR o abre el bot, se suscribe a una zona y recibe un aviso de prueba en su Telegram en el momento.
- El README explica qué es, de dónde salen los datos, qué es precalculado o simulado, las limitaciones y que el proyecto se hizo durante el hackathon.
- `ESTADO.md` actualizado.

## 13. Qué no hacer

- No uses IA ni machine learning para el riesgo.
- No descargues ni proceses imágenes satelitales crudas.
- No cambies de lenguaje ni de framework.
- No reutilices código de proyectos anteriores.
- No inventes datos, eventos, fechas ni identificadores de capas: verificá o marcá como pendiente.
- No prometas en la interfaz lo que la demo no hace.
