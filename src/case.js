import "./styles/main.css";
import { gsap, ScrollTrigger, Draggable, SplitText, q, qa, reduced, syncNavHeight } from "./js/gsap-setup.js";
import { initHover } from "./js/hover.js";
import { initMenu } from "./js/menu.js";
import { initAnchors } from "./js/nav.js";
import { navbarState } from "./js/scroll.js";
import { initFooter, initStickers } from "./js/footer.js";

const pad = (n) => String(n).padStart(2, "0");
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* Count a [data-count] span up from 0 to its own number. */
function countUp(el, { duration = 1.2, delay = 0 } = {}) {
  const to = Number(el.dataset.count);
  if (reduced || Number.isNaN(to)) return gsap.set(el, { textContent: to });
  const o = { v: 0 };
  el.textContent = "0";
  return gsap.to(o, { v: to, duration, delay, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
}

/* 01 Hero: title lines rise (60ms stagger, 0.8s power3.out), highlight bar draws, sticker drops and settles at -10deg, tags and buttons fade up last. */
function hero() {
  const lines = qa("[data-case-line]");
  const early = qa('[data-hero-fade="early"]');
  const late = qa('[data-hero-fade="late"]');
  const bar = q("[data-hl-bar]");
  const sticker = q("[data-case-sticker]");
  const rot = parseFloat(getComputedStyle(sticker).getPropertyValue("--rotate")) || -10;
  if (reduced) { gsap.set([...lines, ...early, ...late, sticker], { autoAlpha: 1 }); gsap.set(sticker, { rotation: rot }); return; }

  gsap.set(lines, { yPercent: 110, autoAlpha: 1 });
  gsap.set(bar, { scaleX: 0 });
  gsap.set([...early, ...late], { y: 24, autoAlpha: 0 });
  gsap.set(sticker, { y: -180, rotation: rot - 28, autoAlpha: 0 });

  gsap.timeline({ delay: 0.1 })
    .to(early, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: "power3.out" }, 0)
    .to(lines, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: "power3.out" }, 0.1)
    .to(bar, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, ">-0.1")
    .to(sticker, { y: 0, rotation: rot, autoAlpha: 1, duration: 1.1, ease: "bounce.out" }, "<0.1")
    .to(late, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }, ">-0.5");
}

/* 02 Hero media: scrubbed scale .9 → 1 and radius 48 → 24. Autoplays muted in view, pauses off-screen. Round "Play" cursor. */
function heroMedia() {
  const frame = q("[data-media-frame]");
  const video = q("[data-demo-video]");
  const toggle = q("[data-demo-toggle]");
  if (!frame) return;
  let playing = false;

  const setPlaying = (on) => {
    playing = on;
    frame.classList.toggle("is-playing", on);
    toggle.setAttribute("aria-pressed", String(on));
    q("span", toggle).textContent = on ? "Pause demo" : "Play demo";
    if (cursorText) cursorText.textContent = on ? "Pause" : "Play";
    if (video?.getAttribute("src")) on ? video.play().catch(() => {}) : video.pause();
  };

  if (!reduced) {
    gsap.fromTo(frame, { scale: 0.9, borderRadius: 48 }, {
      scale: 1, borderRadius: 24, ease: "none",
      scrollTrigger: { trigger: frame, start: "top 95%", end: "top 35%", scrub: 0.5 },
    });
    ScrollTrigger.create({ trigger: frame, start: "top 80%", end: "bottom 15%", onToggle: (s) => setPlaying(s.isActive) });
  }

  toggle.addEventListener("click", () => setPlaying(!playing));
  frame.addEventListener("click", (e) => { if (e.target !== toggle) setPlaying(!playing); });

  // Cursor becomes a round label over the media (fine pointers only).
  let cursorText;
  if (fine) {
    const cur = document.body.appendChild(Object.assign(document.createElement("div"), { className: "cursor-label label-caps" }));
    cursorText = document.createElement("span"); cursorText.textContent = "Play"; cur.appendChild(cursorText);
    const mx = gsap.quickTo(cur, "x", { duration: 0.25, ease: "power3.out" });
    const my = gsap.quickTo(cur, "y", { duration: 0.25, ease: "power3.out" });
    frame.addEventListener("pointerenter", (e) => { mx(e.clientX); my(e.clientY); gsap.to(cur, { scale: 1, duration: 0.3, ease: "back.out(2)" }); });
    frame.addEventListener("pointermove", (e) => { mx(e.clientX); my(e.clientY); });
    frame.addEventListener("pointerleave", () => gsap.to(cur, { scale: 0, duration: 0.2, ease: "power2.in" }));
  }
}

