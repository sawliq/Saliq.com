import { gsap, ScrollTrigger, q, qa, reduced } from "./gsap-setup.js";
import { toast } from "./toast.js";

// Stickers drop in and settle at their angle with a small bounce.
export function initStickers() {
  qa("[data-sticker]").forEach((st) => {
    const rot = parseFloat(getComputedStyle(st).getPropertyValue("--rotate")) || 0;
    gsap.set(st, { rotation: rot });
    if (reduced) return;
    gsap.fromTo(st, { y: -160, rotation: rot - 24, autoAlpha: 0 }, {
      y: 0, rotation: rot, autoAlpha: 1, duration: 1.1, ease: "bounce.out",
      scrollTrigger: { trigger: st, start: "top 92%", once: true },
    });
  });
}

export function initFooter() {
  const footer = q("[data-footer]");
  if (!footer) return () => {};

  // Headline rises out of its masks.
  const lines = qa("[data-footer-line]", footer);
  if (!reduced) {
    gsap.set(lines, { yPercent: 110 });
    gsap.to(lines, { yPercent: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: footer, start: "top 70%", once: true } });
    const items = qa(".footer__lede, .footer__availability, .key, .footer__base", footer);
    gsap.set(items, { y: 32, autoAlpha: 0 });
    ScrollTrigger.batch(items, { start: "top 95%", once: true, onEnter: (b) => gsap.to(b, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" }) });
  }

  // Keycaps press down 6px on hover or focus; L, I, M, R trigger them from the keyboard.
  const keys = qa("[data-key]", footer);
  const press = (btn, on) => gsap.to(btn, { "--press": on ? "6px" : "0px", duration: reduced ? 0 : on ? 0.1 : 0.2, ease: on ? "power2.out" : "back.out(2)", overwrite: "auto" });
  keys.forEach((btn) => {
    btn.addEventListener("pointerenter", () => press(btn, true));
    btn.addEventListener("pointerleave", () => press(btn, false));
    btn.addEventListener("focus", () => btn.matches(":focus-visible") && press(btn, true));
    btn.addEventListener("blur", () => press(btn, false));
  });
  const onKey = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
    if (document.querySelector("[data-open], [data-menu]:not([hidden])")) return;
    const btn = keys.find((k) => k.dataset.key === e.key.toLowerCase());
    if (!btn) return;
    btn.classList.add("is-pressed");
    press(btn, true);
    setTimeout(() => { btn.classList.remove("is-pressed"); press(btn, false); }, 220);
    btn.click();
  };
  document.addEventListener("keydown", onKey);

  // Copy email
  q("[data-copy-email]", footer)?.addEventListener("click", async (e) => {
    const text = e.currentTarget.textContent.trim();
    try { await navigator.clipboard.writeText(text); toast("Email copied"); }
    catch {
      const r = document.createRange(); r.selectNodeContents(e.currentTarget);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      toast("Press copy to copy the email");
    }
  });

  // Dubai time
  const clock = q("[data-local-time]", footer);
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", hour12: false });
  const tick = () => { if (clock) clock.textContent = `Dubai · ${fmt.format(new Date())} GST`; };
  tick();
  const timer = setInterval(tick, 20000);

  q("[data-back-to-top]", footer)?.addEventListener("click", (e) => {
    e.preventDefault();
    gsap.to(window, { scrollTo: 0, duration: reduced ? 0 : 1.2, ease: "power3.inOut" });
  });

  return () => { document.removeEventListener("keydown", onKey); clearInterval(timer); };
}
