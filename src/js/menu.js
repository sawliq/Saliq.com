import { gsap } from "gsap";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Full-screen inverse sheet: focus trap, Escape to close, focus returns to the opener.
export function initMenu({ reduced }) {
  const menu = document.querySelector("[data-menu]");
  const openBtn = document.querySelector("[data-menu-open]");
  const closeBtn = menu?.querySelector("[data-menu-close]");
  if (!menu || !openBtn || !closeBtn) return;

  const links = menu.querySelectorAll(".mobile-menu__list li");
  const d = (s) => (reduced ? 0 : s);

  const open = () => {
    menu.hidden = false;
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    gsap.timeline()
      .fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: d(0.5), ease: "power3.inOut" })
      .fromTo(links, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: d(0.5), stagger: 0.06, ease: "power3.out" }, "-=0.2");
    closeBtn.focus();
    document.addEventListener("keydown", onKeydown);
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (menu.hidden) return;
    document.removeEventListener("keydown", onKeydown);
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    gsap.to(menu, {
      clipPath: "inset(0 0 100% 0)",
      duration: d(0.4),
      ease: "power3.inOut",
      onComplete: () => {
        menu.hidden = true;
        if (restoreFocus) openBtn.focus();
      },
    });
  };

  function onKeydown(event) {
    if (event.key === "Escape") return close();
    if (event.key !== "Tab") return;
    const items = [...menu.querySelectorAll(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", () => close());
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => close({ restoreFocus: false })));
  window.matchMedia("(min-width: 768px)").addEventListener("change", (e) => e.matches && close({ restoreFocus: false }));
}