/* 03 Case nav: pins at the top, the main navbar slides away, active pill follows the section, click smooth-scrolls, progress bar fills. */
function caseNav() {
  const nav = q("[data-case-nav]");
  const navbar = q("[data-navbar]");
  const items = qa("[data-case-items] a", nav);
  const sections = qa("[data-case-section]");
  const chip = q("[data-case-chip]", nav);
  const progress = q("[data-case-progress]", nav);
  const compact = q("[data-case-compact]", nav);
  const sheet = q("[data-case-sheet]", nav);
  const cur = q("[data-case-current]", nav);
  const count = q("[data-case-count]", nav);
  const navH = () => navbar.offsetHeight;

  // Sheet list (mobile) mirrors the items.
  sheet.innerHTML = items.map((a, i) => `<a class="label" href="${a.getAttribute("href")}"><span>${a.textContent}</span><span class="caption">${pad(i + 1)}</span></a>`).join("");
  const sheetLinks = qa("a", sheet);

  let active = -1;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    items.forEach((a, k) => { a.classList.toggle("is-active", k === i); k === i ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"); });
    sheetLinks.forEach((a, k) => a.classList.toggle("is-active", k === i));
    cur.textContent = items[i].textContent;
    count.textContent = `${pad(i + 1)} / ${pad(items.length)}`;
    // Keep the active pill visible inside the strip without moving the page.
    const box = items[i].parentElement;
    box.scrollTo({ left: items[i].offsetLeft - box.clientWidth / 2 + items[i].offsetWidth / 2, behavior: reduced ? "auto" : "smooth" });
  };
  setActive(0);

  // One trigger per section.
  sections.forEach((sec, i) => {
    ScrollTrigger.create({ trigger: sec, start: () => `top ${nav.offsetHeight + 80}px`, end: () => `bottom ${nav.offsetHeight + 80}px`, onToggle: (s) => s.isActive && setActive(i) });
  });

  // Navbar hides while the strip is pinned and scrolling down; returns on scroll up.
  let hidden = false, locked = false;
  const hideBar = () => { if (hidden) return; hidden = true; gsap.to(navbar, { yPercent: -100, duration: reduced ? 0 : 0.3, ease: "power2.out" }); gsap.to(nav, { "--cn-top": "0px", duration: reduced ? 0 : 0.3, ease: "power2.out" }); };
  const showBar = () => { if (!hidden) return; hidden = false; gsap.to(navbar, { yPercent: 0, duration: reduced ? 0 : 0.3, ease: "power2.out" }); gsap.to(nav, { "--cn-top": `${navH()}px`, duration: reduced ? 0 : 0.3, ease: "power2.out" }); };
  ScrollTrigger.create({
    trigger: nav, start: () => `top ${navH()}px`, end: "max",
    onUpdate: (self) => { if (!locked) self.direction === 1 ? hideBar() : showBar(); },
    onLeaveBack: () => { hidden = true; showBar(); gsap.set(nav, { "--cn-top": "0px" }); },
  });

  // Chip slides in once the strip sticks.
  ScrollTrigger.create({
    trigger: nav, start: "top top", end: "max",
    onToggle: (s) => gsap.to(chip, { maxWidth: s.isActive ? 120 : 0, opacity: s.isActive ? 1 : 0, marginRight: s.isActive ? 4 : 0, duration: reduced ? 0 : 0.35, ease: "power3.out" }),
  });

  // Progress bar along the bottom.
  gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: sections[0], endTrigger: sections[sections.length - 1], start: "top 70%", end: "bottom 70%", scrub: reduced ? true : 0.3 } });

  // Click: smooth-scroll in ~0.6s, landing just below the strip; update the hash.
  const goTo = (hash, { updateHash = true } = {}) => {
    const target = q(hash); if (!target) return;
    locked = true; hideBar();
    gsap.to(window, { scrollTo: { y: target, offsetY: nav.offsetHeight - 1, autoKill: false }, duration: reduced ? 0 : 0.6, ease: "power2.inOut", onComplete: () => { locked = false; } });
    if (updateHash) { try { history.replaceState(null, "", hash); } catch { /* sandboxed frames can refuse */ } }
  };
  [...items, ...sheetLinks].forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); goTo(a.getAttribute("href")); toggleSheet(false); }));

  // Mobile compact bar + sheet
  function toggleSheet(open = sheet.hidden) {
    compact.setAttribute("aria-expanded", String(open));
    if (open) { sheet.hidden = false; gsap.fromTo(sheet, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.25, ease: "power2.out" }); }
    else if (!sheet.hidden) gsap.to(sheet, { autoAlpha: 0, y: -8, duration: reduced ? 0 : 0.18, onComplete: () => (sheet.hidden = true) });
  }
  compact.addEventListener("click", () => toggleSheet());
  document.addEventListener("keydown", (e) => e.key === "Escape" && !sheet.hidden && (toggleSheet(false), compact.focus()));

  if (location.hash && q(location.hash)) window.addEventListener("load", () => setTimeout(() => goTo(location.hash, { updateHash: false }), 300));
}

