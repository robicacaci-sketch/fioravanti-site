# feat: Higgsfield motion assets for fioravanti-site

**Status:** blocked on Higgsfield MCP connection (not visible in current session — connect via claude.ai connectors or `claude mcp add`, then execute).
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

## Engineering constraints
- Format: H.264 MP4 + WebM VP9 dual-encode, each ≤3–4 MB, 720–1080p; lazy-load via IntersectionObserver
- GitHub Pages budget: keep total added weight <20 MB
- `prefers-reduced-motion` → all videos replaced by current stills
- Film v2: drop G2/G4 clips into Remotion scenes (`@remotion/media` Video), re-render `film.mp4`

## Approval gates
- Friend sign-off on ANY AI motion applied to archive photos of real people (G2) before publish
- Roberto picks G1 vs keep-pure-WebGL after seeing first render
