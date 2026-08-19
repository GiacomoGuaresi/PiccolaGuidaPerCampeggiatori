#!/usr/bin/env bash
# Rigenera tutte le icone del sito a partire da assets/favicon.svg.
# Serve ImageMagick (`brew install imagemagick`). Da lanciare dalla root:
#   ./scripts/generate_icons.sh
#
# Output:
#   assets/favicon.ico                  16+32+48 px, per i browser vecchi e i preferiti
#   assets/icons/favicon-16.png         tab del browser
#   assets/icons/favicon-32.png         tab in schermo hidpi
#   assets/icons/apple-touch-icon.png   180 px, schermata Home iOS (niente trasparenza)
#   assets/icons/icon-192.png           icona PWA
#   assets/icons/icon-512.png           icona PWA / splash
#   assets/icons/icon-maskable-512.png  icona adattiva Android (safe zone)
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="assets/favicon.svg"
OUT="assets/icons"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

magick_svg() { # sorgente, dimensione, destinazione, [flatten color]
  local src="$1" size="$2" dest="$3" bg="${4:-none}"
  if [ "$bg" = "none" ]; then
    magick -background none -density 512 "$src" -resize "${size}x${size}" "$dest"
  else
    magick -background "$bg" -density 512 "$src" -resize "${size}x${size}" -flatten "$dest"
  fi
}

mkdir -p "$OUT"

# Variante "maskable": Android ritaglia le icone adattive (cerchio, goccia,
# squircle...), quindi il logo va rimpicciolito dentro la safe zone dell'80%
# e lo sfondo deve riempire tutto il quadrato, senza angoli arrotondati.
sed -e 's/ rx="12"//' \
    -e 's|<path d="M32 12 L54 50|<g transform="translate(32 32) scale(0.72) translate(-32 -32)"><path d="M32 12 L54 50|' \
    -e 's|</svg>|</g></svg>|' "$SRC" > "$TMP/maskable.svg"

# Variante per le dimensioni piccole: a 16 px il filo di cresta chiaro
# (stroke da 2) diventa fango, quindi lo si toglie.
grep -v 'stroke-width="2"' "$SRC" > "$TMP/small.svg"

magick_svg "$TMP/small.svg" 16 "$OUT/favicon-16.png"
magick_svg "$TMP/small.svg" 32 "$OUT/favicon-32.png"
magick_svg "$SRC" 192 "$OUT/icon-192.png"
magick_svg "$SRC" 512 "$OUT/icon-512.png"
magick_svg "$TMP/maskable.svg" 512 "$OUT/icon-maskable-512.png"
# iOS ignora la trasparenza e mette il nero dietro: si appiattisce su pergamena.
magick_svg "$TMP/maskable.svg" 180 "$OUT/apple-touch-icon.png" "#ece3cf"

# .ico multi-risoluzione (16/32/48) per i browser che ignorano l'SVG.
magick_svg "$TMP/small.svg" 48 "$TMP/ico-48.png"
magick "$OUT/favicon-16.png" "$OUT/favicon-32.png" "$TMP/ico-48.png" assets/favicon.ico

echo "Icone rigenerate:"
ls -l assets/favicon.ico "$OUT"
