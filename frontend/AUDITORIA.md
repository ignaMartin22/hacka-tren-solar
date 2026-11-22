# Auditoría del frontend — 22/11/2026

Alcance: `frontend/` en `feat/frontend` tras integrar T1–T6. Revisado contra `frontend/DESIGN.md` (sección 10 y reglas generales), `CONTEXT.md` (honestidad) y la guía de `EQUIPO.md`.

## Resumen

- **Bloqueantes abiertos: 0.**
- Importantes: 9 encontrados, todos corregidos en esta integración.
- Menores: 6 quedan anotados (ninguno bloquea).
- `pnpm --filter yaku-frontend build` y `pnpm typecheck` en verde.

## Bloqueante

Ninguno.

## Importante — corregidos

| # | Hallazgo | Archivo | Estado |
|---|---|---|---|
| 1 | El overlay del selector de capa satelital y el esqueleto del mapa quedaban **debajo** de los paneles de Leaflet (los paneles usan z-index 400–700, controles 1000): los botones existían en el DOM pero no se veían ni se podían tocar. | `src/componentes/MapaZonas.tsx:144`, `src/App.tsx:113` | Corregido con `z-[1000]` y comentario explicativo. Verificado en capturas: botones "Ninguna / Lluvia / Vegetación" visibles. |
| 2 | Línea de tiempo del Replay: un punto de color por día **sin la palabra del nivel** ("el color nunca va solo", DESIGN.md §1). | `src/replay/PantallaReplay.tsx` | Corregido: `BadgeNivel` con el peor nivel del día junto a la fecha (`PantallaReplay.tsx:231`). Los puntos conservan `aria-label` completo. |
| 3 | Teclado del Replay: la barra espaciadora con foco en un botón ejecutaba el handler global **y** el click del botón (doble toggle); flechas también se disparaban con foco en controles. | `src/replay/PantallaReplay.tsx:79-88` | Corregido: se ignoran `BUTTON`/`A` además de inputs. |
| 4 | El mock del Replay importaba `evaluarAludes` y `ZONAS` del backend → código del backend en el bundle del frontend y dependencia implícita. | `src/mocks/replay.ts` | Corregido: el evento quedó como **datos ya calculados** (generados una vez con el motor). El frontend ya no importa nada de `backend/` con valor (solo `import type`). |
| 5 | Ruta desconocida (`#/cualquier-cosa`) renderizaba un `main` vacío. | `src/App.tsx:35` | Corregido: rutas no reconocidas caen en `#/`. |
| 6 | Colores hex sueltos en el gráfico de tendencia (duplicaban tokens y niveles fuera de `niveles.ts`/tokens). | `src/componentes/GraficoTendencia.tsx` | Corregido: todos los `fill`/`stroke` usan `var(--color-*)`. El `fill` de las píldoras de nivel ya salía de `estiloNivel().fondo`. |
| 7 | `BadgeNivel` estaba duplicado en Replay e Institucional (3 copias del mismo componente). | `src/replay/PantallaReplay.tsx`, `src/institucional/PantallaInstitucional.tsx` | Corregido: ambas usan `componentes/BadgeNivel.tsx`. |
| 8 | Las pantallas de suscripción e institucional traían su propio `Encabezado`/`Pie` → al integrarlas bajo el hash routing se duplicaban header y pie. | `src/suscripcion/PantallaSuscripcion.tsx`, `src/institucional/PantallaInstitucional.tsx` | Corregido: el marco lo da `App` una sola vez. |
| 9 | Demos sueltos (`replay-demo.html`, `suscripcion-demo.html`, `institucional-demo.html` y sus `demo.tsx`) quedaban servidos fuera del routing. | `frontend/` | Corregido: borrados; las pantallas viven en `#/replay`, `#/suscribirse`, `#/institucional`. |

## Menor — quedan abiertos (anotados)

| # | Hallazgo | Archivo | Nota |
|---|---|---|---|
| 1 | Las etiquetas píldora de los marcadores se **solapan** en el cluster de la Quebrada (6 zonas muy juntas a zoom de encuadre). | `src/componentes/MapaZonas.tsx` | Se leen parcialmente; al acercar se separan. Mejora posible: ocultar etiquetas a zoom bajo o desplazarlas. |
| 2 | `GraficoTendencia` abrevia los niveles como VER/AMA/NAR/ROJ/S-D en las píldoras bajo cada día. | `src/componentes/GraficoTendencia.tsx:12,93` | Revisado y **aceptado**: la palabra completa no entra en 34 px; cada píldora lleva `<title>` con el nombre y el `aria-label` del gráfico enumera "nivel VERDE" por día. El figcaption explica "el nivel de riesgo". |
| 3 | La línea de tiempo del Replay muestra la barra de scroll nativa en móvil (el menú del header la oculta, esta no). | `src/replay/PantallaReplay.tsx:179` | Cosmético; el scroll es funcional. |
| 4 | `en franjas vacías` arriba/abajo del mapa en viewports muy altos (p. ej. 768 px con panel lateral bajo): `fitBounds` centra la franja norte-sur de zonas. | `src/componentes/MapaZonas.tsx` | Cosmético; los tiles fuera del mundo no se dibujan. |
| 5 | Mocks y pantallas con flag se **incluyen en el bundle** de producción aunque no se rendericen (`import` estático). | `src/App.tsx`, `src/mocks/*` | No se muestran (las rutas caen en `#/` y la tendencia no se monta); se podría separar con `import()` dinámico si el peso importa. |
| 6 | `institucional/api.ts` importa `AVISOS_EJEMPLO` siempre (también cuando `INSTITUCIONAL_DISPONIBLE` pase a true). | `src/institucional/api.ts:5` | Cuando el backend exista, conviene cargar el mock solo en el branch de ejemplo. |

