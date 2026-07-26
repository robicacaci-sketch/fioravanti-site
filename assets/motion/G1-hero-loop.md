# G1 — Hero "living studio" loop (spec + prompt)

Flagship clip from `docs/plans/2026-07-19-001-feat-higgsfield-motion-assets-plan.md`.
Everything downstream of the render is already wired (see "Landing" below) — drop the
files in `assets/` with the exact names and the site picks them up on its own.

## Source image

`assets/hidra-light.jpg` — dark bonnet + white light blade (166 KB, already in repo).

## Higgsfield job

- **Mode:** image-to-video
- **Duration:** 6–8 s, seamless loop (first frame ≈ last frame)
- **Camera:** micro dolly-in only, ≤3% push over the whole clip
- **Light:** slow lateral sweep of the white blade, left→right, one pass per loop
- **Hard constraints:** no subject deformation, no added reflections/objects, no text,
  no lens flare bloom, no colour drift off the carbon/white palette

### Prompt (paste as-is)

```
Matte black carbon automotive body panel in a dark studio. A single hard white light
blade sweeps slowly across the surface from left to right, revealing the curvature.
Almost imperceptible dolly-in. Cinematic, macro, high contrast, film grain.
Static subject — the panel does not move or deform. Seamless loop.
```

### Negative prompt

```
warping, morphing, melting surface, extra objects, reflections of people, text,
watermark, logo, colour shift, saturation, fast motion, camera shake, zoom out
```

## Acceptance criteria (reject the render if any fail)

1. Loop point invisible when played `loop` — no jump cut, no fade seam.
2. Panel silhouette identical frame 1 vs last frame (no deformation).
3. Palette stays carbon (#0b0b0c–#2c2c30) + white blade. No stray hue.
4. Reads as studio light, not as "AI shimmer" — if the surface boils, discard.
5. Under budget after encode: ≤3–4 MB per file (see `encode.sh`).

## Deliverables (exact filenames — the site keys off these)

| File                        | Format            |
|-----------------------------|-------------------|
| `assets/hero-loop.mp4`      | H.264, ≤4 MB      |
| `assets/hero-loop.webm`     | VP9, ≤4 MB        |

Poster stays `assets/hidra-light.jpg` — no separate poster file needed.

## Render log — DONE 2026-07-26

- **Model:** Kling v3.0 (`kling3_0`), mode `pro`, sound off, 8 s, 14 credits.
- **Loop trick:** the same media id passed as **both** `start_image` and `end_image` —
  that, not the prompt, is what closes the loop. Job `d29099e1-f469-4bf2-b20f-ed8a7dd484c6`.
- Kling ignores `aspect_ratio` when a start frame is given: output inherits the source
  crop, so the clip is portrait 1288×1608 (hidra-light.jpg is 1440×1798 off IG).
  Fine under `object-fit: cover`; reframe to 16:9 later if the desktop crop bothers us.
- **Measured against the acceptance criteria** (frames decoded at 96×120, mean abs diff
  on 0–255):
  | check | result |
  |---|---|
  | seam frame 0 vs 192 | MAD 0.40, max 5 → invisible |
  | neighbour-frame MAD | mean 0.08, max 0.15 → no surface boil |
  | motion actually present | f0 vs mid MAD 4.87, max 191 (blade lights up) |
  | colour drift | RGB means 38.2/38.5/42.1 → 38.1/38.6/42.1 → none |
- Raw render kept out of the repo; re-downloadable from the job above.

## Encode

```bash
bash assets/motion/encode.sh ~/Downloads/higgsfield-g1-raw.mp4
```

Writes both targets straight into `assets/`, prints the final sizes.

No Homebrew on this machine, so the script falls back to the ffmpeg 7.1 that Remotion
ships (`~/remotion-studio/node_modules/@remotion/compositor-darwin-arm64/ffmpeg`, needs
`DYLD_LIBRARY_PATH` pointed at its own dir — the script does that). It is a **minimal
build**: `scale`, libx264 and libvpx-vp9 work; `select`, `psnr` and the rawvideo/ppm
muxers do **not**, so frame-level QC has to go through PNG output.

G1 landed at **0.46 MB (mp4) / 0.13 MB (webm)** — ~10× under budget, which is why the
defaults are now CRF 18/28 instead of 24/34 (dark gradients band first; override with
`CRF_X264=… CRF_VP9=… bash encode.sh …`).

## Landing (already implemented — no code left to write)

- `js/main.js` HEAD-probes `assets/hero-loop.mp4`. **Missing file → nothing changes**,
  hero stays pure WebGL. Present file → the motion layer is injected over the canvas
  with `mix-blend-mode: screen`, under the veil and copy.
- Mobile (≤720 px) and any WebGL failure: the video becomes the hero background
  outright (`.hero-motion.solo`), canvas hidden.
- `prefers-reduced-motion: reduce`: video never injected, `hidra-light.jpg` stays static.
- Approval gate from the plan is honoured by construction — the clip only appears on the
  site once Roberto himself puts the file in `assets/`.
