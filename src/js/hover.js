import { gsap } from "gsap";

// Slush-style invert on hover: a fill circle grows from the pointer's entry point,
// the label swaps colour via CSS (.is-hover), and button arrows nudge 4px.
export function initHover({ reduced }) {
  document.querySelectorAll("[data-hover]").forEach((trigger) => {
    const surface = trigger.querySelector("[data-hover-surface]") || trigger;
    if (surface.matches('[aria-current="page"]')) return;

    const fill = document.createElement("span");
    fill.className = "hover-fill";
    fill.setAttribute("aria-hidden", "true");
    surface.classList.add("has-hover-fill");
    surface.prepend(fill);

    const arrow = surface.querySelector(".btn__arrow");

    // Size the circle so it covers the surface from wherever it starts.
    const placeFill = (event) => {
      const r = surface.getBoundingClientRect();
      const fromPointer = event && "clientX" in event && event.clientX !== 0;
      const x = fromPointer ? gsap.utils.clamp(0, r.width, event.clientX - r.left) : r.width / 2;
      const y = fromPointer ? gsap.utils.clamp(0, r.height, event.clientY - r.top) : r.height / 2;
      const d = 2 * Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
      gsap.set(fill, { left: x, top: y, width: d, height: d });
    };

    const enter = (event) => {
      placeFill(event);
      surface.classList.add("is-hover");
      gsap.fromTo(
        fill,
        { scale: 0, opacity: 1 },
        { scale: 1, duration: reduced ? 0 : 0.22, ease: "power2.out", overwrite: true }
      );
      if (arrow) gsap.to(arrow, { x: 4, duration: reduced ? 0 : 0.15, ease: "power2.out", overwrite: true });
    };

    // Fade out in step with the CSS colour swap so the label never sits on a same-colour fill.
    const leave = () => {
      surface.classList.remove("is-hover");
      gsap.to(fill, {
        opacity: 0,
        duration: reduced ? 0 : 0.15,
        ease: "power1.out",
        overwrite: true,
        onComplete: () => gsap.set(fill, { scale: 0, opacity: 1 }),
      });
      if (arrow) gsap.to(arrow, { x: 0, duration: reduced ? 0 : 0.15, ease: "power2.out", overwrite: true });
    };

    trigger.addEventListener("pointerenter", (e) => e.pointerType !== "touch" && enter(e));
    trigger.addEventListener("pointerleave", (e) => e.pointerType !== "touch" && leave());
    trigger.addEventListener("focus", () => trigger.matches(":focus-visible") && enter());
    trigger.addEventListener("blur", leave);
  });
}
