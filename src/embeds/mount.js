import { mountPenPath } from "./pen-path.js";
import { mountProjectDrawer } from "./project-drawer.js";
import penCss from "./pen-path.css?inline";
import penHtml from "./pen-path.html?raw";
import drawerCss from "./project-drawer.css?inline";
import drawerHtml from "./project-drawer.html?raw";

const EMBEDS = {
  "pen-path": { css: penCss, html: penHtml, mount: mountPenPath },
  "project-drawer": { css: drawerCss, html: drawerHtml, mount: mountProjectDrawer },
};

// Each embed lives in its own shadow root, so its ids, classes and tokens stay separate from the site.
export function mountEmbeds() {
  document.querySelectorAll("[data-embed]").forEach((host) => {
    const def = EMBEDS[host.dataset.embed];
    if (!def || host.shadowRoot) return;
    const sroot = host.attachShadow({ mode: "open" });
    sroot.innerHTML = `<style>${def.css}</style>${def.html}`;
    def.mount(host, sroot);
  });
}
