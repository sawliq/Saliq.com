import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, MotionPathPlugin, DrawSVGPlugin, Draggable, InertiaPlugin, Flip, SplitText);

export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const q = (s, r = document) => r.querySelector(s);
export const qa = (s, r = document) => gsap.utils.toArray(s, r);
export { gsap, ScrollTrigger, Draggable, Flip, SplitText };

// Measured once and on resize so pinned sections and anchor scrolls clear the sticky navbar.
export function syncNavHeight() {
  const h = q("[data-navbar]")?.offsetHeight ?? 96;
  document.documentElement.style.setProperty("--nav-h", `${h}px`);
  return h;
}