## Verificado correcto (sin hallazgos)

**Diseño (DESIGN.md §10 y reglas)**
- Rojo/naranja/amarillo solo dentro del semáforo (badges, franja de nivel, píldoras del gráfico, puntos del replay): la interfaz usa neutros + `rio-profundo` para lo interactivo. Sin `slate/sky/green-*` en ningún archivo (verificado por búsqueda).
- El color nunca va solo tras el arreglo #2: niveles siempre con palabra (badge, franja VERDE, píldoras VER/AMA con `<title>`, puntos del replay acompañados por el badge del día y `aria-label`).
- Texto ≥ 14 px en contenido; 12–13 px solo en badges/chips/leyenda secundaria (permitido). Táctil ≥ 44 px: marcadores (44 px), filas de lista (`min-h-12`), botones (`min-h-11`), radios de suscripción, enlaces del menú, botones del replay, selector de capa.
- Tokens en todo (búsqueda de hex fuera de `niveles.ts`/mocks/`capaSatelital.ts`: limpio tras el arreglo #6).

**Mobile first** — capturas con Edge headless (360 px vía iframe temporal, borrado después):
- `#/` a 360 / 768 / 1280: header + menú scrolleable, mapa arriba (45dvh) / a la izquierda, ficha, lista, leyenda y pie; sin scroll horizontal de página (el menú y la línea de tiempo scrollean por diseño).
- `#/replay` a 360 / 768 / 1280: controles, línea de tiempo scrolleable, tarjetas por zona, "Datos de ejemplo" visible.
- `#/suscribirse` a 360 / 768 / 1280: radios por zona ≥ 44 px, aviso honesto sin bot configurado.
- `#/institucional` a 360 / 768 / 1280: login con "Modo de ejemplo: sin seguridad real".

**Accesibilidad**
- Foco visible global (`:focus-visible` anillo `rio-profundo`); navegación por teclado: marcadores del mapa son focuseables (`keyboard: true`, Enter selecciona) con `aria-label` "Volcán, nivel VERDE" (verificado en DOM); lista con `aria-pressed`; menú con `aria-current`; línea de tiempo con `aria-current="date"` y `aria-label` por día; diálogo de confirmación es `<dialog>` nativo (atrapa foco, Escape cierra, `aria-labelledby`); Replay con teclas flecha/espacio y `aria-live` en la fecha; `lang="es"`; logos con `alt` correcto (vacío cuando es decorativo).
- Contraste: niveles AA según DESIGN.md §3; texto `muted` solo para secundario.

**Honestidad (CONTEXT.md §5 y §13)**
- Sin "predecimos"/"detectamos" en la interfaz; el pie dice "alerta de riesgo, no una predicción" + "datos satelitales y de modelos meteorológicos" + crédito a Open-Meteo en todas las pantallas.
- Datos de ejemplo marcados: "Datos de ejemplo" en tendencia y replay, "Modo de ejemplo: sin seguridad real" en institucional, evento de replay con fechas de 2099 y descripción que lo aclara; mocks con el comentario "DATOS DE EJEMPLO, NO REALES".
- Sin botones de cosas que no funcionan en producción: pantallas de ejemplo tras flags `VITE_MOSTRAR_*` (default: dev sí, producción no, `src/funciones.ts` + `frontend/.env.example`); suscripción sin bot configurado avisa "todavía no está disponible" en vez de mostrar un botón roto.

**Correctitud**
- Ciclo de vida Leaflet: el mapa se crea una vez (guard contra doble-montaje de StrictMode), `mapa.remove()` + `ResizeObserver.disconnect()` al desmontar, marcadores sincronizados por `zonaId`, `fitBounds` solo cuando cambia el encuadre, `invalidateSize` al cambiar el tamaño, capa GIBS se agrega/quita entera en el efecto con cleanup.
- Intervalos/listeners limpiados: `setInterval` + `visibilitychange` en `useEstado`, `setTimeout` y `keydown` en Replay, `hashchange` en el router; promesas con guardia `vivo` contra actualizaciones tras desmontar.
- Errores de red: primera carga fallida → tarjeta con "Reintentar"; refresco fallido con datos → `BannerDatosViejos` neutro conservando los datos; `errorUltimaActualizacion` → mismo banner.
- Fechas: `datosDe` (UTC) → hora local `dd/mm hh:mm`; fechas `YYYY-MM-DD` del replay parseadas al mediodía local para no correr el día.
- `nivel: null`: marcador punteado, "SIN DATO" con su frase, aviso de la zona visible, `S/D` en el gráfico, resumen del replay que contempla días sin alerta.
- Sin dependencias nuevas (`frontend/package.json` sin cambios respecto a `feat/frontend`); tipos del backend solo con `import type`.
