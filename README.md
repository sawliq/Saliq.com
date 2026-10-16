# Saliq.com

Portfolio site for Sayed Saliq, built from the Figma file `EBEkbM3fWTjBrbyMG5zL1Y` and the Saliq Portfolio Design System.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

- `src/styles/tokens.css` — design tokens (mirror of the Figma variables; keep names in sync)
- `src/styles/type.css` — type utility classes
- `src/js/` — GSAP motion: `hover.js` (invert-on-hover fill), `marquee.js` (loop + scroll velocity), `scroll.js` (hero intro, parallax, reveals, scroll cue), `menu.js` (mobile sheet)
- Add `data-reveal` to any new block to get the scroll-in reveal.
- All motion respects `prefers-reduced-motion`.

## Assets to add
- `public/assets/hero-illustration.png` — export Figma node `525:382` at 2x
- `public/Sayed-Saliq-Resume.pdf` — résumé linked from the hero
