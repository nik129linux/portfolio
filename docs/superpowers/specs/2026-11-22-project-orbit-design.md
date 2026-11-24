# Project orbit (R3F) — design

Status: APPROVED by Nico 2026-11-22 and built (uncommitted, undeployed, waiting for his visual check on localhost).
Replaces: `components/projects/ProjectRing.tsx` + `app/ring.css` (CSS 3D ring) and the tile grid under it.

## Intent
Nico's portfolio is graded for Interfaces and read by recruiters. The Projects section should be the
signature moment after the hero: real previews of the real apps, orbiting a core, tied to it by threads,
turned by scroll, and a click opens the project (description + links). Nico's reasons, in his words:
the old ring had an ugly box (a Tailwind `.ring` collision, already fixed), he does not want a grid under
the ring because it is redundant, and he does not want the 3D icons reused again.
"Orbiting around something" = a core node, "C" idea: the backend/API at the middle, projects as services.

## Goals
- 6 projects orbit a core: Retoma, Acompaña, Hand Hygiene Watch, Lumenfall, CanTrack, CotizaIA.
- Each orbiter is the app's real screen inside a device frame (laptop / phone / watch), never a 3D icon.
- Threads core -> each preview; a packet travels the thread of the project in front.
- Scroll turns the orbit (scrubbed, reversible). Click a preview or a chip opens the detail panel.
- Detail panel: screenshots, description, tech chips, GitHub / live demo / download (only links that work).
- No section under the orbit on desktop.

## Non-goals / anti-goals
- No 3D icons (laptop.png etc.) in the orbit. They stay in the hero.
- No flat rectangles: a bare screenshot plane is a failure even if it renders.
- No invented screenshots, descriptions or links. Unknown = `[placeholder]`, hidden by `ProjectLinks`.
- No custom cursor, no purple, no raw hex/duration in components (PRODUCT.md, `app/globals.css` tokens).
- No deploy, no commit in this task.

## Constraints
- Palette "Sky on cream", one light-blue accent, Bricolage + Hanken, English copy, no em dashes.
- Motion slow, scroll-driven, reversible. Reduced motion leaves everything readable.
- three.js cannot read CSS variables: read tokens once at mount with `getComputedStyle`.
- Budget: <= 100 draw calls, <= 200K triangles on phone, textures <= 2048 px, pixel ratio <= 2, stop
  rendering off screen (scroll-film skill). Real phone at 60 fps before calling it done.
- The teacher's guide asks per project: image, title, description, tech tags, GitHub + live links, and a
  responsive grid (1 col mobile, 2-3 desktop). The panel covers the first four. See Risk 1.
- Existing e2e specs assume the tile grid; they get rewritten on purpose, never weakened.

## Approaches considered
1. CSS 3D + one `--orbit` number (no new deps, ~same look). Rejected by Nico: wants real light and
   depth on the device frames.
2. **React Three Fiber (chosen by Nico).** Real 3D: device bezels with light, threads as 3D lines, true
   depth sorting. Costs three + fiber + drei (~150 KB gz), canvas is harder to test, needs fallbacks.
3. Time-driven auto-orbit. Loses the scroll story.

## Design
**Data.** `data/projects.ts`: remove `linked-beats` and `octree`; add `cotizaia` (kind "Web",
`collaboration: true`, GitHub `https://github.com/GUERRREROALEXANDER/frontend-cotizaIA`, demo
`https://frontend-cotizaia-swart.vercel.app/` (given by Nico), stack React / Vite / Tailwind CSS / Framer Motion / Java, summary written only from
its README: an operations center where an agent turns a client brief into a priced proposal through a
seven-stage pipeline with evidence per stage). Give `cantrack` and `cotizaia` real `screens` (below).
Sources, already on disk:
- CotizaIA (1440x900, crop tall ones to the top 900): `frontend-cotizaIA/.qa/shots/combo-pricing-light.png`,
  `light-1440-resumen.png`, `agent-run-light.png`.
