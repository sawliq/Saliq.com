import { gsap, ScrollTrigger, q, qa, reduced } from "./gsap-setup.js";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const dur = (s) => (reduced ? 0 : s);
const pad = (n) => String(n).padStart(2, "0");

export function initKitchen() {
  const root = q("[data-kitchen]");
  if (!root) return () => {};
  const drawer = q("[data-drawer]", root);
  const allCards = qa(".drawer-card[data-kind]:not(.drawer-card--empty)", drawer);
  const emptyCard = q(".drawer-card--empty", drawer);
  const prevBtn = q("[data-drawer-prev]", root);
  const nextBtn = q("[data-drawer-next]", root);
  const readout = q("[data-readout-text]", root);
  const readoutDot = q("[data-readout-dot]", root);
  const countEl = q("[data-drawer-count]", root);
  const dotsWrap = q("[data-drawer-dots]", root);
  const filterBtns = qa("[data-filter]", root);
  const nightBtn = q("[data-night-toggle]", root);

  const state = { filter: "all", selected: -1, hover: -1, pointerX: null, ready: false };
  const visible = () => allCards.filter((c) => state.filter === "all" || c.dataset.kind === state.filter);
  const kindLabel = (c) => (c.dataset.kind === "workshop" ? "Workshop" : "Initiative");

  const cardW = () => allCards[0].offsetWidth;
  const rot = (c) => parseFloat(getComputedStyle(c).getPropertyValue("--rot")) || 0;

  // Resting x for visible card i (plus the "Next" slot when unfiltered), centred in the wall.
  function geometry() {
    const vis = visible();
    const slots = vis.length + (state.filter === "all" ? 1 : 0);
    const wall = drawer.clientWidth, w = cardW(), edge = wall < 600 ? 16 : 40;
    const step = slots > 1 ? Math.max(wall < 600 ? 24 : 56, Math.min(w + 20, (wall - 2 * edge - w) / (slots - 1))) : 0;
    const span = w + step * (slots - 1);
    const start = (wall - span) / 2;
    return { vis, slots, step, start, w };
  }

  function activeIndex() {
    return state.hover >= 0 ? state.hover : state.selected;
  }

  function render(animate = true) {
    const { vis, step, start, w } = geometry();
    const active = activeIndex();
    const push = Math.min(46, step * 0.32);

    allCards.forEach((c) => {
      const i = vis.indexOf(c);
      if (i === -1) {
        c.classList.remove("is-raised");
        gsap.to(c, { x: start + (drawer.clientWidth - w) / 2 - start, y: 360, rotation: rot(c) * 0.5, autoAlpha: 1, duration: dur(0.5), ease: "power3.in", overwrite: "auto" });
        c.setAttribute("tabindex", "-1"); c.setAttribute("aria-hidden", "true");
        return;
      }
      c.removeAttribute("aria-hidden"); c.setAttribute("tabindex", "0");
      const raised = i === active;
      let x = start + i * step, y = 0, r = rot(c);
      if (active >= 0 && !raised) {
        const k = Math.abs(i - active);
        x += Math.sign(i - active) * push * Math.pow(0.55, k - 1);
      }
      if (raised) { y = -64; r = 0; }
      c.classList.toggle("is-raised", raised);
      c.style.zIndex = raised ? 10 : i + 1;
      gsap.to(c, { x, y, rotation: r, duration: animate ? dur(0.45) : 0, ease: "back.out(1.8)", overwrite: "auto" });
    });

    if (emptyCard) {
      const slot = vis.length;
      const show = state.filter === "all";
      const ex = start + slot * step + (active >= 0 && show ? push * Math.pow(0.55, Math.max(0, slot - active - 1)) : 0);
      gsap.to(emptyCard, { x: show ? ex : start + vis.length * step, y: show ? 0 : 360, rotation: 0, duration: animate ? dur(0.45) : 0, ease: "back.out(1.8)", overwrite: "auto" });
    }

    // Readout, counter, dots.
    const total = vis.length;
    if (active >= 0 && vis[active]) {
      const c = vis[active];
      readout.textContent = `${kindLabel(c)} · ${c.dataset.title} · click to open`;
      readoutDot.style.background = getComputedStyle(c.querySelector(".drawer-card__head")).backgroundColor;
    } else {
      readout.textContent = state.filter === "all"
        ? `${total} projects · move across the drawer, or use the arrows`
        : `${total} ${state.filter === "workshop" ? "workshops" : "initiatives"} · the rest sank into the drawer`;
      readoutDot.style.background = "";
    }
    countEl.textContent = `${pad(state.selected + 1)} / ${pad(total)}`;
    dotsWrap.innerHTML = vis.map((_, i) => `<i class="${i <= state.selected ? "is-on" : ""} ${i === state.selected ? "is-current" : ""}"></i>`).join("");
  }

  // Pointer: nearest card to the cursor rises, neighbours make room.
  function onMove(e) {
    if (e.pointerType === "touch") return;
    const r = drawer.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (y > r.height - 80) return setHover(-1);
    const { vis, step, start, w } = geometry();
    let best = -1, bestD = Infinity;
    vis.forEach((_, i) => {
      const d = Math.abs(start + i * step + w / 2 - x);
      if (d < bestD) { bestD = d; best = i; }
    });
    setHover(bestD <= Math.max(step / 2, w / 2) ? best : -1);
  }
  function setHover(i) {
    if (state.hover === i) return;
    state.hover = i;
    render();
  }
  drawer.addEventListener("pointermove", onMove);
  drawer.addEventListener("pointerleave", () => setHover(-1));

  // Browse: arrows, keyboard.
  function select(i) {
    const n = visible().length;
    if (!n) return;
    state.selected = ((i % n) + n) % n;
    state.hover = -1;
    render();
    return visible()[state.selected];
  }
  const step = (dir) => select(state.selected === -1 ? (dir > 0 ? 0 : visible().length - 1) : state.selected + dir);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));

  root.addEventListener("keydown", (e) => {
    if (!detail.hidden()) return;
    const onCard = e.target.closest?.(".drawer-card");
    const inDrawer = e.target.closest?.("[data-drawer]");
    if (!inDrawer) return;
    if (e.key === "ArrowRight") { e.preventDefault(); const c = step(1); c?.focus({ preventScroll: true }); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); const c = step(-1); c?.focus({ preventScroll: true }); }
    else if ((e.key === "Enter" || e.key === " ") && onCard && onCard.dataset.kind !== "empty") { e.preventDefault(); detail.open(visible().indexOf(onCard)); }
  });

  // Enter opens whichever card is raised by the pointer, as the storyboard describes.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || state.hover < 0 || !detail.hidden() || e.target.closest?.("a, button, .drawer-card")) return;
    e.preventDefault(); state.selected = state.hover; detail.open(state.hover);
  });

  allCards.forEach((c) => {
    c.addEventListener("focus", () => { const i = visible().indexOf(c); if (i >= 0 && c.matches(":focus-visible")) { state.selected = i; state.hover = -1; render(); } });
    c.addEventListener("click", (e) => {
      const i = visible().indexOf(c);
      if (i < 0) return;
      // Touch: first tap raises, second opens.
      if (e.pointerType === "touch" && activeIndex() !== i) return select(i);
      state.selected = i; detail.open(i);
    });
  });

  // Filters
  filterBtns.forEach((b) =>
    b.addEventListener("click", () => {
      state.filter = b.dataset.filter; state.selected = -1; state.hover = -1;
      filterBtns.forEach((o) => { const on = o === b; o.classList.toggle("is-active", on); o.setAttribute("aria-pressed", String(on)); });
      render();
    })
  );

  // Night mode for the stage
  nightBtn.addEventListener("click", () => {
    const on = root.dataset.night !== "true";
    root.dataset.night = String(on);
    nightBtn.setAttribute("aria-pressed", String(on));
    q("[data-night-label]", nightBtn).textContent = on ? "◑ Day" : "◐ Night";
  });

  // Detail card: grows out of the raised card, same card style the Journey stops use.
  const detail = (() => {
    const el = q("[data-detail]", root), card = q("[data-detail-card]", el), scrim = q(".detail__scrim", el);
    let idx = -1, opener = null;
    const fill = (c) => {
      card.dataset.project = c.dataset.project;
      q("[data-detail-logo]", card).textContent = c.querySelector(".drawer-card__logo").textContent;
      q("[data-detail-kind]", card).textContent = kindLabel(c);
      q("[data-detail-meta]", card).textContent = c.dataset.meta;
      q("[data-detail-title]", card).textContent = c.dataset.title;
      q("[data-detail-teaser]", card).textContent = c.dataset.teaser;
    };
    const fromRect = (c) => {
      const a = c.getBoundingClientRect(), b = card.getBoundingClientRect();
      return { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scale: a.width / b.width };
    };
    const api = {
      hidden: () => el.hidden,
      open(i) {
        const c = visible()[i]; if (!c) return;
        idx = i; opener = c; fill(c);
        el.hidden = false; document.body.style.overflow = "hidden";
        gsap.killTweensOf([card, scrim]);
        gsap.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur(0.3) });
        const f = fromRect(c);
        gsap.fromTo(card, { ...f, autoAlpha: 0.2 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: dur(0.55), ease: "power3.out", clearProps: "transform" });
        card.focus({ preventScroll: true });
        document.addEventListener("keydown", onKey);
      },
      close() {
        if (el.hidden) return;
        document.removeEventListener("keydown", onKey);
        const c = visible()[idx] || opener;
        const f = fromRect(c);
        gsap.to(scrim, { autoAlpha: 0, duration: dur(0.3) });
        gsap.to(card, { ...f, autoAlpha: 0, duration: dur(0.4), ease: "power3.in", onComplete: () => { el.hidden = true; document.body.style.overflow = ""; gsap.set(card, { clearProps: "all" }); c.focus({ preventScroll: true }); } });
      },
      go(dir) {
        const n = visible().length; idx = (idx + dir + n) % n;
        state.selected = idx; render();
        gsap.to(card, { autoAlpha: 0, x: -dir * 24, duration: dur(0.15), onComplete: () => { fill(visible()[idx]); gsap.fromTo(card, { x: dir * 24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: dur(0.25), ease: "power2.out", clearProps: "transform" }); } });
      },
    };
    function onKey(e) {
      if (e.key === "Escape") return api.close();
      if (e.key === "ArrowRight") return api.go(1);
      if (e.key === "ArrowLeft") return api.go(-1);
      if (e.key === "Tab") {
        const items = [...card.querySelectorAll(FOCUSABLE)];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === card)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    qa("[data-detail-close]", el).forEach((b) => b.addEventListener("click", api.close));
    q("[data-detail-prev]", el).addEventListener("click", () => api.go(-1));
    q("[data-detail-next]", el).addEventListener("click", () => api.go(1));
    return api;
  })();

  // Entrance: cards rise out of the drawer once, then the layout is live.
  function enter() {
    const { vis } = geometry();
    render(false);
    if (reduced) { state.ready = true; return; }
    gsap.from([...allCards, emptyCard].filter(Boolean), { y: 380, duration: 0.8, stagger: 0.09, ease: "back.out(1.3)", onComplete: () => { state.ready = true; } });
  }
  render(false);
  const st = ScrollTrigger.create({ trigger: drawer, start: "top 85%", once: true, onEnter: () => { if (!reduced) enter(); } });
  if (!reduced) gsap.set([...allCards, emptyCard].filter(Boolean), { y: 380 });

  const onResize = () => render(false);
  window.addEventListener("resize", onResize);
  return () => { window.removeEventListener("resize", onResize); st.kill(); };
}
