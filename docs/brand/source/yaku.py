"""Yaku — geometría maestra del logo (isotipo + logotipo).

Todo el sistema se genera desde acá: un único origen de verdad para
SVG, PNG, PDF, favicons e imágenes sociales.
"""
import json
import math
from pathlib import Path

HERE = Path(__file__).parent

# ---------------------------------------------------------------------------
# Paleta
# ---------------------------------------------------------------------------
PAL_LIGHT = {
    "crest": "#B32814",    # Cumbre
    "ridge": "#7E1208",    # Sombra de cumbre
    "rust": "#C23B12",     # Óxido
    "orange": "#EC7120",   # Naranja quebrada
    "burnt": "#D25313",    # Naranja tostado
    "amber": "#FB8C23",    # Ámbar
    "sand": "#F9D4AD",     # Arena
    "sage": "#6D8053",     # Salvia
    "moss": "#3C5833",     # Musgo
    "clay": "#A6372B",     # Arcilla
    "deepteal": "#1B5564", # Río profundo
    "teal": "#4A98A1",     # Río
    "plum": "#4F2134",     # Ciruela
    "deepplum": "#3B1425", # Ciruela profunda
    "lobe": "#3B1425",
}
# En fondos oscuros las sombras más profundas se funden con el fondo:
# se elevan apenas para conservar la silueta de la gota.
PAL_DARK = dict(PAL_LIGHT, plum="#5A2740", deepplum="#4A1B30", lobe="#4A1B30",
                deepteal="#22667A", ridge="#8A170B")

WORD_LIGHT = "#6E180A"   # Terracota Yaku (logotipo sobre claro)
WORD_DARK = "#F9D4AD"    # Arena (logotipo sobre oscuro)
INK = "#140B09"          # Negro cálido para monocromo
PAPER = "#FFF7EE"        # Blanco cálido
NIGHT = "#140D0C"        # Fondo oscuro de marca

# ---------------------------------------------------------------------------
# Gota (espacio de diseño 540x660; caja ajustada x 10..525, y 12..644.5)
# ---------------------------------------------------------------------------
CX, CY, R = 267.5, 387.0, 257.5
APEX = (267.5, 12.0)
_a = math.acos(R / (CY - APEX[1]))
TL = (CX - R * math.sin(_a), CY - R * math.cos(_a))
TR = (CX + R * math.sin(_a), CY - R * math.cos(_a))
DROP = (f"M{APEX[0]} {APEX[1]}L{TR[0]:.2f} {TR[1]:.2f}"
        f"A{R} {R} 0 1 1 {TL[0]:.2f} {TL[1]:.2f}Z")
DROP_BOX = (10.0, 12.0, 515.0, 632.5)  # x, y, w, h

_B = "L600 720L-60 720Z"
TOPS = {
    "ridge": "M-60 330C40 230 130 120 205 113C245 110 285 140 330 168C380 192 430 204 600 222",
    "orange": "M-60 315L200 163C225 148 245 134 265 133C290 133 315 152 345 186C375 220 410 245 600 262",
    "sand": "M-60 396C70 330 185 233 262 233C318 233 352 282 405 305C440 318 480 318 600 314",
    "sage": "M-60 468C70 400 165 320 240 320C300 320 340 350 390 372C425 383 460 383 600 383",
    "clay": "M-60 568C70 490 200 410 300 404C380 400 470 396 600 394",
}
RIVER = ("M600 381C470 384 330 400 280 425C250 438 238 455 245 476C255 497 290 505 320 512"
         "C350 520 372 542 368 568C365 600 345 625 305 680L390 690C425 640 452 590 452 540"
         "C448 506 420 490 386 480C350 470 320 460 322 446C325 425 360 412 400 402"
         "C450 392 500 386 600 384Z")

LAYERS_FULL = [
    ("crest", "M-60 -20H600V720H-60Z"),
    ("ridge", TOPS["ridge"] + _B),
    ("orange", TOPS["orange"] + _B),
    ("amber", "M150 360C220 280 262 216 320 216C368 216 405 246 465 251C500 253 540 250 600 250" + _B),
    ("burnt", "M-60 345C50 290 150 222 215 219C245 218 262 234 285 262L320 720L-60 720Z"),
    ("sand", TOPS["sand"] + _B),
    ("sage", TOPS["sage"] + _B),
    ("moss", "M-60 460C50 418 135 380 205 380C258 380 300 400 380 460L380 720L-60 720Z"),
    ("clay", TOPS["clay"] + _B),
    ("deepteal", "M600 383C480 383 335 391 282 410C232 428 190 456 193 480C196 500 208 505 215 510L60 680L60 720H600Z"),
    ("plum", "M440 387L600 387V720H360L380 610L400 560L380 520L320 490L290 450L300 420L380 404Z"),
    ("deepplum", "M385 540C388 498 412 470 460 461C492 455 525 458 600 460V720H400Z"),
    ("lobe", "M80 610L100 585C140 555 185 518 225 510C258 504 282 540 272 566C262 590 210 608 160 621C130 629 100 630 80 620Z"),
    ("teal", RIVER),
]

