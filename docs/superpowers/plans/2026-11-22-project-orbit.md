# Project Orbit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Execution method (supplied by Nico):** the lead writes the taste layer (Tasks 1, 4, 5, 7); the bulk (Tasks 2, 3, 6) goes to opencode Go lanes with a short BRIEF each, max 3 at once, disjoint files, no `playwright`/`pnpm build` run by delegates. The lead verifies every delegate result on disk.

**Goal:** Replace the CSS ring and the tile grid in `#projects` with an R3F orbit of 6 device-framed app previews around a core, threads, scroll-scrubbed, click opens a detail panel.

**Architecture:** `ProjectOrbit` (client) picks `orbit` or `list` mode once. Orbit = lazy `<Canvas>`; a ScrollTrigger writes progress to a ref that `useFrame` reads. Detail, chips and list are plain DOM components sharing one `selected` state held by `ProjectOrbit`.

**Tech Stack:** Next 15.5.4, React 19.1.0, TypeScript, Tailwind v4, gsap 3.13.0 + ScrollTrigger, lenis 1.3.11, `three` 0.187.0, `@react-three/fiber` 9.8.2, `@react-three/drei` 10.7.9, `@types/three` 0.187.0 (exact pins, like the rest of `package.json`). Tests: Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-project-orbit-design.md`

## Global Constraints
- Palette "Sky on cream", one light-blue accent, Bricolage + Hanken, copy in English, no em dashes.
- No raw hex / rgba / ms / cubic-bezier in components; tokens from `app/globals.css`. three reads them once via `getComputedStyle(document.documentElement)`.
- Motion slow, scroll-driven, reversible; reduced motion = `list` mode. No custom cursor, no purple.
- No 3D icons (`/public/3d/*`) in the orbit. No invented screenshots, text or links; `[placeholder]` values never render (`ProjectLinks` already hides them).
- Budget: <= 100 draw calls, <= 200K triangles phone, textures <= 2048 px, pixel ratio <= 2, render stops off screen.
- Orbit only when width >= 768, no reduced motion, WebGL available. Otherwise `list`.
- Never delete or weaken an existing assertion; a rewritten spec must assert the same thing on the new contract.
- No commit, no deploy in this plan (spec non-goal). Leave changes uncommitted.
- Test command: `E2E_CHROME=<cached chromium_headless_shell> pnpm exec playwright test` (the 1208 browser is not installed; 1254 is cached in `~/.cache/ms-playwright`).

## Review Focus
1. WebGL unavailable or context lost: the section falls back to the list, never a blank canvas. (Task 4 test)
2. Viewport crossing 768 while the page is open: mode flips both ways, at most one canvas, no leaked ScrollTrigger. (Task 4 test)
3. A project whose links are all placeholders (Lumenfall): panel shows no link row and no `[` text. (Task 3 test)
4. Panel open: Esc closes, focus returns to the trigger, Tab stays inside, page behind does not scroll. (Task 3 test)
5. Slow textures: stage keeps full height and chips are usable before the first frame (`data-ready` flips later). (Task 4 test)

## DOM contract (shared by Tasks 3, 4, 6)
- Root `[data-testid="project-orbit"]` with `data-mode="orbit"|"list"`, `data-ready` (orbit, after first frame), `data-front="<slug>"`.
- `[data-testid="project-chips"] button[data-slug]` (orbit mode only), `[data-testid="project-list"] [data-slug]` rows (list mode only).
- Panel `[data-testid="project-detail"]`, `role="dialog"`, `aria-modal="true"`, labelled by its `h3`.
- Front caption `[data-testid="orbit-caption"]` shows title + kind of `data-front`.

## File structure
- Create `components/projects/`: `ProjectOrbit.tsx`, `OrbitScene.tsx`, `DeviceCard.tsx`, `Thread.tsx`, `useOrbitProgress.ts`, `orbitTokens.ts`, `ProjectDetail.tsx`, `ProjectChips.tsx`, `ProjectList.tsx`.
- Modify `data/projects.ts`, `components/sections/Projects.tsx`, `package.json`; add `public/projects/{cantrack,cotizaia}/*`.
- Delete (Task 5): `ProjectRing.tsx`, `ProjectFilter.tsx`, `ProjectTile.tsx`, `TileCover.tsx`, `app/ring.css`.
- Tests: `tests/e2e/orbit.spec.ts` (new), `projects-data.spec.ts` (new), `restyle.spec.ts` + `ring.spec.ts` (rewritten, Task 6).

---

### Task 1: Dependencies and WebGL spike (lead)
**Files:** Modify `package.json`; Create `tests/e2e/webgl-spike.spec.ts` (deleted at end of task).
**Produces:** installed deps; a recorded answer to "does cached headless Chromium render WebGL?" and, if it needs a flag, the exact `launchOptions.args` to put in `playwright.config.ts`.
- [ ] Run `pnpm add -E three@0.187.0 @react-three/fiber@9.8.2 @react-three/drei@10.7.9 && pnpm add -DE @types/three@0.187.0`.
- [ ] Write `webgl-spike.spec.ts`: page `about:blank`, `expect(await page.evaluate(() => !!document.createElement("canvas").getContext("webgl2"))).toBe(true)`.
- [ ] Run it with `E2E_CHROME`. If it fails, retry with args `["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]` set in `playwright.config.ts` `launchOptions`; keep the args that make it pass.
- [ ] Expected: PASS with a documented arg set (or, if nothing works, note "WebGL not testable headless" in the spec's Risks and keep DOM-only tests). Delete the spike file.

### Task 2: Data and assets (Go lane `lean-mimo`)
**Files:** Modify `data/projects.ts`; Create `public/projects/cantrack/{01,02,03}.webp`, `public/projects/cotizaia/{01,02,03}.webp`, both `screens.json`; Test `tests/e2e/projects-data.spec.ts`.
**Produces:** `projects` = exactly `retoma, acompana, hand-hygiene-watch, lumenfall, cantrack, cotizaia` in that order; `cantrack` `device:"phone"`, `cotizaia` `device:"laptop"`, `collaboration:true`, `github:"https://github.com/GUERRREROALEXANDER/frontend-cotizaIA"`, `demo:"https://frontend-cotizaia-swart.vercel.app/"`, stack `["React","Vite","Tailwind CSS","Framer Motion","Java"]`; `screens` imported from each `screens.json` like the existing four.
- [ ] Test (written by the lead first): slugs equal the six above in order; each project's `screens[0].src` exists under `public/`; no `linked-beats` or `octree`; `cotizaia.collaboration === true`; no `summary` contains an em dash.
- [ ] Run it: FAIL (slugs differ).
- [ ] Crop/convert with ImageMagick (`magick in.png -crop 1440x900+0+0 +repage -resize 1280x -quality 82 out.webp` for CotizaIA; phone shots `-resize 780x -quality 82`). Sources and captions are in the spec's Design/Data section.
- [ ] Edit `data/projects.ts`; the CotizaIA `summary` is written only from its README (agent turns a client brief into a priced proposal through a seven-stage pipeline, evidence kept per stage), one or two sentences, English, no em dash.
- [ ] Run the spec: PASS.

### Task 3: Detail panel, chips, list (Go lane `lean-ds`)
**Files:** Create `ProjectDetail.tsx`, `ProjectChips.tsx`, `ProjectList.tsx`; Test `tests/e2e/detail.spec.ts` (runs at 390px, list mode).
**Interfaces:** Produces `ProjectDetail({ project, onClose }: { project: Project | null; onClose: () => void })`; `ProjectChips({ projects, activeSlug, onSelect }: { projects: Project[]; activeSlug: string; onSelect: (slug: string) => void })`; `ProjectList({ projects, onOpen }: { projects: Project[]; onOpen: (slug: string) => void })`. Consumes `Project` from `data/types.ts` and `ProjectLinks` from `components/ui/ProjectLinks.tsx`.
- [ ] Tests (lead writes, from the DOM contract): at 390px open `cantrack` from the list, panel has `role="dialog"`, h3 "CanTrack", GitHub link present; open `lumenfall`: zero `a` in the panel and `innerText` has no `[`; Esc closes and `document.activeElement` is the trigger; Tab 10 times keeps focus inside the panel; `document.body` scroll position unchanged while open; first screen `img` has non-empty `alt`.
- [ ] Run: FAIL (components missing).
- [ ] Implement the three components with existing classes/tokens only. Panel: screen carousel (first shown, thumbnails), `summary`, `stack` chips, `ProjectLinks`; `collaboration` shows a small "Team project" label.
- [ ] Run `pnpm exec tsc --noEmit` and the spec's own tests (lead runs Playwright): PASS.

### Task 4: Orbit scene and wiring (lead)
**Files:** Create `ProjectOrbit.tsx`, `OrbitScene.tsx`, `DeviceCard.tsx`, `Thread.tsx`, `useOrbitProgress.ts`, `orbitTokens.ts`; Test `tests/e2e/orbit.spec.ts`.
**Interfaces:** Produces `ProjectOrbit({ projects }: { projects: Project[] })`; `useOrbitProgress(track: RefObject<HTMLElement>): MutableRefObject<number>` (0..1, scrubbed 0.6, `gsap.matchMedia` same query as the mode); `readOrbitTokens(): { accent: string; accentStrong: string; ink: string; paper: string }`; `DeviceCard({ project, angle, front }: ...)` shapes by `project.device` (laptop/monitor 16:10, phone 9:19.5, watch ~1:1.1) with the first screen as texture on a rounded bezel; `Thread({ from, to, packetActive }: ...)` line plus a packet sphere. Front index = `Math.round(progress * (n - 1))`.
- [ ] Tests: at 1440 and at 768 `data-mode="orbit"` with no horizontal scroll, `data-ready` appears within 8 s, 6 chips; scroll the track to 0 / 0.5 / 1 and poll `data-front` to `retoma` / index 3 slug / `cotizaia`; clicking a chip sets `data-front` and opens the panel; (focus 1) init script making `getContext` return null for webgl: `data-mode="list"`; (focus 2) resize 1440 -> 600 -> 1440: mode `orbit` -> `list` -> `orbit`, `canvas` count <= 1; (focus 5) chips visible and stage height == viewport before `data-ready`.
- [ ] Run: FAIL.
- [ ] Implement. Mode chosen in an effect (SSR renders the list so crawlers and no-JS see projects). Canvas via `next/dynamic({ ssr:false })`, `dpr={[1,2]}`, `frameloop` paused when off screen (IntersectionObserver). Tilted ring, front card eased toward camera with `1 - Math.exp(-6 * dt)`.
- [ ] Run tests: PASS. Then screenshot 1440x900 at progress 0, 0.5, 1 and look at them (composition, no flat boxes).

### Task 5: Replace the section (lead)
**Files:** Modify `components/sections/Projects.tsx`; delete the five files listed above; run `grep -rn "ProjectTile\|ProjectFilter\|ProjectRing\|ring.css" --include=*.ts --include=*.tsx --include=*.css .` (excluding node_modules, .next*) and expect no hits except specs.
- [ ] `Projects.tsx` keeps the wordmark `h2` ("Projects") and sub-copy, then renders `<ProjectOrbit projects={projects} />`; update the sub-copy to match the click behaviour.
- [ ] `pnpm exec tsc --noEmit` passes; `BackendThread` still finds `section#projects` and its h2.

### Task 6: Rewrite the old grid/ring specs (Go lane `lean-glm`)
**Files:** Modify `tests/e2e/restyle.spec.ts` (projects tests at lines 57-110, 163-190, 234-245); replace `tests/e2e/ring.spec.ts` with nothing (its assertions move into `orbit.spec.ts`, Task 4).
**Interfaces:** Consumes the DOM contract above.
- [ ] Brief lists each old test's claim and its new form: "each project appears once" -> exactly 6 chips (orbit) and 6 rows (list); "real links reachable by keyboard, no placeholders" -> open panel via keyboard, links present only when real; "tiles cover with first screen" -> panel's first image `src` equals `screens[0].src`; "no dark navy blocks / light" -> panel background is light; "bento first tile wide, 3D object per tile" -> dropped by the spec change, replaced by "no `/3d/` image inside the orbit root".
- [ ] Lead reviews the diff: assertion count per replaced test must not go down; then the full suite passes.

### Task 7: Verify, record, clean up (lead)
- [ ] `pnpm build`, `pnpm exec tsc --noEmit`, full Playwright suite: all pass.
- [ ] In the real browser: 1440 orbit (look at 3 progress points), 390 list, reduced motion, console empty; log `renderer.info.render.calls` <= 100.
- [ ] Append a dated decision to `PRODUCT.md` (orbit replaces ring and grid, why, the teacher's-grid risk accepted by Nico).
- [ ] Remove `BRIEF-*.md`, spike files; `git checkout -- next-env.d.ts`; leave everything uncommitted and undeployed; report what was skipped.
