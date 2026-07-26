# feat: Higgsfield motion assets for fioravanti-site

**Status 2026-07-26:** **G1, G3 and G5 DONE** — all three rendered on Kling v3.0 through the
Higgsfield MCP, QC'd, dual-encoded and live in `assets/`. G2 is deliberately still open (it
needs the friend's sign-off — those are photographs of real people). G4/G6 not started.
~67 credits left; 8 s pro clip = 14 credits, 5 s = 8.75.

| Step | Files | Render |
|---|---|---|
| G1 | `hero-loop.{mp4,webm}` 0.46 / 0.13 MB | `d29099e1-f469-4bf2-b20f-ed8a7dd484c6`, 8 s pro |
| G3 | `sketch-loop.{mp4,webm}` 0.57 / 0.17 MB | `b547e0a8-b95e-4c6f-9b06-6fea090cf2f1`, 5 s pro |
| G5 | `manifesto-loop.{mp4,webm}` 2.19 / 0.53 MB | `d9333309-e6e1-4445-8965-5906da92fff2`, 5 s pro, off a `nano_banana_pro` carbon plate (`1243677c-87c6-4b74-89bc-ecc19c78a411`) |

Recipe that makes these loop: pass the **same media id as both `start_image` and `end_image`**.
Measured seams: G1 MAD 0.40, G3 0.51, G5 0.46 (0–255 scale) — all invisible in playback.
G3 was prompted for drift-and-light only, explicitly *not* redrawing strokes, because the
collage is full of real handwriting and title blocks that any redraw would mangle.
**Visual thesis (unchanged):** paper/ink editorial + dark carbon studio; motion must feel like archive footage and studio light, never "AI slop".

## Generation queue (ordered by wow-per-megabyte)

### G1 — Hero "living studio" loop  ⭐ flagship
- **Input:** `assets/hidra-light.jpg` (dark bonnet + white light blade)
- **Higgsfield:** image-to-video, slow lateral light sweep + micro dolly-in, 6–8s seamless loop, no subject deformation
- **Lands:** hero `<video>` layer behind/instead of Three.js canvas on mobile + as `poster` upgrade; desktop keeps WebGL + video blended (`mix-blend-mode: screen`)

### G2 — Heritage cinemagraphs (×2)
- **Input:** `era-ferrari.jpg`, `era-concept.jpg`
- **Higgsfield:** micro-motion only — light shift, film-grain flicker, gentle 2–3% push-in; **faces frozen** (real people — no face animation, friend must approve)
- **Lands:** timeline `era-media` — `<video muted loop playsinline>` starts when card scrolls into view; poster = current jpg; reduced-motion → static

### G3 — Sketch comes alive
- **Input:** `sketch-collage.jpg` or `era-dino.jpg`
- **Higgsfield:** ink/pencil strokes animating, drawing-in-progress feel, 5s
- **Lands:** LA RICERCA section background, replaces static pan; pairs with existing SVG stroke-draw

### G4 — LF1 hillside motion
- **Input:** `era-lf1.jpg`
- **Higgsfield:** cinematic orbit/crash-zoom preset toward car, sky drift, 5–6s
- **Lands:** film v2 scene S6 (Remotion `<Video>`) + optional OGGI card hover

### G5 — Manifesto carbon loop
- **Input:** text-to-video: "matte black carbon automotive surface, single white light blade sweeping, studio dark, macro"
- **Lands:** manifesto section bg (currently static hidra) — subtle, 40% opacity

### G6 — IG reel pack (deferred with 9:16 film)
- 9:16 crops of G1/G4 for the friend's stories

## How a clip reaches the page

`js/main.js` has one `motionSlot(host, name, className)` helper. It HEADs
`assets/<name>.mp4`, and only if that answers 200 does it build a muted/looping/inline
`<video>` with the webm+mp4 pair, hand it to a shared IntersectionObserver (200 px margin)
that loads and plays it on approach and pauses it on exit, and register it with the
`visibilitychange` handler. Reduced motion short-circuits the whole thing. So: drop the
two files in `assets/` under the name in `assets/ASSETS.md` and the slot lights up; delete
them and the page is exactly what it was.

## Engineering constraints
- Format: H.264 MP4 + WebM VP9 dual-encode, each ≤3–4 MB, 720–1080p; lazy-load via IntersectionObserver
- GitHub Pages budget: keep total added weight <20 MB
- `prefers-reduced-motion` → all videos replaced by current stills
- Film v2: drop G2/G4 clips into Remotion scenes (`@remotion/media` Video), re-render `film.mp4`

## Approval gates
- Friend sign-off on ANY AI motion applied to archive photos of real people (G2) before publish
- Roberto picks G1 vs keep-pure-WebGL after seeing first render
