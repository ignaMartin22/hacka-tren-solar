# Yaku: sistema de diseño del frontend

Base: el kit de marca de la rama `feat/logo` (`docs/brand/`). Este archivo traduce ese kit a reglas concretas para la interfaz (Tailwind v4 + Leaflet). Si algo de acá choca con `CONTEXT.md`, manda `CONTEXT.md`.

## 1. Principio rector: la marca no compite con el semáforo

La paleta del logo es cálida: rojos, naranjas y ámbar. El semáforo también usa rojo, naranja y amarillo. Si la interfaz se pinta con los colores de la gota, una zona en ROJO se pierde entre los botones.

Reglas:

- **El rojo, el naranja y el amarillo se reservan para el semáforo.** No se usan en botones, links, headers ni decoración.
- **La interfaz es neutra y cálida**: fondo papel, texto marrón oscuro, bordes arena.
- **Terracota** (`#6E180A`) solo para el logotipo y los títulos de marca. Nunca como relleno grande cerca del mapa.
- **El acento interactivo es frío**: Río profundo (`#1B5564`) para botones, links, foco y la zona seleccionada. Es el "agua" de la gota y no se confunde con ningún nivel.
- **El color nunca va solo**: cada nivel se muestra con su palabra en mayúsculas (VERDE, AMARILLO, NARANJA, ROJO, SIN DATO).

## 2. Paleta

### Marca (del kit, valores fijos)

| Token | HEX | Uso en la interfaz |
|---|---|---|
| `terracota` | `#6E180A` | Logotipo, título "Yaku", títulos de sección |
| `arena` | `#F9D4AD` | Logotipo sobre oscuro, fondos de chip suaves |
| `rio` | `#4A98A1` | Acento frío secundario (hover, detalles) |
| `rio-profundo` | `#1B5564` | **Acento interactivo**: botones, links, foco, selección |
| `papel` | `#FFF7EE` | Fondo de la app |
| `noche` | `#140D0C` | Fondo oscuro, texto sobre amarillo y naranja |
| `cumbre`, `naranja`, `ambar`, `salvia`, `musgo`, `arcilla`, `ciruela`, `ciruela-profunda` | ver kit | Solo dentro del logo. `musgo`, `naranja` y `cumbre` se reutilizan en el semáforo (sección 3) |

### Neutros de interfaz (de `docs/brand/index.html`)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `bg` | `#FFF7EE` | `#140D0C` | Fondo de página |
| `bg-2` | `#FBEEDF` | `#1C1311` | Fondos secundarios, notas, pie |
| `card` | `#FFFFFF` | `#1F1513` | Tarjetas, ficha de zona |
| `line` | `#EADBCB` | `#33231F` | Bordes y divisores |
| `fg` | `#2A1A16` | `#F3E6DA` | Texto principal |
| `muted` | `#7A665E` | `#A8968C` | Texto secundario, hora de actualización |
| `chip` | `#F6E6D5` | `#2B1D1A` | Chips, filtros, estados hover suaves |

**Arrancamos solo con el modo claro**: es el que mejor se lee al sol desde el celular. El oscuro queda definido para después; no hace falta implementarlo hoy.

## 3. Semáforo

| Nivel | Fondo | Texto | Contraste | Origen |
|---|---|---|---|---|
| VERDE | `#3C5833` | `#FFFFFF` | 7,97 : 1 | `musgo` del kit |
| AMARILLO | `#E8B517` | `#140D0C` | 10,12 : 1 | nuevo (el kit no tiene amarillo) |
| NARANJA | `#EC7120` | `#140D0C` | 6,36 : 1 | `naranja` del kit |
| ROJO | `#B32814` | `#FFFFFF` | 6,50 : 1 | `cumbre` del kit |
| SIN DATO | `#D9CFC6` | `#2A1A16` | 10,88 : 1 | neutro |

Todos superan AA (4,5 : 1). Los contrastes se calcularon con la fórmula de WCAG 2.

Ojo: amarillo y naranja **nunca** con texto blanco ni sobre el fondo papel como texto suelto (1,8 : 1 y 2,9 : 1). Siempre como relleno con texto `noche` encima.

Para "SIN DATO" (zonas de la Puna con `nivel: null`) se usa además un borde punteado en el marcador, así se distingue de un nivel real sin depender del gris.

