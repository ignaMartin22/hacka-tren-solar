"""Genera el brand kit completo de Yaku en ../out/brand"""
import json
import shutil
import subprocess
from pathlib import Path

from PIL import Image

import yaku as Y

import sys
# Uso: python3 build.py [carpeta_destino]  (por defecto: la carpeta brand/ que contiene source/)
ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent


def w(rel, content):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content)
    return p


def png(src, rel, width=None, height=None, bg=None):
    out = ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["rsvg-convert", str(src), "-o", str(out)]
    if width:
        cmd += ["-w", str(width)]
    if height:
        cmd += ["-h", str(height)]
    if bg:
        cmd += ["-b", bg]
    subprocess.run(cmd, check=True)
    return out


def pdf(src, rel):
    out = ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["rsvg-convert", "-f", "pdf", str(src), "-o", str(out)], check=True)


def webp(src_png, rel, lossless=True):
    out = ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    Image.open(src_png).save(out, "WEBP", lossless=lossless, quality=92, method=6)


def jpg(src_png, rel):
    out = ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    Image.open(src_png).convert("RGB").save(out, "JPEG", quality=92, optimize=True, progressive=True)


# ---------------------------------------------------------------------------
# 1. SVG maestros
# ---------------------------------------------------------------------------
S = {}
S["h-light"] = w("svg/logo/yaku-horizontal.svg", Y.horizontal("color", Y.WORD_LIGHT, "yh"))
S["h-dark"] = w("svg/logo/yaku-horizontal-dark.svg", Y.horizontal("color-dark", Y.WORD_DARK, "yhd"))
S["s-light"] = w("svg/logo/yaku-stacked.svg", Y.stacked("color", Y.WORD_LIGHT, "ys"))
S["s-dark"] = w("svg/logo/yaku-stacked-dark.svg", Y.stacked("color-dark", Y.WORD_DARK, "ysd"))

S["i-light"] = w("svg/isotipo/yaku-isotipo.svg", Y.isotipo("color", "yi"))
S["i-dark"] = w("svg/isotipo/yaku-isotipo-dark.svg", Y.isotipo("color-dark", "yid"))
S["i-sq"] = w("svg/isotipo/yaku-isotipo-square.svg", Y.isotipo("color", "yiq", square=True))
S["i-sq-dark"] = w("svg/isotipo/yaku-isotipo-square-dark.svg", Y.isotipo("color-dark", "yiqd", square=True))
S["i-simple"] = w("svg/isotipo/yaku-isotipo-simple.svg", Y.isotipo("color", "yis", square=True, simple=True))
S["i-simple-dark"] = w("svg/isotipo/yaku-isotipo-simple-dark.svg",
                       Y.isotipo("color-dark", "yisd", square=True, simple=True))

S["w-light"] = w("svg/wordmark/yaku-wordmark.svg", Y.wordmark(Y.WORD_LIGHT))
S["w-dark"] = w("svg/wordmark/yaku-wordmark-dark.svg", Y.wordmark(Y.WORD_DARK))

MONO = {"black": Y.INK, "white": "#FFFFFF", "brand": Y.WORD_LIGHT, "sand": Y.WORD_DARK}
for name, c in MONO.items():
    S[f"mh-{name}"] = w(f"svg/mono/yaku-horizontal-mono-{name}.svg", Y.horizontal(c, c, f"mh{name}"))
    S[f"ms-{name}"] = w(f"svg/mono/yaku-stacked-mono-{name}.svg", Y.stacked(c, c, f"ms{name}"))
    S[f"mi-{name}"] = w(f"svg/mono/yaku-isotipo-mono-{name}.svg", Y.isotipo(c, f"mi{name}"))
    S[f"mw-{name}"] = w(f"svg/mono/yaku-wordmark-mono-{name}.svg", Y.wordmark(c))

S["icon-light"] = w("svg/app-icon/yaku-icon-light.svg", Y.app_icon("light", 1024, uid="yicl"))
S["icon-dark"] = w("svg/app-icon/yaku-icon-dark.svg", Y.app_icon("dark", 1024, uid="yicd"))
S["mask-light"] = w("svg/app-icon/yaku-icon-maskable-light.svg", Y.app_icon("light", 1024, True, "yml"))
S["mask-dark"] = w("svg/app-icon/yaku-icon-maskable-dark.svg", Y.app_icon("dark", 1024, True, "ymd"))

