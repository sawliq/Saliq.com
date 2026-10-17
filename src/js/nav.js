import { gsap, ScrollTrigger, q, qa, reduced, syncNavHeight } from "./gsap-setup.js";

// Anchors scroll smoothly and clear the sticky navbar.
export function initAnchors() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || e.defaultPrevented || a.hasAttribute("data-soon")) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = q(id);
    if (!target) return;
    e.preventDefault();
    gsap.to(window, { scrollTo: { y: target, offsetY: id === "#main" ? 0 : syncNavHeight() - 1, autoKill: true }, duration: reduced ? 0 : 1, ease: "power3.inOut" });
    history.replaceState(null, "", id);
  });
}

// The active pill follows the section in view.
export function initNavSpy() {
  const map = [["#main", "[data-hero]"], ["#journey", "[data-journey]"], ["#work", "#work"], ["#kitchen", "#kitchen"]];
  const pills = qa(".nav-capsule .nav-pill");
  const setActive = (href) => pills.forEach((p) => {
    const on = p.getAttribute("href") === href || (href === "/" && p.getAttribute("href") === "/");
    on ? p.setAttribute("aria-current", "page") : p.removeAttribute("aria-current");
  });
  // Home pill links to "/"
  const homeHref = pills[0]?.getAttribute("href");
  map.forEach(([href, sel]) => {
    const el = q(sel);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top 45%", end: "bottom 45%",
      onToggle: (self) => self.isActive && setActive(href === "#main" ? homeHref : href),
    });
  });
}
