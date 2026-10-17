import { gsap, ScrollTrigger, q, qa, reduced } from "./gsap-setup.js";
import { toast } from "./toast.js";

const TOOLS = [
  ["Figma", "Fg", "#F24E1E"], ["FigJam", "FJ", "#A259FF"], ["Figma AI", "AI", "#0ACF83"], ["Figma Agent", "Ag", "#1ABCFE"],
  ["Framer", "Fr", "#0055FF"], ["Claude", "Cl", "#D97757"], ["ChatGPT", "GP", "#10A37F"], ["Cursor", "Cu", "#111111"],
  ["Antigravity", "An", "#4285F4"], ["Wispr Flow", "Wf", "#6C47FF"], ["Jira", "Ji", "#0052CC"], ["Mobbin", "Mb", "#111111"],
  ["Miro", "Mi", "#FFD02F"], ["LottieFiles", "Lo", "#00DDB3"], ["Microsoft Teams", "Tm", "#6264A7"], ["Notion", "No", "#111111"],
  ["Super Docs", "SD", "#FF6B35"], ["Supabase", "Sb", "#3ECF8E"], ["Starbucks (a bit)", "Sx", "#00704A"],
];

// Placeholder monograms stand in for the official logos until the SVGs are added.
function buildToolkit() {
  const items = q("[data-toolkit-items]");
  if (!items) return () => {};
  const make = (hidden) =>
    TOOLS.map(([name, mark, color]) => {
      const li = document.createElement("li");
      li.className = "tool-chip label-caps";
      li.style.setProperty("--tool-color", color);
      if (hidden) li.setAttribute("aria-hidden", "true");
      li.innerHTML = `<span class="tool-chip__logo" aria-hidden="true">${mark}</span><span>${name}</span>`;
      return li;
    });
  items.append(...make(false), ...make(true), ...make(true));

  // Loops left to right in about 40s, one set at a time.
  const setW = () => (items.scrollWidth + 12) / 3; // 12 = flex gap that trails each set
  gsap.set(items, { x: () => -setW() });
  const loop = reduced
    ? null
    : gsap.to(items, { x: () => 0, duration: 40, ease: "none", repeat: -1, modifiers: {} });
  const pause = () => loop?.timeScale(0.25);
  const play = () => loop?.timeScale(1);
  items.addEventListener("pointerenter", pause);
  items.addEventListener("pointerleave", play);

  const onResize = () => { loop?.invalidate(); };
  window.addEventListener("resize", onResize);
  return () => { window.removeEventListener("resize", onResize); loop?.kill(); };
}

function initCards() {
  qa("[data-work-card]").forEach((card) => {
    const chip = q("[data-chip]", card);
    const bar = q("[data-progress]", card);
    const soon = card.hasAttribute("data-soon");
    const rest = chip?.dataset.chipRest ?? "";
    let prog;

    // Media loop: progress runs only while the card is in view. With reduced motion it sits on the poster.
    if (!reduced && bar) {
      prog = gsap.fromTo(bar, { width: "0%" }, { width: "100%", duration: 12, ease: "none", repeat: -1, paused: true });
      ScrollTrigger.create({ trigger: card, start: "top 90%", end: "bottom 10%", onToggle: (self) => (self.isActive ? prog.play() : prog.pause()) });
    } else if (bar) {
      bar.style.width = "38%";
    }

    const enter = () => {
      card.classList.add("is-hover");
      if (chip) chip.textContent = soon ? "Case study coming soon" : "Open case study";
      if (reduced && prog) prog.play();
    };
    const leave = () => {
      card.classList.remove("is-hover");
      if (chip) chip.textContent = rest;
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("focus", enter);
    card.addEventListener("blur", leave);
    if (soon) card.addEventListener("click", (e) => { e.preventDefault(); toast("Case study coming soon"); });

    if (!reduced) {
      const arrow = q(".icon-btn--filled .icon-btn__glyph", card);
      card.addEventListener("pointerenter", () => arrow && gsap.to(arrow, { x: 4, duration: 0.15, ease: "power2.out" }));
      card.addEventListener("pointerleave", () => arrow && gsap.to(arrow, { x: 0, duration: 0.15, ease: "power2.out" }));
    }
  });
}

export function initWork() {
  const stopToolkit = buildToolkit();
  initCards();

  if (!reduced) {
    const cards = qa(".work-card");
    gsap.set(cards, { y: 48, autoAlpha: 0 });
    ScrollTrigger.batch(cards, {
      start: "top 88%", once: true,
      onEnter: (b) => gsap.to(b, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }),
    });
  }
  return stopToolkit;
}