/* Section titles: words reveal through a mask. */
function titles() {
  if (reduced) return;
  qa("[data-split]").forEach((el) => {
    const split = SplitText.create(el, { type: "words", mask: "words", wordsClass: "split-word" });
    gsap.set(split.words, { yPercent: 105 });
    gsap.to(split.words, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });
}

/* 04 Overview: stats count up at 40% in view (1.2s), cards enter with an 80ms stagger. */
function overview() {
  const wrap = q("[data-stats]"); if (!wrap) return;
  const cards = qa("[data-stat]", wrap);
  const run = () => { gsap.fromTo(cards, { y: 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" }); qa("[data-count]", wrap).forEach((el) => countUp(el, { duration: 1.2 })); };
  if (reduced) return;
  gsap.set(cards, { autoAlpha: 0 });
  ScrollTrigger.create({ trigger: wrap, start: "top 60%", once: true, onEnter: run });
}

/* 05 Problem: seller card from the left, buyer card from the right, clip-path wipe, "How might we" word by word. */
function problem() {
  if (reduced) return;
  const [seller, buyer] = qa("[data-side]");
  const two = seller.parentElement;
  gsap.set(seller, { x: -90, autoAlpha: 0 }); gsap.set(buyer, { x: 90, autoAlpha: 0 });
  gsap.timeline({ scrollTrigger: { trigger: two, start: "top 78%", once: true } })
    .to(seller, { x: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" }, 0)
    .to(buyer, { x: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" }, 0.1);

  const biz = q("[data-biz]");
  gsap.set(biz, { clipPath: "inset(0 100% 0 0 round 32px)" });
  gsap.set(biz.children, { autoAlpha: 0, y: 16 });
  gsap.timeline({ scrollTrigger: { trigger: biz, start: "top 82%", once: true } })
    .to(biz, { clipPath: "inset(0 0% 0 0 round 32px)", duration: 1, ease: "power3.inOut" })
    .to(biz.children, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.5");

  const hmw = q("[data-words]");
  const split = SplitText.create(hmw, { type: "words", mask: "words" });
  gsap.set(split.words, { yPercent: 110 });
  gsap.to(split.words, { yPercent: 0, duration: 0.6, stagger: 0.045, ease: "power3.out", scrollTrigger: { trigger: hmw, start: "top 85%", once: true } });
}

/* 06 Research: cards stagger up; hover lifts and underlines "What we took". */
function research() {
  const cards = qa("[data-competitor]");
  if (!reduced) {
    gsap.set(cards, { y: 64, autoAlpha: 0 });
    ScrollTrigger.batch(cards, { start: "top 86%", once: true, onEnter: (b) => gsap.to(b, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }) });
  }
  cards.forEach((c) => {
    const on = () => { c.classList.add("is-lift"); if (!reduced) gsap.to(c, { y: -8, duration: 0.25, ease: "power2.out", overwrite: "auto" }); };
    const off = () => { c.classList.remove("is-lift"); if (!reduced) gsap.to(c, { y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" }); };
    c.addEventListener("pointerenter", on); c.addEventListener("pointerleave", off);
  });
}

/* 07 Strategy: pinned horizontal scroll on desktop; constraint rules draw in left to right. */
function strategy() {
  const sec = q("[data-strategy]"); if (!sec) return;
  const track = q("[data-calls-track]", sec);
  const rules = qa("[data-constraint] .rule", sec);
  const mm = gsap.matchMedia();

  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    sec.classList.add("is-hscroll");
    const dist = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth + 2 * parseFloat(getComputedStyle(sec).paddingLeft || 0) * 0);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: sec, start: () => `top ${syncNavHeight() + 70}px`, end: () => `+=${dist() + 160}`, pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true },
    });
    gsap.set(rules, { scaleX: 0 });
    gsap.to(rules, { scaleX: 1, duration: 0.9, stagger: 0.12, ease: "power3.inOut", scrollTrigger: { trigger: q(".constraints", sec), start: "top 95%", once: true } });
    return () => { sec.classList.remove("is-hscroll"); gsap.set(track, { clearProps: "transform" }); };
  });
  mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
    if (reduced) return;
    gsap.set(rules, { scaleX: 0 });
    gsap.to(rules, { scaleX: 1, duration: 0.9, stagger: 0.12, ease: "power3.inOut", scrollTrigger: { trigger: q(".constraints", sec), start: "top 90%", once: true } });
  });
}

/* 08 Product walkthrough: sitemap parallax 0.85, sticky split with crossfading screens, active step gets the accent rule. */
function walkthrough() {
  const inner = q("[data-sitemap-inner]");
  if (inner && !reduced) {
    const frame = inner.parentElement;
    gsap.fromTo(inner, { y: 0 }, { y: () => -(inner.offsetHeight - frame.offsetHeight) * 0.85, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } });
  }
  const steps = qa("[data-step]");
  const screens = qa("[data-screen]");
  const thumbs = qa("[data-walk-thumbs] li");
  const label = q("[data-walk-label]");
  let cur = 0;
  const setStep = (i) => {
    if (i === cur) return; cur = i;
    steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
    thumbs.forEach((t, k) => t.classList.toggle("is-active", k === i));
    screens.forEach((s, k) => { s.classList.toggle("is-active", k === i); gsap.to(s, { opacity: k === i ? 1 : 0, duration: reduced ? 0 : 0.45, ease: "power2.out", overwrite: "auto" }); });
    label.textContent = steps[i].dataset.label;
  };
  gsap.set(screens, { opacity: (i) => (i === 0 ? 1 : 0) });
  steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top 58%", end: "bottom 58%", onToggle: (st) => st.isActive && setStep(i) }));
}

/* 09 Decisions: number slides up, columns fade in with a stagger, board scales from .96 with slight parallax, hover zooms 1.02. */
function decisions() {
  qa("[data-decision]").forEach((d) => {
    const n = q("[data-dn]", d), cols = qa(".decision__cols > div", d), board = q("[data-board]", d);
    const wrap = document.createElement("div"); wrap.className = "board-wrap"; board.replaceWith(wrap); wrap.appendChild(board);
    if (!reduced) {
      gsap.set(n, { yPercent: 110 }); gsap.set(cols, { y: 28, autoAlpha: 0 });
      gsap.timeline({ scrollTrigger: { trigger: d, start: "top 72%", once: true } })
        .to(n, { yPercent: 0, duration: 0.7, ease: "power3.out" })
        .to(cols, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" }, "-=0.35");
      gsap.fromTo(wrap, { scale: 0.96, y: 36 }, { scale: 1, y: -12, ease: "none", scrollTrigger: { trigger: wrap, start: "top 98%", end: "top 35%", scrub: 0.6 } });
    }
    board.addEventListener("pointerenter", () => gsap.to(board, { scale: 1.02, duration: reduced ? 0 : 0.35, ease: "power2.out" }));
    board.addEventListener("pointerleave", () => gsap.to(board, { scale: 1, duration: reduced ? 0 : 0.35, ease: "power2.out" }));
  });
}

/* 10 Edge cases: ticks draw in one by one; the known-gaps border marches. */
function edge() {
  const list = q("[data-ticks]");
  if (list && !reduced) {
    const paths = qa(".tick path", list), texts = qa("li .body-m", list);
    gsap.set(paths, { drawSVG: "0%" }); gsap.set(texts, { autoAlpha: 0, x: -10 });
    gsap.timeline({ scrollTrigger: { trigger: list, start: "top 78%", once: true } })
      .to(paths, { drawSVG: "100%", duration: 0.35, stagger: 0.22, ease: "power2.out" }, 0)
      .to(texts, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.22, ease: "power2.out" }, 0.05);
  }
  const ants = q("[data-ants]");
  if (ants && !reduced) gsap.to(ants, { strokeDashoffset: -24, duration: 4, ease: "none", repeat: -1 });
}

/* 11 Scrappy artifacts: scatter in from below, settle at their angle; draggable with inertia on desktop. */
function artifacts() {
  const wrap = q("[data-polaroids]"); const cards = qa("[data-polaroid]");
  if (!wrap) return;
  const tilts = cards.map((c) => parseFloat(c.style.getPropertyValue("--tilt")) || 0);
  if (reduced) { cards.forEach((c, i) => gsap.set(c, { rotation: tilts[i] })); }
  else {
    gsap.set(cards, { y: 160, autoAlpha: 0, rotation: () => gsap.utils.random(-22, 22) });
    gsap.to(cards, { y: 0, autoAlpha: 1, rotation: (i) => tilts[i], duration: 1, stagger: 0.12, ease: "back.out(1.3)", scrollTrigger: { trigger: wrap, start: "top 80%", once: true } });
  }
  gsap.matchMedia().add("(hover: hover) and (min-width: 768px)", () => {
    let z = 10;
    const drags = Draggable.create(cards, {
      type: "x,y", bounds: wrap, inertia: !reduced, edgeResistance: 0.8,
      onPress() { this.target.style.zIndex = ++z; if (!reduced) gsap.to(this.target, { scale: 1.04, duration: 0.2 }); },
      onRelease() { if (!reduced) gsap.to(this.target, { scale: 1, duration: 0.3 }); },
    });
    return () => drags.forEach((d) => d.kill());
  });
}

/* 12 Impact: rows reveal top to bottom; the before value strikes through, then the after value counts up in the accent colour. */
function impact() {
  const rows = qa("[data-impact-row]"); if (!rows.length || reduced) return;
  gsap.set(rows, { autoAlpha: 0, y: 24 });
  const after = rows.map((r) => q(".impact__after", r)); gsap.set(after, { autoAlpha: 0, y: 8 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: q(".impact"), start: "top 72%", once: true } });
  rows.forEach((r, i) => {
    tl.to(r, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, i * 0.55)
      .to(q(".strike", r), { backgroundSize: "100% 2px", duration: 0.4, ease: "power2.inOut" }, i * 0.55 + 0.35)
      .to(after[i], { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, i * 0.55 + 0.7)
      .call(() => qa("[data-count]", r).forEach((el) => countUp(el, { duration: 0.9 })), null, i * 0.55 + 0.7);
  });
}

/* 13 Risks: columns reveal in sequence; each item's top rule draws before its text. */
function risks() {
  const cols = qa("[data-col]"); if (!cols.length || reduced) return;
  cols.forEach((col, ci) => {
    const head = qa(":scope > .label-caps, :scope > .col__title", col);
    const items = qa("[data-item]", col);
    gsap.set(head, { autoAlpha: 0, y: 20 }); gsap.set(items, { autoAlpha: 1 });
    gsap.set(qa(".rule", col), { scaleX: 0 }); gsap.set(qa(".item__head, .item > p", col), { autoAlpha: 0, y: 14 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: q(".two-cols"), start: "top 75%", once: true }, delay: ci * 0.5 });
    tl.to(head, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" });
    items.forEach((it, i) => {
      tl.to(q(".rule", it), { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 0.3 + i * 0.22)
        .to(qa(".item__head, .item > p", it), { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }, 0.5 + i * 0.22);
    });
  });
}

/* 14 Reflection + future: numbers count up as each reflection enters; future cards lift on hover. */
function reflection() {
  qa("[data-reflection]").forEach((row) => {
    const n = q("[data-rn]", row); const to = Number(n.dataset.rn);
    if (reduced) return;
    gsap.set(row, { autoAlpha: 0, y: 28 });
    ScrollTrigger.create({ trigger: row, start: "top 86%", once: true, onEnter: () => {
      gsap.to(row, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" });
      const o = { v: 0 }; n.textContent = "00";
      gsap.to(o, { v: to, duration: 0.9, ease: "power2.out", onUpdate: () => (n.textContent = pad(Math.round(o.v))), onComplete: () => (n.textContent = pad(to)) });
    } });
  });
  const cards = qa("[data-future]");
  if (!reduced) { gsap.set(cards, { y: 40, autoAlpha: 0 }); ScrollTrigger.batch(cards, { start: "top 90%", once: true, onEnter: (b) => gsap.to(b, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }) }); }
  cards.forEach((c) => {
    c.addEventListener("pointerenter", () => !reduced && gsap.to(c, { y: -8, duration: 0.25, ease: "power2.out", overwrite: "auto" }));
    c.addEventListener("pointerleave", () => !reduced && gsap.to(c, { y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" }));
  });
}

/* 15 Next project: hover tints in the next project's colour (CSS); click expands the card to fill the screen, then navigates. */
function nextProject() {
  const card = q("[data-next-card]"); const curtain = q("[data-curtain]");
  if (!card) return;
  card.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const href = card.dataset.href || card.getAttribute("href");
    if (reduced) { location.href = href; return; }
    const r = card.getBoundingClientRect();
    gsap.set(curtain, { visibility: "visible", clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 32px)` });
    gsap.to(curtain, { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 0.8, ease: "power4.inOut", onComplete: () => { location.href = href; } });
  });
  // Coming back via the browser cache: reset the curtain.
  window.addEventListener("pageshow", (e) => e.persisted && gsap.set(curtain, { visibility: "hidden", clipPath: "inset(100% 0 0 0)" }));
}

/* ---- boot ---- */
syncNavHeight();
window.addEventListener("resize", syncNavHeight);
initMenu({ reduced });
initAnchors();
navbarState();

hero();
heroMedia();
caseNav();
titles();
overview();
problem();
research();
strategy();
walkthrough();
decisions();
edge();
artifacts();
impact();
risks();
reflection();
nextProject();
initFooter();
initStickers();
initHover({ reduced });
document.documentElement.classList.add("is-ready");

document.fonts.ready.then(() => { syncNavHeight(); ScrollTrigger.refresh(); });
