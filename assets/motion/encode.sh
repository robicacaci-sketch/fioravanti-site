#!/usr/bin/env bash
# Dual-encode a Higgsfield render into the site's two web targets.
#
#   bash assets/motion/encode.sh <raw-render.mp4> [basename]
#
# Defaults to basename "hero-loop" (G1). Writes assets/<basename>.mp4 + .webm,
# strips audio, caps height at 1080, and reports the final sizes against the
# 3–4 MB per-file budget from the motion plan.

set -euo pipefail

SRC=${1:?usage: encode.sh <raw-render.mp4> [basename]}
BASE=${2:-hero-loop}
OUT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"   # -> assets/
BUDGET_MB=4

# ffmpeg: system install if present, else the one Remotion ships (no Homebrew on this
# machine). The bundled build is a minimal ffmpeg 7.1 — it has libx264 + libvpx-vp9 and
# scale, which is all this script uses, but needs DYLD_LIBRARY_PATH set to its own dir.
REMOTION_FF="$HOME/remotion-studio/node_modules/@remotion/compositor-darwin-arm64"
if command -v ffmpeg >/dev/null; then
  FFMPEG=ffmpeg
elif [ -x "$REMOTION_FF/ffmpeg" ]; then
  FFMPEG="$REMOTION_FF/ffmpeg"
  export DYLD_LIBRARY_PATH="$REMOTION_FF${DYLD_LIBRARY_PATH:+:$DYLD_LIBRARY_PATH}"
else
  echo "ffmpeg not found — brew install ffmpeg"; exit 1
fi
[ -f "$SRC" ] || { echo "no such file: $SRC"; exit 1; }

SCALE="scale=-2:'min(1080,ih)'"

# Quality knobs. G1 came in ~20x under the 4 MB budget at the original 24/34, so the
# defaults now buy back quality (dark gradients band first). Raise them if a future
# clip busts the budget: CRF_X264=28 CRF_VP9=38 bash encode.sh …
CRF_X264=${CRF_X264:-18}
CRF_VP9=${CRF_VP9:-28}

echo "→ H.264  $OUT_DIR/$BASE.mp4"
"$FFMPEG" -y -loglevel error -i "$SRC" \
  -an -vf "$SCALE" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf "$CRF_X264" -preset slow -movflags +faststart \
  "$OUT_DIR/$BASE.mp4"

echo "→ VP9    $OUT_DIR/$BASE.webm"
"$FFMPEG" -y -loglevel error -i "$SRC" \
  -an -vf "$SCALE" \
  -c:v libvpx-vp9 -crf "$CRF_VP9" -b:v 0 -row-mt 1 \
  "$OUT_DIR/$BASE.webm"

echo
for f in "$OUT_DIR/$BASE.mp4" "$OUT_DIR/$BASE.webm"; do
  bytes=$(wc -c <"$f")
  mb=$(echo "scale=2; $bytes/1048576" | bc)
  if [ "$bytes" -gt $((BUDGET_MB * 1048576)) ]; then
    echo "  $(basename "$f")  ${mb} MB  ✗ over ${BUDGET_MB} MB — raise -crf (28 / 38) and re-run"
  else
    echo "  $(basename "$f")  ${mb} MB  ✓"
  fi
done
