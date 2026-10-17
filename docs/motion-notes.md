# Motion notes (from Figma, frames 589:2263–589:2311)

GSAP + ScrollTrigger. One note per section. Respect prefers-reduced-motion: show the end state, skip the motion.

01 Hero — Load: title lines rise from below with a 60ms stagger (0.8s, power3.out). The highlight bar scales from 0 to full width, left to right, after the title. The sticker drops in and settles at -10deg with a small bounce. Tags and buttons fade up last.
02 Hero media — Scroll-scrubbed: media scales 0.9 -> 1 and corner radius 48 -> 24 as it enters. Demo autoplays muted in view, pauses off-screen. Over the media the cursor becomes a round Play label.
03 Project details + case nav — Case nav pins under the navbar at the top. Active pill follows the section in view (one ScrollTrigger per section); clicking a pill smooth-scrolls to it.
04 Overview — Stats count up from 0 when 40% in view (1.2s). Stat cards enter with an 80ms stagger.
05 Problem — Seller card slides in from the left, buyer card from the right. Business problem band reveals with a clip-path wipe. The How might we line reveals word by word.
06 Research — Competitor cards stagger up. On hover a card lifts and its "What we took" line gets an accent underline.
07 Strategy — Pinned horizontal scroll on desktop: the four calls slide across while pinned. Constraint rules draw in left to right.
08 Product walkthrough — Title words reveal through a mask. Sitemap pans slowly (parallax 0.85). Walkthrough is a sticky split: steps scroll left while the screen on the right stays pinned and crossfades to the matching screen. Active step gets the accent rule and full opacity; the screen stack below highlights the current thumbnail.
09 Decisions — Per decision: number slides up, three columns fade in with a stagger, then the board scales from 0.96 with slight parallax. Hovering the board zooms it to 1.02.
10 Edge cases — Ticks draw in one by one. Known-gaps card dashed border moves slowly (marching ants).
11 Scrappy artifacts — Polaroids scatter in from below with random rotation and settle at their angle. Draggable on desktop (GSAP Draggable with inertia).
12 Impact — Rows reveal top to bottom. In each row the before value strikes through, then the after value counts up in the accent colour.
13 Risks + what stays human — Two columns reveal in sequence. Each item's top rule draws in before its text.
14 Reflection + future — Numbers count up as each reflection enters. Future cards lift on hover.
15 Next project — Hover tints the card in the next project's colour. Click runs a page transition where the card expands to fill the screen.
16 Footer — Contact — Same as home: keycaps press down on hover; L, I, M and R work as keyboard shortcuts.