# ---------------------------------------------------------------------------
# 2. PNG en todos los tamaños
# ---------------------------------------------------------------------------
for t in ("light", "dark"):
    for px in (256, 512, 1024, 2048, 4096):
        png(S[f"h-{t}"], f"png/horizontal/{t}/yaku-horizontal-{t}-{px}w.png", width=px)
    for px in (256, 512, 1024, 2048):
        png(S[f"s-{t}"], f"png/stacked/{t}/yaku-stacked-{t}-{px}w.png", width=px)
        png(S[f"w-{t}"], f"png/wordmark/{t}/yaku-wordmark-{t}-{px}w.png", width=px)
    for px in (16, 24, 32, 48, 64, 96, 128, 192, 256, 512, 1024, 2048):
        src = S["i-simple" if t == "light" else "i-simple-dark"] if px <= 32 else S["i-sq" if t == "light" else "i-sq-dark"]
        png(src, f"png/isotipo/{t}/yaku-isotipo-{t}-{px}.png", width=px)
    for px in (64, 128, 256, 512, 1024):
        png(S[f"icon-{t}"], f"png/app-icon/{t}/yaku-icon-{t}-{px}.png", width=px)

for name in MONO:
    png(S[f"mh-{name}"], f"png/mono/{name}/yaku-horizontal-mono-{name}-1024w.png", width=1024)
    png(S[f"mh-{name}"], f"png/mono/{name}/yaku-horizontal-mono-{name}-2048w.png", width=2048)
    png(S[f"ms-{name}"], f"png/mono/{name}/yaku-stacked-mono-{name}-1024w.png", width=1024)
    png(S[f"mi-{name}"], f"png/mono/{name}/yaku-isotipo-mono-{name}-512h.png", height=512)
    png(S[f"mw-{name}"], f"png/mono/{name}/yaku-wordmark-mono-{name}-1024w.png", width=1024)

# ---------------------------------------------------------------------------
# 3. WebP (web) y PDF (impresión, vectorial)
# ---------------------------------------------------------------------------
for t in ("light", "dark"):
    for px in (512, 1024, 2048):
        webp(ROOT / f"png/horizontal/{t}/yaku-horizontal-{t}-{px}w.png", f"webp/yaku-horizontal-{t}-{px}w.webp")
    webp(ROOT / f"png/stacked/{t}/yaku-stacked-{t}-1024w.png", f"webp/yaku-stacked-{t}-1024w.webp")
    webp(ROOT / f"png/isotipo/{t}/yaku-isotipo-{t}-512.png", f"webp/yaku-isotipo-{t}-512.webp")

for key, name in [("h-light", "yaku-horizontal"), ("h-dark", "yaku-horizontal-dark"),
                  ("s-light", "yaku-stacked"), ("s-dark", "yaku-stacked-dark"),
                  ("i-light", "yaku-isotipo"), ("w-light", "yaku-wordmark"),
                  ("mh-black", "yaku-horizontal-mono-black"), ("mi-black", "yaku-isotipo-mono-black")]:
    pdf(S[key], f"pdf/{name}.pdf")

# ---------------------------------------------------------------------------
# 4. Favicons + manifest
# ---------------------------------------------------------------------------
fav = ROOT / "favicon"
fav.mkdir(parents=True, exist_ok=True)
for px in (16, 32, 48):
    png(S["i-simple"], f"favicon/favicon-{px}x{px}.png", width=px)
subprocess.run(["convert", str(fav / "favicon-16x16.png"), str(fav / "favicon-32x32.png"),
                str(fav / "favicon-48x48.png"), str(fav / "favicon.ico")], check=True)
S["apple"] = w("svg/app-icon/yaku-icon-apple.svg", Y.app_icon("light", 1024, uid="yap", rounded=False))
png(S["apple"], "favicon/apple-touch-icon.png", width=180)  # iOS no admite transparencia
png(S["icon-light"], "favicon/android-chrome-192x192.png", width=192)
png(S["icon-light"], "favicon/android-chrome-512x512.png", width=512)
png(S["mask-light"], "favicon/maskable-192x192.png", width=192)
png(S["mask-light"], "favicon/maskable-512x512.png", width=512)
png(S["icon-light"], "favicon/mstile-150x150.png", width=150)

