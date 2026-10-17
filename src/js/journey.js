import { gsap, ScrollTrigger, q, qa, reduced } from "./gsap-setup.js";

// Waypoints in the 1440x900 design space (read off the Figma path layer, 549:62).
// Indices listed in ANCHOR_AT are the six anchors; the points between shape the S.
const PTS = [
  [861, 383], [735, 358], [607, 416], [604, 450], [630, 490], [690, 525], [748, 543],
  [795, 563], [830, 619], [838, 661], [832, 683], [815, 717], [766, 742], [690, 748],
  [626, 738], [591, 717], [578, 699],
];
const ANCHOR_AT = [0, 2, 6, 10, 13, 16];
const N = ANCHOR_AT.length;

const HOLD = 0.08;
const MOVE = (0.8 - HOLD * N) / (N - 1);
const T = (i) => 0.1 + i * (HOLD + MOVE); // arrival time at stop i

function catmullRom(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// Fraction of the path length at which each anchor sits.
function anchorFractions(path) {
  const len = path.getTotalLength();
  return ANCHOR_AT.map((idx) => {
    const [tx, ty] = PTS[idx];
    let best = 0, bestD = Infinity;
    for (let s = 0; s <= 1; s += 0.0005) {
      const p = path.getPointAtLength(s * len);
      const d = (p.x - tx) ** 2 + (p.y - ty) ** 2;
      if (d < bestD) { bestD = d; best = s; }
    }
    return best;
  });
}

function tangentAngle(idx) {
  const a = PTS[Math.max(0, idx - 1)], b = PTS[Math.min(PTS.length - 1, idx + 1)];
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
}

export function initJourney() {
  const section = q("[data-journey]");
  if (!section) return () => {};
  const stage = q("[data-journey-stage]", section);
  const camera = q("[data-journey-camera]", section);
  const ghost = q("[data-path-ghost]", section);
  const draw = q("[data-path-draw]", section);
  const anchorsG = q("[data-anchors]", section);
  const handles = q("[data-handles]", section);
  const pins = qa("[data-pin]", section);
  const cards = qa("[data-journey-cards] > .stop-card", section);
  const pen = q("[data-pen]", section);
  const intro = q("[data-journey-intro]", section);
  const outro = q("[data-journey-outro]", section);
  const dots = qa(".scrubber__dots i", section);
  const label = q("[data-scrubber-label]", section);

  const d = catmullRom(PTS);
  ghost.setAttribute("d", d);
  draw.setAttribute("d", d);
  const fr = anchorFractions(ghost);

  anchorsG.innerHTML = "";
  const anchorEls = ANCHOR_AT.map((idx) => {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", PTS[idx][0] - 5); r.setAttribute("y", PTS[idx][1] - 5);
    r.setAttribute("width", 10); r.setAttribute("height", 10);
    anchorsG.appendChild(r);
    return r;
  });

  const mm = gsap.matchMedia();

  // Stacked list: mobile, tablets and reduced motion. Shows the finished state, adds a light scroll reveal when motion is allowed.
  mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
    section.classList.remove("is-pinned");
    gsap.set([intro, ...cards], { clearProps: "all" });
    if (reduced) return;
    cards.forEach((c) => {
      gsap.from(c, { y: 40, autoAlpha: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 88%", once: true } });
    });
  });

  // Pinned, scrubbed storyboard: desktop with motion allowed.
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    section.classList.add("is-pinned");
    const navH = () => q("[data-navbar]")?.offsetHeight ?? 96;
    const vw = () => stage.clientWidth;
    const vh = () => stage.clientHeight;
    const fit = () => Math.min(vw() / 1440, vh() / 900);

    // Camera helpers: put world point (wx, wy) at screen point (sx, sy) with the given zoom.
    const camAt = (wx, wy, zoom, sx = 0.66, sy = 0.5) => {
      const s = fit() * zoom;
      return { x: vw() * sx - s * wx, y: vh() * sy - s * wy, scale: s };
    };
    const overview = () => {
      const s = fit();
      return { x: (vw() - 1440 * s) / 2, y: (vh() - 900 * s) / 2 + 24, scale: s };
    };
    const focus = (i) => camAt(PTS[ANCHOR_AT[i]][0], PTS[ANCHOR_AT[i]][1], 1.9);

    const pinEl = (i) => pins[i];

    gsap.set(camera, { transformOrigin: "0 0" });
    gsap.set(draw, { drawSVG: "0% 0%", strokeWidth: 3 });
    gsap.set(pins, { opacity: 0.35 });
    gsap.set(cards, { autoAlpha: 0, x: -80 });
    gsap.set(outro, { autoAlpha: 0, y: 30 });
    gsap.set(handles, { autoAlpha: 0 });
    gsap.set(pen, { x: PTS[0][0], y: PTS[0][1], autoAlpha: 1 });
    anchorEls.forEach((a) => a.classList.remove("is-on"));

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: () => `top ${navH()}px`,
        end: () => `+=${Math.round(window.innerHeight * 7.5)}`,
        pin: stage,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => updateScrubber(self.progress),
      },
    });

    // 0 – 10%: headline fades up and out, camera zooms to anchor 01, card 01 slides in, handles show.
    tl.set(camera, { x: () => overview().x, y: () => overview().y, scale: () => overview().scale }, 0);
    tl.to(intro, { autoAlpha: 0, y: -48, duration: 0.07, ease: "power2.in" }, 0);
    tl.to(camera, { x: () => focus(0).x, y: () => focus(0).y, scale: () => focus(0).scale, duration: 0.1, ease: "power2.inOut" }, 0);
    tl.to(cards[0], { autoAlpha: 1, x: 0, duration: 0.05, ease: "power2.out" }, 0.05);

    const activate = (i, at) => {
      tl.to(pinEl(i), { opacity: 1, duration: 0.02, ease: "none" }, at);
      tl.call(() => anchorEls[i].classList.add("is-on"), null, at);
      tl.set(handles, { x: PTS[ANCHOR_AT[i]][0], y: PTS[ANCHOR_AT[i]][1], rotation: tangentAngle(ANCHOR_AT[i]), svgOrigin: "0 0", autoAlpha: 1 }, at);
    };
    activate(0, 0.06);
    tl.to(draw, { drawSVG: "0% 0.1%", duration: 0.01 }, 0.06);

    // 10 – 90%: travel between anchors, holding on each one.
    for (let i = 0; i < N - 1; i++) {
      const leave = T(i) + HOLD;
      const arrive = T(i + 1);
      tl.to(handles, { autoAlpha: 0, duration: 0.01 }, leave - 0.005);
      tl.to(cards[i], { autoAlpha: 0, x: -80, duration: 0.03, ease: "power2.in" }, leave - 0.01);
      tl.to(camera, { x: () => focus(i + 1).x, y: () => focus(i + 1).y, scale: () => focus(i + 1).scale, duration: MOVE, ease: "power1.inOut" }, leave);
      tl.to(draw, { drawSVG: `0% ${(fr[i + 1] * 100).toFixed(2)}%`, duration: MOVE, ease: "power1.inOut" }, leave);
      tl.to(pen, { motionPath: { path: ghost, start: fr[i], end: fr[i + 1], align: ghost, alignOrigin: [0, 0] }, duration: MOVE, ease: "power1.inOut", immediateRender: false }, leave);
      tl.to(cards[i + 1], { autoAlpha: 1, x: 0, duration: 0.04, ease: "power2.out" }, arrive - 0.015);
      activate(i + 1, arrive - 0.005);
    }

    // 90 – 100%: camera pulls back, stroke thickens, the full S is revealed, outro offers the next step.
    const exit = T(N - 1) + HOLD;
    tl.to(cards[N - 1], { autoAlpha: 0, x: -80, duration: 0.03, ease: "power2.in" }, exit - 0.005);
    tl.to(handles, { autoAlpha: 0, duration: 0.01 }, exit - 0.005);
    tl.to(camera, { x: () => overview().x, y: () => overview().y, scale: () => overview().scale, duration: 0.1, ease: "power2.inOut" }, exit);
    tl.to(draw, { drawSVG: "0% 100%", strokeWidth: 6, duration: 0.1 }, exit);
    tl.to(pins, { opacity: 1, duration: 0.05 }, exit);
    tl.to(outro, { autoAlpha: 1, y: 0, duration: 0.05, ease: "power2.out" }, exit + 0.04);

    // Scrubber: dots, counter label.
    const updateScrubber = (p) => {
      let cur = 0;
      for (let i = 0; i < N; i++) if (p >= T(i) - 0.02) cur = i;
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-on", i <= cur);
        dot.classList.toggle("is-current", i === cur && p > 0.02 && p < 0.97);
      });
      const done = p >= 0.97;
      label.textContent = p < 0.02 ? "2021 → now" : done ? "06 / 06 · Path closed" : `${String(cur + 1).padStart(2, "0")} / 06 · ${["Where it started", "The turn", "Exzyt", "WIKIT", "Viya", "Now"][cur]}`;
    };

    const replay = q("[data-journey-replay]", section);
    const onReplay = () => gsap.to(window, { scrollTo: { y: tl.scrollTrigger.start, autoKill: true }, duration: 1.2, ease: "power3.inOut" });
    replay?.addEventListener("click", onReplay);

    return () => {
      replay?.removeEventListener("click", onReplay);
      section.classList.remove("is-pinned");
    };
  });

  return () => mm.revert();
}