Todo esto vive en un solo módulo, `src/niveles.ts`, que exporta por nivel: `etiqueta`, `fondo`, `texto`, `claseBadge` (Tailwind) y una frase corta para la leyenda. El mapa, la ficha, la lista y la leyenda lo importan; nadie repite colores.

Frases de la leyenda (pocas palabras, sin jerga):

- **VERDE**: Sin señales de riesgo.
- **AMARILLO**: Lluvia o suelo húmedo. Estar informados.
- **NARANJA**: Lluvia fuerte y suelo muy húmedo. Estar atentos.
- **ROJO**: Riesgo alto de aludes. Seguir a Defensa Civil.
- **SIN DATO**: Todavía no calculamos el nivel de esta zona.

## 4. Tipografía

Sin fuentes descargadas: la red del tren es lenta y el kit ya usa pilas de sistema.

| Rol | Pila | Uso |
|---|---|---|
| `display` | `ui-rounded, "SF Pro Rounded", "Nunito", "Varela Round", system-ui, sans-serif` | Título "Yaku", nombre de la zona, nivel grande |
| `text` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | Todo lo demás |
| `mono` | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | Números de la vista institucional (mm, m³/m³) |

Escala (mobile first):

| Elemento | Tamaño / peso |
|---|---|
| Nivel en la ficha | 28–32 px, 800, `display`, mayúsculas |
| Nombre de zona | 22–24 px, 700, `display` |
| Títulos de sección | 18 px, 700, `display`, color `terracota` |
| Texto | 16 px, 400, interlineado 1,5 |
| Secundario, hora | 14 px, `muted` |
| Badge de nivel | 12–13 px, 700, mayúsculas, espaciado 0,04em |

Nunca menos de 14 px para texto que haya que leer, ni menos de 12 px para nada.

## 5. Forma y espacio

- Radio: `20px` en tarjetas y ficha, `12px` en elementos internos, `999px` (píldora) en badges, chips y botones.
- Sombra de tarjeta: `0 1px 0 #0000000a, 0 12px 32px -18px #6E180A40`. Una sola sombra, nada de efectos 3D.
- Bordes: 1 px `line`.
- Espaciado en múltiplos de 4 px. Margen lateral de página: 16 px en celular, 24 px en escritorio.
- Objetivo táctil mínimo: 44 × 44 px (marcadores del mapa, botones, ítems de la lista).
- Transiciones cortas: `cubic-bezier(.2,.7,.2,1)`, 150–250 ms. Respetar `prefers-reduced-motion`.

## 6. Layout

- **Celular** (< 768 px): header, mapa (alrededor del 45 % del alto), ficha de la zona elegida, lista de zonas, leyenda y pie.
- **Escritorio** (≥ 768 px): header arriba; mapa a la izquierda (unos 60 %) y a la derecha una columna con la ficha, la lista y la leyenda, con scroll propio.
- **Header**: fondo `papel`, borde inferior `line`, logo horizontal de 28–32 px de alto (≥ 120 px de ancho, el mínimo del kit) y el lema "Alertas satelitales para el agua del norte jujeño" en `muted`. En celular, si no entra, el lema pasa a una segunda línea más chica. El header actual en `sky-900` se reemplaza.
- **Pie**: fondo `bg-2`, texto `muted` de 14 px. Crédito a Open-Meteo, "datos satelitales y de modelos meteorológicos" y "Yaku da una alerta de riesgo, no una predicción. Umbrales iniciales, sin validar".

## 7. Componentes

**Badge de nivel**: píldora con el fondo y el texto del nivel y la palabra en mayúsculas. Es el único lugar donde aparecen los colores del semáforo como relleno, además del marcador del mapa.

**Marcador del mapa** (`L.divIcon` con HTML propio, sin imágenes):

- Círculo de 28 px con el color del nivel, borde de 3 px `papel` y sombra suave. Área táctil de 44 px.
- Debajo, una etiqueta tipo píldora blanca con el nombre de la zona y el nivel en mayúsculas ("Tilcara · VERDE").
- Zona seleccionada: anillo exterior de 3 px `rio-profundo` y el marcador un poco más grande.
- SIN DATO: círculo `#D9CFC6` con borde punteado `muted`.

**Mapa base**: tiles de OpenStreetMap con su atribución. Si el estilo estándar compite con los marcadores, se puede bajar la saturación con CSS (`filter: saturate(.6)`) solo sobre la capa de tiles.