# Versión simplificada para tamaños chicos (≤ 48 px): menos estratos,
# río más ancho, sin degradados. Se lee como gota + río incluso a 16 px.
RIVER_BOLD = ("M600 372C470 378 320 392 268 420C232 440 222 462 232 486C245 512 290 518 318 526"
              "C345 534 360 552 356 578C352 610 330 640 290 690L410 700C445 640 470 600 468 552"
              "C465 505 430 486 392 474C356 463 335 455 338 444C342 430 370 420 410 410"
              "C460 398 510 392 600 390Z")
LAYERS_SIMPLE = [
    ("crest", "M-60 -20H600V720H-60Z"),
    ("orange", "M-60 300C60 220 180 135 265 135C330 135 380 200 600 245" + _B),
    ("sand", "M-60 396C70 320 185 236 262 236C330 236 380 300 600 310" + _B),
    ("sage", "M-60 470C70 400 165 330 240 330C320 330 380 372 600 380" + _B),
    ("clay", "M-60 568C70 490 200 410 300 404C380 400 470 396 600 394" + _B),
    ("plum", "M420 380H600V720H330Z"),
    ("teal", RIVER_BOLD),
]

_WM = json.loads((HERE / "wordmark.json").read_text())
WORD_D, WORD_W, WORD_H = _WM["d"], _WM["w"], _WM["h"]


def _fmt(v):
    return f"{v:.3f}".rstrip("0").rstrip(".")


def drop_g(uid, x, y, h, pal=PAL_LIGHT, layers=None, simple=False):
    """Gota a color, esquina sup-izq de su caja en (x, y), alto h."""
    layers = layers or (LAYERS_SIMPLE if simple else LAYERS_FULL)
    bx, by, bw, bh = DROP_BOX
    s = h / bh
    defs = (f'<clipPath id="{uid}-c"><path d="{DROP}"/></clipPath>'
            f'<linearGradient id="{uid}-g" x1="238" x2="300" y1="0" y2="0" gradientUnits="userSpaceOnUse">'
            f'<stop offset="0" stop-color="{pal["ridge"]}"/><stop offset="1" stop-color="{pal["rust"]}"/>'
            f'</linearGradient>')
    paths = "".join(
        f'<path fill="{f"url(#{uid}-g)" if n == "ridge" else pal[n]}" d="{d}"/>' for n, d in layers)
    g = (f'<g transform="translate({_fmt(x)} {_fmt(y)}) scale({_fmt(s)}) translate({-bx} {-by})">'
         f'<g clip-path="url(#{uid}-c)">{paths}</g></g>')
    return defs, g


def drop_mono_g(uid, x, y, h, fill):
    """Gota monocromática: silueta con río y estratos calados (negativo)."""
    bx, by, bw, bh = DROP_BOX
    s = h / bh
    lines = "".join(f'<path d="{TOPS[k]}" fill="none" stroke="#000" stroke-width="15" stroke-linecap="round"/>'
                    for k in ("orange", "sand", "sage"))
    defs = (f'<mask id="{uid}-m" maskUnits="userSpaceOnUse" x="0" y="0" width="540" height="660">'
            f'<path d="{DROP}" fill="#fff"/>{lines}<path d="{RIVER}" fill="#000"/></mask>')
    g = (f'<g transform="translate({_fmt(x)} {_fmt(y)}) scale({_fmt(s)}) translate({-bx} {-by})">'
         f'<path d="{DROP}" fill="{fill}" mask="url(#{uid}-m)"/></g>')
    return defs, g


def word_g(x, y, h, fill):
    s = h / WORD_H
    return (f'<g transform="translate({_fmt(x)} {_fmt(y)}) scale({_fmt(s)})">'
            f'<path fill="{fill}" d="{WORD_D}"/></g>')


def svg(w, h, defs, body, title="Yaku", bg=None, extra_attr=""):
    bgr = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {_fmt(w)} {_fmt(h)}" '
            f'width="{_fmt(w)}" height="{_fmt(h)}" role="img" aria-label="{title}"{extra_attr}>'
            f'<title>{title}</title><defs>{defs}</defs>{bgr}{body}</svg>\n')


# ---------------------------------------------------------------------------
# Composiciones
# ---------------------------------------------------------------------------
GAP_H = 72      # separación gota–logotipo (antes 38: muy apretado)
WORD_TOP = 150  # alineación vertical del logotipo respecto de la gota


def _mark(uid, mode, x, y, h, simple=False):
    if mode == "color":
        return drop_g(uid, x, y, h, PAL_LIGHT, simple=simple)
    if mode == "color-dark":
        return drop_g(uid, x, y, h, PAL_DARK, simple=simple)
    return drop_mono_g(uid, x, y, h, mode)


def horizontal(mode="color", word=WORD_LIGHT, uid="yh"):
    dh = DROP_BOX[3]
    dw = DROP_BOX[2]
    W = dw + GAP_H + WORD_W
    d, g = _mark(uid, mode, 0, 0, dh)
    return svg(W, dh, d, g + word_g(dw + GAP_H, WORD_TOP, WORD_H, word), "Yaku")


