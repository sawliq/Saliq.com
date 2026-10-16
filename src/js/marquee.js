import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SECONDS_PER_LOOP = 40;

// Seamless linear loop. Scrolling speeds it up and flips direction with the scroll,
// then it eases back to the resting pace.
export function initMarquee() {
  const root = document.querySelector("[data-marquee]");
  const track = root?.querySelector("[data-marquee-track]");
  if (!track) return () => {};

  const source = track.firstElementChild;
  let loop;
  let trigger;
  let boostTl;

  const build = () => {
    boostTl?.kill();
    loop?.kill();
    trigger?.kill();
    track.querySelectorAll("[data-marquee-clone]").forEach((n) => n.remove());
    gsap.set(track, { x: 0 });

    // One "half" must be at least a viewport wide so the wrap point is never visible.
    const groupWidth = source.offsetWidth;
    const perHalf = Math.max(1, Math.ceil(root.offsetWidth / groupWidth));
    for (let i = 1; i < perHalf * 2; i++) {
      const clone = source.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.dataset.marqueeClone = "";
      track.append(clone);
    }

    loop = gsap.to(track, {
      x: -groupWidth * perHalf,
      duration: SECONDS_PER_LOOP * perHalf,
      ease: "none",
      repeat: -1,
    });

    trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 300);
        boostTl?.kill();
        boostTl = gsap.timeline()
          .to(loop, { timeScale: boost * self.direction, duration: 0.2, ease: "power1.out" })
          .to(loop, { timeScale: self.direction, duration: 1.2, ease: "power2.out" });
      },
    });
  };

  build();
  const onResize = debounce(build, 200);
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("resize", onResize);
    boostTl?.kill();
    loop?.kill();
    trigger?.kill();
    track.querySelectorAll("[data-marquee-clone]").forEach((n) => n.remove());
    gsap.set(track, { clearProps: "transform" });
  };
}

function debounce(fn, ms) {
  let t;
  return () => {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}