# favicon.svg adaptativo: eleva las sombras cuando la pestaña está en modo oscuro
fsvg = Y.isotipo("color", "f", square=True)
style = ("<style>@media (prefers-color-scheme: dark){"
         f'path[fill="{Y.PAL_LIGHT["plum"]}"]{{fill:{Y.PAL_DARK["plum"]}}}'
         f'path[fill="{Y.PAL_LIGHT["deepplum"]}"]{{fill:{Y.PAL_DARK["deepplum"]}}}'
         f'path[fill="{Y.PAL_LIGHT["deepteal"]}"]{{fill:{Y.PAL_DARK["deepteal"]}}}'
         "}</style>")
fsvg = fsvg.replace("<defs>", style + "<defs>", 1)
w("favicon/favicon.svg", fsvg)
w("favicon/safari-pinned-tab.svg", Y.isotipo("#000000", "sp", square=True))
manifest = {
    "name": "Yaku", "short_name": "Yaku",
    "icons": [
        {"src": "android-chrome-192x192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "android-chrome-512x512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "maskable-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
        {"src": "maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
    "theme_color": Y.WORD_LIGHT, "background_color": Y.PAPER, "display": "standalone",
}
w("favicon/site.webmanifest", json.dumps(manifest, indent=2) + "\n")
w("favicon/browserconfig.xml",
  '<?xml version="1.0" encoding="utf-8"?>\n<browserconfig><msapplication><tile>'
  f'<square150x150logo src="mstile-150x150.png"/><TileColor>{Y.WORD_LIGHT}</TileColor>'
  '</tile></msapplication></browserconfig>\n')

# ---------------------------------------------------------------------------
# 5. Imágenes sociales y banners
# ---------------------------------------------------------------------------
for t in ("light", "dark"):
    s1 = w(f"social/svg/yaku-og-{t}.svg", Y.social(1200, 630, t, uid=f"og{t}"))
    p1 = png(s1, f"social/yaku-og-{t}-1200x630.png", width=1200)
    jpg(p1, f"social/yaku-og-{t}-1200x630.jpg")
    s2 = w(f"social/svg/yaku-github-social-{t}.svg", Y.social(1280, 640, t, uid=f"gh{t}"))
    p2 = png(s2, f"social/yaku-github-social-{t}-1280x640.png", width=1280)
    jpg(p2, f"social/yaku-github-social-{t}-1280x640.jpg")
    s3 = w(f"social/svg/yaku-banner-{t}.svg", Y.social(1280, 320, t, logo_w=620, uid=f"bn{t}"))
    png(s3, f"social/yaku-banner-{t}-1280x320.png", width=1280)
    png(s3, f"social/yaku-banner-{t}-2560x640.png", width=2560)
    s4 = w(f"social/svg/yaku-avatar-{t}.svg", Y.app_icon(t, 1024, maskable=True, uid=f"av{t}"))
    png(s4, f"social/yaku-avatar-{t}-500x500.png", width=500)
    png(s4, f"social/yaku-avatar-{t}-1024x1024.png", width=1024)

print("ok", sum(1 for _ in ROOT.rglob("*") if _.is_file()))

# ---------------------------------------------------------------------------
# 6. Guía: paleta, área de resguardo, tamaños mínimos
# ---------------------------------------------------------------------------
FONT = "Inter, 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif"
SW = [("Terracota Yaku", Y.WORD_LIGHT, "Logotipo"), ("Cumbre", "#B32814", "Gota"),
      ("Naranja quebrada", "#EC7120", "Gota"), ("Ámbar", "#FB8C23", "Gota"),
      ("Arena", "#F9D4AD", "Logotipo oscuro"), ("Salvia", "#6D8053", "Gota"),
      ("Musgo", "#3C5833", "Gota"), ("Arcilla", "#A6372B", "Gota"),
      ("Río", "#4A98A1", "Gota"), ("Río profundo", "#1B5564", "Gota"),
      ("Ciruela", "#4F2134", "Gota"), ("Ciruela profunda", "#3B1425", "Gota")]


def hex2rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def lum(h):
    def ch(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(c) for c in hex2rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def palette_svg(theme):
    bg = Y.PAPER if theme == "light" else Y.NIGHT
    fg = "#2A1A16" if theme == "light" else "#F3E6DA"
    mu = "#7A665E" if theme == "light" else "#A8968C"
    cols, cw, ch, gap, pad = 4, 300, 200, 20, 40
    rows = (len(SW) + cols - 1) // cols
    W = pad * 2 + cols * cw + (cols - 1) * gap
    H = pad * 2 + rows * ch + (rows - 1) * gap
    out = [f'<rect width="{W}" height="{H}" rx="28" fill="{bg}"/>']
    for i, (name, hx, use) in enumerate(SW):
        x = pad + (i % cols) * (cw + gap)
        y = pad + (i // cols) * (ch + gap)
        r, g, b = hex2rgb(hx)
        stroke = ' stroke="#00000014"' if theme == "light" else ' stroke="#FFFFFF14"'
        out.append(f'<rect x="{x}" y="{y}" width="{cw}" height="120" rx="16" fill="{hx}"{stroke}/>')
        out.append(f'<text x="{x + 4}" y="{y + 150}" font-family="{FONT}" font-size="20" font-weight="700" fill="{fg}">{name}</text>')
        out.append(f'<text x="{x + 4}" y="{y + 176}" font-family="{FONT}" font-size="16" fill="{mu}">{hx} · RGB {r} {g} {b}</text>')
    return Y.svg(W, H, "", "".join(out), "Paleta Yaku")


for t in ("light", "dark"):
    p = w(f"guide/yaku-palette-{t}.svg", palette_svg(t))
    png(p, f"guide/yaku-palette-{t}.png", width=1320)


def clearspace_svg():
    dh, dw = Y.DROP_BOX[3], Y.DROP_BOX[2]
    X = dh / 4  # unidad de resguardo = 1/4 del alto de la gota
    lw = dw + Y.GAP_H + Y.WORD_W
    pad = X * 1.9
    W, H = lw + pad * 2, dh + pad * 2 + X * 0.45
    d, g = Y.drop_g("cs", pad, pad, dh)
    wg = Y.word_g(pad + dw + Y.GAP_H, pad + Y.WORD_TOP, Y.WORD_H, Y.WORD_LIGHT)
    acc = "#C23B12"
    zone = (f'<rect x="{pad - X}" y="{pad - X}" width="{lw + 2 * X}" height="{dh + 2 * X}" fill="#C23B1210" '
            f'stroke="{acc}" stroke-width="4" stroke-dasharray="18 12"/>'
            f'<rect x="{pad}" y="{pad}" width="{lw}" height="{dh}" fill="none" stroke="{acc}" stroke-opacity=".35" stroke-width="2"/>')
    marks = ""
    # cotas X en los 4 lados
    for (x1, y1, x2, y2, tx, ty) in [
        (pad - X, pad + dh / 2, pad, pad + dh / 2, pad - X / 2, pad + dh / 2 - 18),
        (pad + lw, pad + dh / 2, pad + lw + X, pad + dh / 2, pad + lw + X / 2, pad + dh / 2 - 18),
        (pad + lw / 2, pad - X, pad + lw / 2, pad, pad + lw / 2 + 30, pad - X / 2 + 12),
        (pad + lw / 2, pad + dh, pad + lw / 2, pad + dh + X, pad + lw / 2 + 30, pad + dh + X / 2 + 12),
    ]:
        marks += (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{acc}" stroke-width="4"/>'
                  f'<text x="{tx}" y="{ty}" text-anchor="middle" font-family="{FONT}" font-size="44" '
                  f'font-weight="700" fill="{acc}">X</text>')
    # definición de X sobre la gota
    marks += (f'<line x1="{pad - 30}" y1="{pad}" x2="{pad - 30}" y2="{pad + X}" stroke="#2A1A16" stroke-width="5"/>'
              f'<line x1="{pad - 44}" y1="{pad}" x2="{pad - 16}" y2="{pad}" stroke="#2A1A16" stroke-width="5"/>'
              f'<line x1="{pad - 44}" y1="{pad + X}" x2="{pad - 16}" y2="{pad + X}" stroke="#2A1A16" stroke-width="5"/>'
              f'<text x="{W / 2}" y="{H - X * 0.55}" text-anchor="middle" font-family="{FONT}" font-size="42" '
              f'fill="#2A1A16">X = ¼ del alto de la gota  ·  ningún elemento debe invadir la zona punteada</text>')
    body = f'<rect width="{W}" height="{H}" fill="{Y.PAPER}"/>' + zone + g + wg + marks
    return Y.svg(W, H, d, body, "Área de resguardo")


p = w("guide/yaku-clearspace.svg", clearspace_svg())
png(p, "guide/yaku-clearspace.png", width=1600)

print("guide ok")
