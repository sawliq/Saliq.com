# Saliq.com

Portfolio site for Sayed Saliq, built from the Figma file `EBEkbM3fWTjBrbyMG5zL1Y` (page "Portfolio Wireframes", node `502:172`) and the Saliq Portfolio Design System.

```bash
npm install
npm run dev      # local dev server (http://localhost:5173)
npm run build    # production build to dist/ (two pages: index.html, exzyt.html)
```

## Structure
- `index.html` — Home: Hero, Journey, Selected work, Kitchen, Footer
- `exzyt.html` — Exzyt case study: 16 sections with the motion notes from Figma
- `src/embeds/` — the **Pen Path Journey** and **Project Drawer** artifacts, mounted into shadow roots (`mount.js`). To change their content or behaviour, edit `pen-path.*` / `project-drawer.*` (copy lives in the `STOPS` / `PROJECTS` arrays at the top of each `.js`)
- `src/partials/` — shared marquee, navbar + mobile menu, footer (`<!--include:name-->`, see `vite.config.js`)
- `src/styles/` — `tokens.css` (design tokens, mirror of Figma variables), `type.css`, `sections.css` (Home), `case.css` (case study)
- `src/js/` — GSAP modules: hover fills, marquee, journey, work cards, kitchen drawer, footer keycaps, nav; `src/case.js` is the case-study motion
- `docs/motion-notes.md`, `docs/case-study-copy.md` — the annotations and copy read from Figma, kept as the build spec

All motion respects `prefers-reduced-motion` (end states shown, no scrubbing, pins or hover physics).

## Assets still to add
- `public/assets/hero-illustration.png` — Figma node `525:382`, export at 2x
- `public/Sayed-Saliq-Resume.pdf` — résumé linked from the hero and the footer
- Real images and video in the placeholders: work-card media, journey thumbnails, case-study demo video (`<video data-demo-video>` takes a `src`), sitemap, screens, decision boards, polaroids, tool logos (monograms stand in)
- Real URLs: LinkedIn (footer key and hero button), the Exzyt live site, the next case study (`data-href` on `[data-next-card]`)
