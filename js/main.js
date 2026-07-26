/* FIORAVANTI — studio draft
   Hero: Three.js dark studio, curved body-panel surface + sweeping light blade.
   Scroll: GSAP ScrollTrigger — horizontal heritage rail, self-drawing sketch,
   manifesto reveal. Image slots swap in real photos from assets/ when present,
   motion slots swap in Higgsfield clips from assets/ when present. */

import * as THREE from "three";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const narrow = window.matchMedia("(max-width: 720px)");

/* One refresh per burst instead of one per asset that lands. */
let refreshPending = false;
function refreshTriggers() {
  if (refreshPending) return;
  refreshPending = true;
  requestAnimationFrame(() => {
    refreshPending = false;
    ScrollTrigger.refresh();
  });
}

/* ---------------- Motion slots ----------------
   A motion slot hosts a Higgsfield clip (see docs/plans/2026-07-19-001). Nothing is
   requested until the file is confirmed present AND the slot is near the viewport, so
   a missing render costs one HEAD and the site keeps the still it ships with.
   Reduced motion opts out entirely. */
const motionLayers = [];

function motionSlot(host, name, className) {
  if (reduceMotion || !host) return Promise.resolve(null);
  return fetch(`assets/${name}.mp4`, { method: "HEAD" })
    .then((r) => {
      if (!r.ok) return null;
      const v = document.createElement("video");
      v.className = className;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = "none";              // bytes only once it is nearly on screen
      v.setAttribute("aria-hidden", "true");
      for (const [ext, type] of [["webm", "video/webm"], ["mp4", "video/mp4"]]) {
        const s = document.createElement("source");
        s.src = `assets/${name}.${ext}`;
        s.type = type;
        v.appendChild(s);
      }
      motionLayers.push(v);
      watchMotion(v);
      return v;
    })
    .catch(() => null);
}

/* Play only while visible; pause (and never even load) otherwise. */
const motionWatcher = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) {
        if (v.preload === "none") {
          v.preload = "auto";
          v.load();
        }
        v.play().catch(() => {});      // iOS low-power blocks autoplay; still fine
      } else {
        v.pause();
      }
    }
  },
  { rootMargin: "200px 0px" }
);
function watchMotion(v) { motionWatcher.observe(v); }

document.addEventListener("visibilitychange", () => {
  for (const v of motionLayers) {
    if (document.hidden) v.pause();
    else if (v.isConnected && v.preload !== "none") v.play().catch(() => {});
  }
});

