# Felix Onfermann — mobile Work page, reworked

Kai's idea (2026-11-09): on mobile, the selected work sits centred, with one endless strip of every work along the bottom.
The one in the middle of the strip is the one on the stage: full opacity, the rest dimmed. Three strip designs to compare.

Run it: `python3 felix/_serve.py` → http://localhost:8030 (phone: http://<Mac IP>:8030). Options live in the **Tune** tab (the portfolio's panel, 1:1): Strip (pill / plain / lens, + fixed on desktop) and Nav (CAPS / lower). URL: `?strip=…&nav=lower`; `?ui=0` hides Tune.

## Sourced from his live code (felixonfermann.com, read 2026-11-09)
- CSS chunk `2l0wwpef4_3n1.css`: Geist Mono 11/14, micro 9/12 at #0006, margin 16 / gutter 12 (mobile), header padding 16 16 12, nav gap 16,
  viewer padding-top 56, stage padding 16 0, `.fade` 0.3s, hover dim 0.35, placeholder #f0f0f0, thumbs gap 8 on mobile.
- Viewer chunk `2ghhiw1po9ybg.js`: swipe > 40px, prev/next zones 30% wide, series first then the next work, wraps both ends,
  going back into a series lands on its last image, Sanity `?w=&auto=format&q=80`, video `#t=` start kept / end dropped.
- `data.js`: the 43 works, titles, credits, series and clips from the payload his page ships. Images load from his Sanity CDN.

## The strips (round 1: pill, lens, barcode · round 2: plain, fixed, side)
- **pill**: his grid row sideways. Natural ratios at 44px, gap 8, his numbers underneath. The current one sits in a grey pill (#f0f0f0, r 8) that morphs to its width.
- **plain**: exactly pill, no pill. Opacity alone (0.35 → 1) marks the middle one.
- **fixed**: the strip doesn't recentre. A plain row you scroll yourself (native momentum, starts at the 16px margin). The grey pill and the full opacity travel along it to the pick (420ms, power3.out); the row only scrolls when the pick would leave the view. Not endless, but stepping still wraps 043 → 001 like his site.
- **side**: pill stood up on the right. A 52px column, every thumb 40px wide (height from its ratio), number 3px under it inside the pill. Its middle is the stage's middle.
- **lens**: 28px square crops, gap 4. The middle swells back to its true ratio at 56px (bell falloff, σ 0.85). Black index pill under it.
- **barcode**: 6px slivers, gap 2, so the whole body of work fits one line. The middle one opens to its full ratio (σ 0.55). Number above, a 2px black pill under it.

Motion: one fractional position drives everything. Drag maps pixels to works by the local step, a flick throws `v × 0.24` works (max 14), then a near-critical spring (k 210) settles on a whole work. The stage crossfades 0.3s each time the middle work changes.

## Round 2 fix
- Header: the nav now sits on the name's baseline (Kai). His live site centres the nav, 4px above the name's baseline. Both now use his 8px line box with `align-items: flex-end`; measured baseline 32px for the name, WORK and INFO.

## Round 3 (Kai)
- fixed: fixed in size too. All 43 share the content width (16 → 374 on a 390 phone, 6.4px each, gap 2, cropped). A finger on the row picks what's under it, live, and the pill follows (120ms under the finger, 420ms for steps). Not scrollable any more.
- No numbers on pill, plain, lens (the thumbs moved back to the strip's centre line). Side and barcode keep theirs.

## Round 4 (Kai)
- The top switcher is gone; a Tune tab on the edge instead (right on the phone, left on desktop because the strip owns the right edge).
- Tune → Nav: his caps, or lowercase (work / archive / info).
- Dropped: barcode, side, fixed-on-phone. Phone keeps pill, plain, lens.
- Desktop (his 900px breakpoint, his desktop tokens: margin 24, gutter 16, stage padding 32 / 40, meta + count in the bottom corners):
  the same strips stood up in an 80px right column, thumbs 64px wide (lens 40 → 80), plus **fixed**: all 43 share the column's height,
  hover or drag picks what's under the pointer. The page mirrors that column on the left so the picture stays on the page's centre.
  Wheel / trackpad anywhere scrolls through the works and settles after 140ms; fixed steps one work per 60px of wheel.

## Round 5 (Kai): desktop index, smaller
- `works/`: his desktop index (chunk 1yt3xaqnta39o.js) rebuilt 1:1. Ragged rows: 56px thumbs, 10px gaps, rows 82px apart, each row breaking at a seeded random 0.35–1.0 of his column (mulberry32, seed 24 from his payload); hover dims the rest to 0.35; sticky preview with the series flip every 2.2s and the caption.
- Reworked: Tune → Scale (50% default / 65% / His). The rows shrink and break at the same fractions of a column scaled the same way, so it's his exact index, smaller, flush left in 1 / span 6. The preview gets the right half (7 / span 6). "His" = his live layout; it matches his left/top values to the pixel.
- Number labels stay at his 9px. At 50% the narrowest portrait thumbs are about 19px wide, so neighbouring labels sit close.
- Clicking a work opens the viewer on it (`../?w=<slug>`); "other works" open on his live site.
- Tune moved to shared `tune.js` / `tune.css` (both pages).
- Git: PUBLIC repo https://github.com/kailevan/felix-onfermann-rework (Felix can Code → Download ZIP). GitHub Pages live: https://kailevan.github.io/felix-onfermann-rework/ (viewer) and …/works/ (index). Link sent to Kai 2026-11-09 to share with Felix.

## Resume here (2026-11-09)
- Done and pushed; nothing open. Next = whatever Felix / Kai say after seeing it.
- Local: `python3 _serve.py` → :8030 (phone: http://<Mac LAN IP>:8030/, `ipconfig getifaddr en0`).
- Any change: commit with Kai's identity, push with `-c http.version=HTTP/1.1`; Pages rebuilds itself (~1 min).
