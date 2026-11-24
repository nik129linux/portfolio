# Projects as a fly-through field of screens: design

Date: 2026-11-22. Replaces the orbit's look (devices, glass N core, threads). Status: waiting for Nico.

## Intent
Nico disliked the N core and the threads, and wants the projects to feel like madebyigor.com: the cobalt
"What I build" fades to a subtle white, then the real project screenshots float as thin, slightly curved
screens on a moving grainy gradient, and scrolling flies through them.

## Approaches (Nico picked 1)
1. Fly-through field: many screens scattered in depth, scroll moves the camera forward, the project in
   focus comes to the front. Closest to Igor, loudest.
2. Same orbit with bare curved screens on the gradient. Keeps the ring.
3. One big curved screen that swaps project with a warp. Calmest.

## Design (my calls, correctable)
- **Transition:** Projects opens with a gradient from the accent to near-white over its first screen.
- **Background:** a full-stage shader: slow grainy gradient in tokens (cobalt, a pale cobalt, paper),
  one soft hotspot drifting (cycle >= 6 s). Ink text stays readable on its light areas.
- **Screens:** every screenshot of every project (about 25) is a thin plane bent like a curved display,
  phone shots tall, watch shots square. Each project owns a "station" along the z axis: its first screen
  sits centred at the station, its other screens float around it at different depths.
- **Scroll:** the camera flies forward station to station (same tall track and sticky stage as now).
  Screens bend a bit more and smear slightly with scroll speed, and settle when you stop. The screens
  also lean toward the pointer.
- **Kept as is:** title, kind and `NN / 06` caption, chips, click on the focused screen or a chip opens
  the animated panel, list fallback under 768 px / reduced motion / no WebGL, <= 100 draw calls.
- **Removed:** device frames, the glass N core, the threads and their pulse.
- **Tests:** the orbit specs keep their DOM contract (`project-orbit`, `orbit-track`, `orbit-stage`,
  `data-front`, `data-ready`) so they still judge scroll order, chips and fallbacks; new specs check that
  the section starts on the accent and fades to light, and that no device frame or core remains.
- **Screenshots:** new ones come from the Muse run started today (latest code of all six projects).
