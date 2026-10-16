import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const q = (s) => document.querySelector(s);
const qa = (s) => gsap.utils.toArray(s);

// Entrance: headline lines rise out of their masks, then supporting copy and the illustration settle in.
export function heroIntro({ reduced }) {
  const lines = qa("[data-hero-line]");
  const intro = qa("[data-hero-intro]");
  const illustration = q("[data-hero-illustration]");

  if (reduced) {
    gsap.set([...lines, ...intro, illustration], { autoAlpha: 1 });
    return;
  }

  gsap.set(lines, { yPercent: 110, autoAlpha: 1 });
  gsap.set(intro, { y: 24, autoAlpha: 0 });
  gsap.set(illustration, { y: 48, scale: 0.96, autoAlpha: 0, transformOrigin: "50% 100%" });

  gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.1 })
    .to(lines, { yPercent: 0, duration: 1.1, stagger: 0.12 })
    .to(illustration, { y: 0, scale: 1, autoAlpha: 1, duration: 1.2, ease: "expo.out" }, 0.2)
    .to(intro, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.45);
}

// Scroll-out: the two headline lines drift apart, the illustration lifts away slower than the page.
export function heroParallax() {
  const hero = q("[data-hero]");
  const [lineA, lineB] = qa("[data-hero-line]");
  const illustration = q("[data-hero-illustration]");
  if (!hero) return;

  gsap.timeline({
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
    defaults: { ease: "none" },
  })
    .to(lineA, { xPercent: -6 }, 0)
    .to(lineB, { xPercent: 10 }, 0)
    .to(illustration, { yPercent: -12, rotation: -2 }, 0);
}

// Generic reveal for sections still to be built: add data-reveal to any block.
export function revealOnScroll() {
  const items = qa("[data-reveal]");
  if (!items.length) return;
  gsap.set(items, { y: 32, autoAlpha: 0 });
  ScrollTrigger.batch(items, {
    start: "top 85%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: "power3.out" }),
  });
}

// Hairline under the sticky navbar once the marquee has scrolled away.
export function navbarState() {
  const navbar = q("[data-navbar]");
  const marquee = q("[data-marquee]");
  if (!navbar) return;
  ScrollTrigger.create({
    start: () => (marquee?.offsetHeight ?? 0) + 1,
    end: "max",
    toggleClass: { targets: navbar, className: "is-stuck" },
  });
}

export function scrollCue({ reduced }) {
  const cue = q("[data-scroll-cue]");
  const arrow = q("[data-scroll-cue-arrow]");
  if (!cue) return;

  if (!reduced && arrow) {
    gsap.to(arrow, { y: 4, duration: 0.9, ease: "sine.inOut", repeat: -1, yoyo: true });
  }

  cue.addEventListener("click", (event) => {
    event.preventDefault();
    const navHeight = q("[data-navbar]")?.offsetHeight ?? 0;
    const target = q(cue.getAttribute("href"));
    // Until the Work section exists, fall back to the end of the hero.
    const y = target ?? q("[data-hero]").offsetTop + q("[data-hero]").offsetHeight;
    gsap.to(window, {
      scrollTo: { y, offsetY: navHeight, autoKill: true },
      duration: reduced ? 0 : 1,
      ease: "power3.inOut",
    });
  });
}
