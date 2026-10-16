import "./styles/main.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initHover } from "./js/hover.js";
import { initMarquee } from "./js/marquee.js";
import { initMenu } from "./js/menu.js";
import { heroIntro, heroParallax, revealOnScroll, navbarState, scrollCue } from "./js/scroll.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Keep the illustration slot sized even if the asset is missing.
const illustration = document.querySelector("[data-hero-illustration]");
illustration?.querySelector("img")?.addEventListener("error", () => illustration.classList.add("is-missing"));

heroIntro({ reduced });
document.documentElement.classList.add("is-ready");

initHover({ reduced });
initMenu({ reduced });
scrollCue({ reduced });
navbarState();

// Motion-heavy pieces only run when the user hasn't asked for reduced motion.
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  heroParallax();
  revealOnScroll();
  let stopMarquee = () => {};
  // Measure the marquee after webfonts settle so the loop width is right.
  document.fonts.ready.then(() => {
    stopMarquee = initMarquee();
    ScrollTrigger.refresh();
  });
  return () => stopMarquee();
});