/* ---------------- HERO: dark studio scene ---------------- */
(function heroStudio() {
  const canvas = document.getElementById("studio");
  const fallback = () => {
    canvas.style.background = "radial-gradient(80% 60% at 50% 30%, #2a2a2e, #0b0b0c)";
  };
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch {
    fallback();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b0c);
  scene.fog = new THREE.Fog(0x0b0b0c, 8, 22);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.15, 7.2);

  // Curved "bonnet" surface — wide plane displaced by soft crests
  const geo = new THREE.PlaneGeometry(26, 12, 220, 90);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const crest =
      Math.exp(-Math.pow((y + 1.6) / 3.4, 2)) * 1.35 * Math.cos(x * 0.22) +
      Math.exp(-Math.pow((x - 3.5) / 5.0, 2)) * 0.55 +
      Math.exp(-Math.pow((x + 5.5) / 4.2, 2)) * 0.4;
    pos.setZ(i, crest);
  }
  geo.computeVertexNormals();
  const body = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color: 0x2c2c30, metalness: 0.92, roughness: 0.34 })
  );
  body.rotation.x = -Math.PI / 2.35;
  body.position.set(0, -1.4, 0);
  scene.add(body);

  // Light blade — glowing sickle, like a studio strip light on paint
  const bladeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6, 1.2, -2),
    new THREE.Vector3(-2, 2.2, -1.2),
    new THREE.Vector3(2.5, 1.8, -1.4),
    new THREE.Vector3(6, 0.6, -2.2),
  ]);
  const blade = new THREE.Mesh(
    new THREE.TubeGeometry(bladeCurve, 80, 0.05, 8, false),
    new THREE.MeshBasicMaterial({ color: 0xf5f4f1 })
  );
  scene.add(blade);

  scene.add(new THREE.AmbientLight(0x404046, 0.7));
  const key = new THREE.SpotLight(0xf5f4f1, 260, 40, Math.PI / 5, 0.55, 1.6);
  key.position.set(-4, 7, 3);
  scene.add(key);
  const rim = new THREE.PointLight(0x1c5a45, 40, 30); // verde rim
  rim.position.set(6, 2, -4);
  scene.add(rim);
  const warm = new THREE.PointLight(0xd2301f, 18, 20); // rosso whisper
  warm.position.set(-7, 0.5, -3);
  scene.add(warm);

  const mouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // clientWidth is 0 while the hero runs solo video (canvas display:none) — an aspect
  // of 0/0 poisons the projection matrix with NaN, so skip those frames entirely.
  let live = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    live = w > 0 && h > 0;
    if (!live) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);   // catches CSS-driven size changes too
  resize();

  // Rendering a hero nobody is looking at burns battery on a page this long.
  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; })
    .observe(canvas);

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    live = false;
    fallback();
  });

  const clock = new THREE.Clock();
  (function tick() {
    requestAnimationFrame(tick);
    if (!live || !onScreen || document.hidden) return;
    const t = clock.getElapsedTime();
    if (!reduceMotion) {
      key.position.x = -4 + Math.sin(t * 0.25) * 6; // slow light sweep
      blade.position.x = Math.sin(t * 0.18) * 1.2;
      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (1.15 - mouse.y * 0.35 - camera.position.y) * 0.04;
      camera.lookAt(0, 0.2, -1);
    }
    renderer.render(scene, camera);
  })();
})();

/* ---------------- Intro sequence ---------------- */
gsap.registerPlugin(ScrollTrigger);

if (!reduceMotion) {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(".hero-title .line span", { y: 0, duration: 1.1, stagger: 0.12, delay: 0.25 })
    .to(".hero-sub", { opacity: 1, duration: 0.9 }, "-=0.5")
    .to(".hero-spec", { opacity: 1, duration: 0.9 }, "-=0.4");
} else {
  gsap.set(".hero-title .line span", { y: 0 });
  gsap.set(".hero-sub, .hero-spec", { opacity: 1 });
}

/* ---------------- Nav: dark over hero, paper after ---------------- */
ScrollTrigger.create({
  trigger: "#nipoti",
  start: "top 60px",
  onEnter: () => document.getElementById("nav").classList.add("on-paper"),
  onLeaveBack: () => document.getElementById("nav").classList.remove("on-paper"),
});

/* ---------------- Heritage: horizontal rail ----------------
   matchMedia so a resize past 720px rebuilds the rail instead of leaving the page
   stuck in whichever mode it happened to load in. */
const rail = document.getElementById("rail");
const railScroll = () => Math.max(0, rail.scrollWidth - window.innerWidth);