def stacked(mode="color", word=WORD_LIGHT, uid="ys"):
    ww = 1060.0
    wh = WORD_H * ww / WORD_W
    dh, dw = DROP_BOX[3], DROP_BOX[2]
    gap = 96
    W = ww
    H = dh + gap + wh
    d, g = _mark(uid, mode, (W - dw) / 2, 0, dh)
    return svg(W, H, d, g + word_g(0, dh + gap, wh, word), "Yaku")


def isotipo(mode="color", uid="yi", square=False, simple=False):
    dh, dw = DROP_BOX[3], DROP_BOX[2]
    if square:
        S = 660.0
        d, g = _mark(uid, mode, (S - dw * 640 / dh) / 2, (S - 640) / 2, 640, simple)
        return svg(S, S, d, g, "Yaku")
    d, g = _mark(uid, mode, 0, 0, dh, simple)
    return svg(dw, dh, d, g, "Yaku")


def wordmark(fill=WORD_LIGHT):
    return svg(WORD_W, WORD_H, "", word_g(0, 0, WORD_H, fill), "Yaku")


def app_icon(theme="light", size=1024, maskable=False, uid="yic", simple=False, rounded=True):
    bg = PAPER if theme == "light" else NIGHT
    pal = PAL_LIGHT if theme == "light" else PAL_DARK
    dh = size * (0.56 if maskable else 0.66)
    dw = dh * DROP_BOX[2] / DROP_BOX[3]
    x = (size - dw) / 2
    y = (size - dh) / 2 - size * 0.012  # compensación óptica: masa visual abajo
    d, g = drop_g(uid, x, y, dh, pal, simple=simple)
    if maskable or not rounded:
        bgel = f'<rect width="{size}" height="{size}" fill="{bg}"/>'
    else:
        r = size * 0.225
        stroke = '' if theme == "light" else ''
        bgel = f'<rect width="{size}" height="{size}" rx="{_fmt(r)}" fill="{bg}"{stroke}/>'
    return svg(size, size, d, bgel + g, "Yaku")


def strata_bar(x, y, w, h, pal=PAL_LIGHT):
    """Recurso gráfico: barra de estratos con la paleta de la gota."""
    keys = ["crest", "orange", "amber", "sand", "sage", "clay", "teal", "plum"]
    sw = w / len(keys)
    return "".join(f'<rect x="{_fmt(x + i * sw)}" y="{_fmt(y)}" width="{_fmt(sw + 0.5)}" height="{_fmt(h)}" fill="{pal[k]}"/>'
                   for i, k in enumerate(keys))


def hills_bg(W, H, theme, top=None):
    """Ondas suaves de fondo (eco del paisaje de la gota), muy sutiles."""
    if theme == "light":
        cols = ["#FBE3C9", "#F8D5B3", "#F3C39C"]
        op = 1
    else:
        cols = ["#1E1412", "#251715", "#2D1A17"]
        op = 1
    out = []
    for i, c in enumerate(cols):
        base = max(top if top is not None else 0, H * 0.80)
        yb = base + (H - base) * 0.30 * i + H * 0.06
        amp = min(H * 0.05, (H - base) * 0.35)
        out.append(
            f'<path fill="{c}" opacity="{op}" d="M0 {_fmt(yb)}C{_fmt(W*0.22)} {_fmt(yb-amp)} {_fmt(W*0.38)} {_fmt(yb-amp*1.4)} '
            f'{_fmt(W*0.55)} {_fmt(yb-amp*0.6)}C{_fmt(W*0.72)} {_fmt(yb+amp*0.2)} {_fmt(W*0.86)} {_fmt(yb-amp*0.5)} '
            f'{_fmt(W)} {_fmt(yb-amp*0.9)}V{_fmt(H)}H0Z"/>')
    return "".join(out)


def social(W, H, theme="light", logo_w=None, uid="yso", bar=True):
    bg = PAPER if theme == "light" else NIGHT
    word = WORD_LIGHT if theme == "light" else WORD_DARK
    pal = PAL_LIGHT if theme == "light" else PAL_DARK
    lw = logo_w or W * 0.56
    full_w = DROP_BOX[2] + GAP_H + WORD_W
    s = lw / full_w
    lh = DROP_BOX[3] * s
    x = (W - lw) / 2
    y = (H - lh) / 2 - (H * 0.03 if bar else 0)
    d, g = drop_g(uid, x, y, lh, pal)
    wg = word_g(x + (DROP_BOX[2] + GAP_H) * s, y + WORD_TOP * s, WORD_H * s, word)
    body = f'<rect width="{W}" height="{H}" fill="{bg}"/>' + hills_bg(W, H, theme, y + lh + H * 0.02) + g + wg
    if bar:
        body += strata_bar(0, H - H * 0.018, W, H * 0.018, pal)
    return svg(W, H, d, body, "Yaku")