- CanTrack (390 phone, 780x1688): `cantrack/.loop/s2/s2-plan-390.png`, `s3/s3-owner-activity-390.png`,
  `s3/s3-walker-draft-390.png`. Skipped on purpose: `s2-clients` (shows phone numbers), `pr2-4`/`pr2-6`
  (stray cursor), `pr2-2` (double-stacked capture).
Output `public/projects/<slug>/NN.webp` (<= 1280 px wide) + `screens.json` with captions, like the others.
`device`: cantrack "phone", cotizaia "laptop".

**Components** (all in `components/projects/`):
- `ProjectOrbit.tsx` (client): section body. Chooses mode once: `orbit` if width >= 768, no reduced
  motion and WebGL works; else `list`. Loads the canvas with `next/dynamic({ ssr:false })`.
- `OrbitScene.tsx`: R3F scene. Core = accent sphere with a soft light. One `DeviceCard` per project on a
  tilted ring. One `Thread` per project (line core -> card, packet when that card is in front).
- `DeviceCard.tsx`: rounded-box bezel + screen plane with the first screen as texture. Shape by
  `project.device`: laptop 16:10, phone 9:19.5, watch near-square, monitor 16:10.
- `ProjectDetail.tsx`: DOM dialog (not in the canvas): `role="dialog"`, Esc closes, focus returns to the
  trigger. Content from the project; links through the existing `ProjectLinks`.
- `ProjectChips.tsx`: one real button per project, visible under the orbit (names only). Clicking turns
  the orbit to that project and opens the detail. This is the keyboard / screen-reader path, since the
  canvas is not accessible. My call: chips are an index, not a second grid.
- `ProjectList.tsx`: fallback for phone, reduced motion, no WebGL: one row per project (title, kind,
  one line, "Details" button opening the same panel).

**Scroll.** Section is a tall track with a sticky stage (same pattern as today). A scrubbed ScrollTrigger
writes progress 0..1 into a ref; `useFrame` reads the ref (never a scroll event) and eases the angle
with `dt`. Front project = `round(progress * (n - 1))`. The front card scales toward the camera and its
caption (real HTML over the canvas) shows title and kind. Root exposes `data-front="<slug>"` for tests.

**Colors.** Core, light and thread colors come from `--accent`, `--accent-strong`, `--ink`, `--paper`
via `getComputedStyle(document.documentElement)` at mount.

**Delegation (Nico: bulk to opencode Go).** I write `OrbitScene`, `DeviceCard`, `Thread`, `ProjectOrbit`
(the taste layer: composition, camera, materials, motion). Delegates, disjoint files, one lane each:
(a) data + assets (`data/projects.ts`, webp crops, `screens.json`), (b) `ProjectDetail`, `ProjectChips`,
`ProjectList` to a DOM contract I write, (c) the rewritten e2e specs. I verify all of it myself.

## Risks / open items
1. The teacher's checklist names a responsive grid. On desktop it will not exist; only phones get the
   list. Nico accepted "no section below"; it is his call whether the grader sees that as a miss.
2. Playwright's headless Chromium may not render WebGL. First task: spike a canvas test with software GL
   (`--use-gl=swiftshader`). If it cannot, tests assert the DOM contract (chips, dialog, `data-front`)
   and a non-blank canvas check is manual.
3. CotizaIA is a team project in a teammate's GitHub account. Shown with the collaboration marker.
   Its live demo URL is unknown: placeholder until Nico supplies it.
4. New dependencies: `three`, `@react-three/fiber`, `@react-three/drei` (needs Nico's OK to install).

## Left to the builder
Camera FOV and distance, tilt angle, thread thickness, packet speed, easing constants, exact bezel
proportions, panel layout and transition (within the tokens above).

## Acceptance
- `pnpm build` and `tsc --noEmit` pass; rewritten e2e suite green; existing non-grid specs untouched.
- 1440 / 768 desktop: orbit with 6 device-framed previews, threads, no grid under it.
- 390 and reduced motion: list with the same 6 projects, same detail panel, no horizontal scroll.
- Clicking any preview or chip opens the panel with only working links; Esc closes; focus returns.
- Opened and scrolled on a real phone (list mode) and a laptop (orbit), no console errors.
