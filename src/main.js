import "./styles/main.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Mobile menu: full-screen inverse sheet, Escape closes, focus returns to toggle
const menu = document.getElementById("menu");
const openBtn = document.querySelector("[data-menu-open]");
const closeBtn = document.querySelector("[data-menu-close]");

function setMenu(open) {
  menu.classList.toggle("is-open", open);
  openBtn.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
  (open ? closeBtn : openBtn).focus();
}
openBtn.addEventListener("click", () => setMenu(true));
closeBtn.addEventListener("click", () => setMenu(false));
menu.querySelectorAll("[data-menu-link]").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
  if (e.key === "Tab" && menu.classList.contains("is-open")) {
    const focusable = menu.querySelectorAll("button, a[href]");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// Motion: only when the user has not asked for reduced motion.
// Content is visible by default, so reduced-motion users see the final state.
gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
  gsap.from("[data-hero-title]", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" });

  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 32,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });

  gsap.utils.toArray(".sticker").forEach((el) => {
    gsap.from(el, { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)", delay: 0.4 });
  });
});
