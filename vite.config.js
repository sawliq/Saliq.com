import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const __dirname = import.meta.dirname;

// Tiny HTML include: <!--include:name key="value"--> pulls src/partials/name.html.
// Supports {{base}} and {{cur_home|journey|work|kitchen}} (current nav item) tokens.
function htmlPartials() {
  return {
    name: "html-partials",
    enforce: "pre",
    transformIndexHtml(html) {
      return html.replace(/<!--include:([\w-]+)((?:\s+\w+="[^"]*")*)\s*-->/g, (_, name, attrs) => {
        const opts = Object.fromEntries([...attrs.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
        let out = readFileSync(resolve(__dirname, `src/partials/${name}.html`), "utf8");
        out = out.replaceAll("{{home}}", opts.base || "#main").replaceAll("{{base}}", opts.base ?? "");
        for (const k of ["home", "journey", "work", "kitchen"]) {
          out = out.replaceAll(`{{cur_${k}}}`, opts.current === k ? ' aria-current="page"' : "");
        }
        return out;
      });
    },
  };
}

export default defineConfig({
  plugins: [htmlPartials()],
  build: {
    rollupOptions: {
      input: { main: resolve(__dirname, "index.html"), exzyt: resolve(__dirname, "exzyt.html") },
    },
  },
});
