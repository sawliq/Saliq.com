import { gsap } from "./gsap-setup.js";

let el;
export function toast(msg) {
  if (!el) {
    el = document.createElement("div");
    el.className = "toast label-caps";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  gsap.killTweensOf(el);
  gsap.fromTo(el, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" });
  gsap.to(el, { autoAlpha: 0, y: 12, duration: 0.25, delay: 1.8, ease: "power2.in" });
}