gsap.matchMedia().add(
  { desktop: "(min-width: 721px)", mobile: "(max-width: 720px)", reduced: "(prefers-reduced-motion: reduce)" },
  (ctx) => {
    const { desktop, reduced } = ctx.conditions;
    const pinned = desktop && !reduced;

    const railTween = pinned
      ? gsap.to(rail, {
          x: () => -railScroll(),
          ease: "none",
          scrollTrigger: {
            trigger: ".heritage",
            start: "top top",
            end: () => "+=" + railScroll(),
            pin: true,
            anticipatePin: 1,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      : null;

    gsap.utils.toArray(".era-media").forEach((m) => {
      if (!railTween) {
        gsap.set(m, { clipPath: "inset(0 0% 0 0)" });
        return;
      }
      gsap.to(m, {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.1,
        ease: "power3.inOut",
        scrollTrigger: { trigger: m, containerAnimation: railTween, start: "left 85%", once: true },
      });
    });
  }
);
window.addEventListener("load", refreshTriggers);

/* ---------------- Sketch: self-drawing car ---------------- */
const strokes = gsap.utils.toArray("#carSketch .stroke");
strokes.forEach((p) => {
  const len = p.getTotalLength();
  p.style.strokeDasharray = len;
  p.style.strokeDashoffset = len;
});
gsap.to(strokes, {
  strokeDashoffset: 0,
  ease: "none",
  stagger: 0.35,
  scrollTrigger: {
    trigger: ".sketch-stage",
    start: "top 75%",
    end: "top 15%",
    scrub: reduceMotion ? false : 0.6,
    onLeave: () => document.querySelector(".anno").classList.add("show"),
    onEnterBack: () => document.querySelector(".anno").classList.remove("show"),
  },
});

/* ---------------- Manifesto: word emphasis ---------------- */
gsap.to(".mword", {
  opacity: 1,
  y: 0,
  stagger: 0.25,
  ease: "power2.out",
  scrollTrigger: { trigger: "#manifesto", start: "top 65%", end: "top 20%", scrub: reduceMotion ? false : 0.8 },
});

/* ---------------- Generic reveals ---------------- */
document.querySelectorAll(".reveal").forEach((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: "top 82%",
    onEnter: () => el.classList.add("in"),
    once: true,
  });
});

/* ---------------- Asset auto-swap ----------------
   Drop real photos in assets/ with the names in data-img
   (era-ferrari.jpg, era-concept.jpg, era-dino.jpg, era-lf1.jpg)
   and they replace the placeholder art automatically. Add the matching
   <name>-loop.mp4/.webm (plan step G2) and the card becomes a cinemagraph. */
document.querySelectorAll(".era[data-img]").forEach((era) => {
  const file = "assets/" + era.dataset.img;
  const slot = era.dataset.img.replace(/\.[a-z]+$/i, "");
  const img = new Image();
  img.loading = "lazy";
  img.decoding = "async";
  img.onload = () => {
    const media = era.querySelector(".era-media");
    media.innerHTML = "";
    img.alt = era.querySelector("h3").textContent;
    media.appendChild(img);
    refreshTriggers();
    motionSlot(media, slot + "-loop", "era-motion").then((v) => {
      if (!v) return;
      v.poster = file;                 // the still stays the first thing painted
      media.appendChild(v);
    });
  };
  img.src = file;
});

/* Hero G1: blend the studio loop over the WebGL canvas if assets/hero-loop.mp4 exists.
   No file -> hero stays pure WebGL. Reduced motion -> never injected. */
motionSlot(document.getElementById("hero"), "hero-loop", "hero-motion").then((v) => {
  if (!v) return;
  const hero = document.getElementById("hero");
  v.poster = "assets/hidra-light.jpg";
  // No canvas (WebGL failed) or narrow viewport: the loop IS the hero background.
  // Re-evaluated on every breakpoint change — a phone rotating into landscape used to
  // keep the mobile treatment for the rest of the session.
  const applySolo = () => {
    const solo = !document.getElementById("studio") || narrow.matches;
    v.classList.toggle("solo", solo);
  };
  applySolo();
  narrow.addEventListener("change", applySolo);
  hero.insertBefore(v, hero.querySelector(".hero-veil"));
});

/* G3 / G5: research and manifesto backdrops — same presence gate as the hero. */
motionSlot(document.querySelector(".sketch-stage"), "sketch-loop", "sketch-motion").then((v) => {
  if (v) document.querySelector(".sketch-stage").prepend(v);
});
motionSlot(document.getElementById("manifesto"), "manifesto-loop", "manifesto-motion").then((v) => {
  if (v) document.getElementById("manifesto").prepend(v);
});

/* Film: swap poster for the real film if assets/film.mp4 exists.
   Deliberately not autoplaying — it is a 40 s narrative piece with a soundtrack to
   come, so it waits for a click and only fetches metadata until then. */
fetch("assets/film.mp4", { method: "HEAD" }).then((r) => {
  if (!r.ok) return;
  const frame = document.getElementById("filmFrame");
  const v = document.createElement("video");
  v.src = "assets/film.mp4";
  v.controls = true;
  v.playsInline = true;
  v.preload = "metadata";
  v.poster = "assets/film-poster.jpg";
  v.setAttribute("aria-label", "Fioravanti — il film");
  frame.innerHTML = "";
  frame.appendChild(v);
}).catch(() => {});
