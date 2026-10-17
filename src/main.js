import "./styles/main.css";
import { gsap, ScrollTrigger, reduced, syncNavHeight } from "./js/gsap-setup.js";
import { initHover } from "./js/hover.js";
import { initMarquee } from "./js/marquee.js";
import { initMenu } from "./js/menu.js";
import { heroIntro, heroParallax, navbarState, scrollCue } from "./js/scroll.js";
import { initJourney } from "./js/journey.js";
import { initWork } from "./js/work.js";
import { initKitchen } from "./js/kitchen.js";
import { initFooter, initStickers } from "./js/footer.js";
import { initAnchors, initNavSpy } from "./js/nav.js";

syncNavHeight();
window.addEventListener("resize", syncNavHeight);

// Keep the illustration slot sized even if the asset is missing.
const illustration = document.querySelector("[data-hero-illustration]");
illustration?.querySelector("img")?.addEventListener("error", () => illustration.classList.add("is-missing"));

heroIntro({ reduced });
document.documentElement.classList.add("is-ready");

initMenu({ reduced });
initAnchors();
scrollCue({ reduced });
navbarState();

if (!reduced) heroParallax();

// Build order follows page order so each pin's spacing is known to the triggers below it.
initJourney();
initWork();
initKitchen();
initFooter();
initStickers();
initNavSpy();
initHover({ reduced });

document.fonts.ready.then(() => {
  syncNavHeight();
  if (!reduced) initMarquee();
  ScrollTrigger.refresh();
});
