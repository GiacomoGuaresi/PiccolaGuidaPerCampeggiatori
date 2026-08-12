#!/usr/bin/env python3
"""
Genera lo sfondo decorativo del sito (dietro la preview della scheda),
in stile "doodle sparsi" come lo sfondo di default di WhatsApp, ma a tema
montagna/campeggio.

Le icone sono scaricate da Pictogrammers Material Design Icons (MIT license,
https://pictogrammers.com/library/mdi/), raster­izzate e ricolorate, poi
sparse in modo casuale (seed fisso per risultato riproducibile) su un tile
che va in repeat seamless.

Uso:
    python3 scripts/generate_background.py

Output:
    assets/img/bg-pattern.png

Rilancia lo script (eventualmente cambiando ICONS, SEED, COLOR, OPACITY_RANGE...)
per rigenerare lo sfondo se serve aggiornarlo.
"""

import io
import random
import urllib.request
from pathlib import Path

import cairosvg
from PIL import Image

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT / "scripts" / ".icon_cache"
OUTPUT_PATH = ROOT / "assets" / "img" / "bg-pattern.png"

MDI_RAW_URL = "https://raw.githubusercontent.com/Templarian/MaterialDesign/master/svg/{name}.svg"

# Icone a tema montagna/campeggio disponibili in MDI (Pictogrammers).
ICONS = [
    "pine-tree",
    "image-filter-hdr",  # profilo di montagna
    "terrain",
    "tent",
    "campfire",
    "compass-outline",
    "hiking",
    "water",
    "paw",
    "binoculars",
    "weather-sunny",
    "weather-partly-cloudy",
    "map-marker",
    "fish",
    "bird",
    "shoe-print",
    "snowflake",
    "carabiner",
    "summit",
    "walk",
    "waves",
]

TILE_SIZE = 900          # px del tile seamless (risoluzione di generazione)
DISPLAY_SIZE = 260        # px a cui il tile verra' mostrato in CSS (background-size)
ICON_COUNT = 270           # numero di icone sparse per tile
ROTATION_RANGE = (-30, 30)    # gradi

# La maggior parte delle icone resta piccola (come l'originale); solo una
# minoranza diventa un'icona "grande" (fino a ~4x), tenuta pero' molto piu'
# trasparente cosi' da restare un accento sullo sfondo e non un blob pieno.
BIG_ICON_PROBABILITY = 0.10
SIZE_SMALL_RANGE = (55, 108)     # px, icone "normali"
SIZE_BIG_RANGE = (110, 216)     # px, fino a ~4x le icone normali
OPACITY_SMALL_RANGE = (0.14, 0.32)  # alpha delle icone piccole, variabile per icona
OPACITY_BIG_RANGE = (0.05, 0.13)    # alpha ridotta per le icone grandi (solo accento)

# Palette di colori "caldi" coerente con lo stile del sito (assets/css/style.css :root),
# un colore diverso viene scelto a caso per ogni icona.
COLOR_PALETTE = [
    (46, 59, 34),    # --color-forest
    (52, 82, 56),    # --color-forest-dark
    (90, 110, 66),   # --color-moss
    (91, 69, 48),    # --color-bark
    (178, 80, 46),   # --color-clay
    (131, 127, 109),  # --color-stone
]

RASTER_ICON_PX = 256      # risoluzione di rasterizzazione base (qualita')
SEED = 20260812           # seed fisso: rigenerando lo script da' lo stesso risultato


def fetch_svg(name: str) -> bytes:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"{name}.svg"
    if cache_file.exists():
        return cache_file.read_bytes()
    url = MDI_RAW_URL.format(name=name)
    with urllib.request.urlopen(url, timeout=20) as resp:
        data = resp.read()
    cache_file.write_bytes(data)
    return data


def rasterize_alpha(svg_bytes: bytes, size: int) -> Image.Image:
    """Rasterizza l'svg (icona piena, di solito nera) tenendo solo la sua
    sagoma (canale alpha): il colore viene applicato in seguito, per
    istanza, cosi' la stessa icona puo' comparire con colori diversi."""
    png_bytes = cairosvg.svg2png(bytestring=svg_bytes, output_width=size, output_height=size)
    return Image.open(io.BytesIO(png_bytes)).convert("RGBA")


def build_icon_set():
    """Scarica e rasterizza ogni icona una volta sola (ad alta risoluzione),
    da riusare (colorata/ridimensionata/ruotata) per ogni istanza sparsa sul tile."""
    icons = {}
    for name in ICONS:
        svg_bytes = fetch_svg(name)
        icons[name] = rasterize_alpha(svg_bytes, RASTER_ICON_PX)
    return icons


def colorize_with_opacity(icon: Image.Image, color: tuple, opacity: float) -> Image.Image:
    """Applica un colore e un'opacita' scelti a caso, usando la sagoma
    originale (canale alpha) dell'icona come maschera."""
    alpha = icon.getchannel("A").point(lambda a: int(a * opacity))
    solid = Image.new("RGBA", icon.size, color + (0,))
    solid.putalpha(alpha)
    return solid


def main():
    rng = random.Random(SEED)
    icon_set = build_icon_set()

    canvas = Image.new("RGBA", (TILE_SIZE, TILE_SIZE), (0, 0, 0, 0))

    for _ in range(ICON_COUNT):
        name = rng.choice(ICONS)
        base_icon = icon_set[name]

        color = rng.choice(COLOR_PALETTE)
        if rng.random() < BIG_ICON_PROBABILITY:
            size = rng.randint(*SIZE_BIG_RANGE)
            opacity = rng.uniform(*OPACITY_BIG_RANGE)
        else:
            size = rng.randint(*SIZE_SMALL_RANGE)
            opacity = rng.uniform(*OPACITY_SMALL_RANGE)
        angle = rng.uniform(*ROTATION_RANGE)

        icon = colorize_with_opacity(base_icon, color, opacity)
        icon = icon.resize((size, size), Image.LANCZOS)
        icon = icon.rotate(angle, expand=True, resample=Image.BICUBIC)

        cx = rng.uniform(0, TILE_SIZE)
        cy = rng.uniform(0, TILE_SIZE)

        # Disegna l'icona (e le copie wrap-around sui bordi) per ottenere
        # un tile seamless quando viene ripetuto in CSS.
        for dx in (-TILE_SIZE, 0, TILE_SIZE):
            for dy in (-TILE_SIZE, 0, TILE_SIZE):
                x = cx + dx - icon.width / 2
                y = cy + dy - icon.height / 2
                if x + icon.width < 0 or x > TILE_SIZE or y + icon.height < 0 or y > TILE_SIZE:
                    continue
                canvas.alpha_composite(icon, (int(x), int(y)))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUTPUT_PATH, "PNG")
    print(f"Salvato {OUTPUT_PATH} ({TILE_SIZE}x{TILE_SIZE}px, mostrare in CSS a {DISPLAY_SIZE}px)")


if __name__ == "__main__":
    main()