**Ficha de zona** (`card`, radio 20 px):

1. Nombre de la zona (`display`) y debajo "Quebrada · Riesgo de aludes" en `muted`.
2. Bloque de nivel: franja con el color del nivel, la palabra grande y la frase de la leyenda.
3. "Por qué": lista de `motivos[].texto` con un ícono por `codigo`.
4. "Actualizado: 22/11 11:21" en `muted`, siempre visible.

Íconos por `codigo` (SVG inline simple, de trazo, en color `fg`, no del color del nivel):

| `codigo` | Ícono |
|---|---|
| `lluvia_24h`, `lluvia_72h` | nube con gotas |
| `pronostico_24h` | nube con reloj |
| `suelo` | capas de suelo |
| `pendiente` | ladera |
| `sin_alerta` | tilde |

**Lista de zonas**: filas de 48 px o más con el nombre a la izquierda y el badge a la derecha. La fila seleccionada lleva fondo `chip` y una barra izquierda de 3 px `rio-profundo`. Sirve para elegir zona sin apuntar al marcador.

**Botón**: píldora, fondo `rio-profundo` y texto `papel` (7,8 : 1). El secundario lleva fondo `card` con borde `line`. Foco visible: anillo de 2 px `rio-profundo` con 2 px de separación.

**Banner de datos viejos** (cuando `errorUltimaActualizacion` no es null): fondo `bg-2`, borde izquierdo `muted` y el texto "No pudimos actualizar. Mostramos los últimos datos guardados." Sin rojo: rojo es nivel de riesgo, no error de la app.

**Estado de carga**: skeleton con bloques `chip` animados suavemente. Nada de spinners que tapen el mapa.

## 8. Logo y archivos de marca

Traer de `feat/logo` a `frontend/public/` solo lo necesario:

| Archivo del kit | Destino | Uso |
|---|---|---|
| `svg/logo/yaku-horizontal.svg` | `public/brand/yaku-horizontal.svg` | Header |
| `svg/isotipo/yaku-isotipo.svg` | `public/brand/yaku-isotipo.svg` | Estados vacíos, carga |
| `favicon/*` | `public/` | Favicons y manifest (ver `head` en `docs/brand/README.md`) |
| `social/yaku-og-light-1200x630.png` | `public/og.png` | Vista previa al compartir el link |

Reglas del kit: no deformar ni recolorear el logo, el isotipo completo nunca por debajo de 40 px (abajo de eso, el simplificado) y nada de sombras ni efectos.

`theme-color`: `#FFF7EE`.

## 9. Tokens para Tailwind v4

En `src/index.css`:

```css
@import 'tailwindcss';

@theme {
  --color-terracota: #6E180A;
  --color-arena: #F9D4AD;
  --color-rio: #4A98A1;
  --color-rio-profundo: #1B5564;
  --color-papel: #FFF7EE;
  --color-noche: #140D0C;

  --color-bg: #FFF7EE;
  --color-bg-2: #FBEEDF;
  --color-card: #FFFFFF;
  --color-line: #EADBCB;
  --color-fg: #2A1A16;
  --color-muted: #7A665E;
  --color-chip: #F6E6D5;

  --color-nivel-verde: #3C5833;
  --color-nivel-amarillo: #E8B517;
  --color-nivel-naranja: #EC7120;
  --color-nivel-rojo: #B32814;
  --color-nivel-sin-dato: #D9CFC6;

  --font-display: ui-rounded, "SF Pro Rounded", "Nunito", "Varela Round", system-ui, sans-serif;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  --radius-card: 20px;
  --shadow-card: 0 1px 0 #0000000a, 0 12px 32px -18px #6E180A40;
}
```

Con esto quedan clases como `bg-papel`, `text-fg`, `text-muted`, `border-line`, `bg-nivel-rojo`, `font-display`, `rounded-card` y `shadow-card`. Usar estas y no los colores sueltos de Tailwind (`slate-*`, `sky-*`, `green-600`).

## 10. Checklist antes de cada push

- [ ] Ningún nivel se muestra solo con color: siempre con la palabra.
- [ ] Rojo, naranja y amarillo aparecen solo en el semáforo.
- [ ] Se ve la hora de la última actualización.
- [ ] Probado a 360 px de ancho y en escritorio.
- [ ] Texto de 14 px o más; áreas táctiles de 44 px o más.
- [ ] No hay botones de cosas que todavía no funcionan.
