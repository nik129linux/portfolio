# Loud Remix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the graded portfolio loud (cobalt, giant type, real 3D) while motion stays slow and scroll-driven.

**Architecture:** Tokens change in `app/globals.css`. Two new R3F scenes (hero blob, Build logo slabs) mount client-side only when desktop + WebGL + no reduced motion, following the existing `ProjectOrbit` gating. The 01-04 cards and the StackIcons strip are replaced by one pinned cobalt chapter.

**Tech Stack:** Next 15, React 19, Tailwind 4, @react-three/fiber 9 + drei 10, three 0.187, GSAP 3.13 ScrollTrigger, Lenis, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-loud-remix-design.md`

## Global Constraints

- Every raw color lives in `app/globals.css` tokens; components use tokens only.
- Easings: only `--ease-out`, `--ease-in-out`, and GSAP `scrub`. No new easing.
- No custom cursor, no route transitions, no preloader, no purple, no all-black page.
- Any time-based loop is >= 6 s per cycle; everything else moves only with scroll or pointer.
- Under 768 px, `prefers-reduced-motion`, or no WebGL: no canvas, all text in the DOM, static images.
- Copy in English, no em dashes. Text on cobalt is `--paper`.
- Old-design tests are rewritten to the new design in the same task, never deleted to go green.
- Test command: `pnpm exec playwright test` (builds into `.next-e2e`, port 3107).

## Review Focus

1. Resize across 768 px on the Build chapter: canvas mounts/unmounts, at most one canvas per scene (test in Task 2).
2. WebGL unavailable: hero and Build still render their DOM content, no console errors (Tasks 2, 3).
3. Reduced motion: wordmark letters, Build groups and marquee are static and fully readable at first paint (Tasks 2, 4).
4. 375 px: no horizontal scroll from the giant wordmark, marquee or blob (existing `noHorizontalScroll` checks extended in Tasks 3, 4).
5. Pinned Build chapter plus Lenis: anchor links from the nav (`#build`, `#projects`) still land on their section (Task 2).

---

### Task 1: Cobalt tokens

**Files:** Modify `app/globals.css:7-26`, `components/sections/Hero.tsx:33` (radial uses a token var), `tests/e2e/restyle.spec.ts:154-165, 241-248`.

- [ ] Rewrite the palette test as `"palette: accent is a saturated cobalt, paper is cream, nothing is purple"`: `b > r + 120`, `b > g + 60`, and contrast(`--paper` on `--accent`) >= 4.5.
- [ ] Rewrite "no dark chapters" as `"only #build and #contact are cobalt chapters; every other section is light; none is black"`.
- [ ] Run both: FAIL.
- [ ] Set `--accent` to a cobalt near `#2340ff`, add `--accent-deep` cobalt shade and `--on-accent: var(--paper)`; keep `--accent-soft` as a pale cobalt tint; replace the hero radial raw rgb with `color-mix` on `--accent`.
- [ ] Run full suite; fix only colour fallout. Commit `feat: cobalt palette`.

### Task 2: Build chapter replaces the cards and the StackIcons strip

**Files:** Create `components/build/BuildScene.tsx` (R3F), `components/build/BuildChapter.tsx` (client, gating + pin), `components/build/logos.ts` (the `ICON` map moved from StackIcons). Modify `components/sections/Build.tsx`, `app/page.tsx` (drop `<StackIcons />`). Delete `components/ui/StackIcons.tsx` and its `.pipe-*` CSS. Test: create `tests/e2e/build.spec.ts`; remove restyle 146/231/250 and story-personality 82/106/123 (replaced here).

**Interfaces:** `logos.ts` exports `ICON: Record<string,string>`; `BuildChapter` props `{ groups: {group:string; items:string[]}[] }`; `BuildScene` props `{ groups; progress: MutableRefObject<number> }` (0..1 across the pin).

- [ ] Tests: `build: four group headings (h3) from data, every stack item in the DOM, no "01".."04" numerals, no percentages`; `build: section background is the accent token and text is paper`; `build: desktop pins the stage for the whole track and shows one canvas`; `build: the visible group changes with scroll, both ways` (aria-current or data-active on the h3); `build: reduced motion and 375px show four stacked groups, no canvas`; `build: without WebGL, no canvas and no console errors`; `build: resizing 1440->600->1440 keeps at most one canvas`; `build: nav link #build lands with the section top in view`.
- [ ] Run: FAIL.
- [ ] Implement. Pin with CSS sticky inside a `~400vh` track (same mechanism as the orbit stage), progress from `useOrbitProgress`-style scroll math. Slabs: rounded boxes with logo textures, fly in/cluster/clear per group, driven only by progress. Draw calls <= 100.
- [ ] Run full suite, commit `feat: pinned cobalt build chapter`.

### Task 3: Hero blob

**Files:** Create `components/hero/HeroBlob.tsx` (R3F, `MeshDistortMaterial` or equivalent in cobalt tokens read from CSS vars), `components/hero/HeroBlobGate.tsx` (dynamic import, mounts after the portrait `onLoad`). Modify `components/sections/Hero.tsx`. Test: `tests/e2e/hero.spec.ts`.

- [ ] Tests: `hero: desktop shows one canvas behind the portrait (z below portrait layer)`; `hero: reduced motion, 375px and no-WebGL show no canvas and keep the radial fallback`; `hero: portrait image is complete before the canvas exists`; `hero: 375px no horizontal scroll`.
- [ ] Run: FAIL. Implement: slow morph (cycle >= 6 s), leans to pointer, rotation/scale from scroll. DPR capped 1.5, `frameloop="demand"` offscreen. Run full suite, commit `feat: hero 3d blob`.

### Task 4: Wordmark split, object scatter, marquee

**Files:** Create `components/motion/SplitScrollWord.tsx`, `components/ui/Marquee.tsx`. Modify `Hero.tsx` (wordmark), `FloatingObjects.tsx` (scatter on scroll), `Build.tsx` (marquee at end), section wordmark CSS (bigger, cobalt). Test: extend `tests/e2e/hero.spec.ts`, add `tests/e2e/marquee.spec.ts`; update restyle 297 only if the pointer mechanism changes.

- [ ] Tests: `hero: wordmark letters are separate spans and spread when scrolled 50vh`; `hero: reduced motion keeps letters untransformed`; `marquee: aria-hidden, cycle >= 6s, paused under reduced motion, no horizontal scroll at 375px`; `wordmarks: section h2 colour is the accent token`; existing `hero-wordmark` text test still reads "nicolas".
- [ ] Run: FAIL. Implement with GSAP ScrollTrigger scrub. Run full suite, commit `feat: kinetic wordmarks and marquee`.

### Task 5: Contact chapter, decisions, proof

**Files:** Modify `components/sections/Contact.tsx` (cobalt chapter, form fields stay paper with ink text), `PRODUCT.md` Decisions (cobalt, text on accent is paper, Build chapter replaces cards+strip, loud-but-slow rule).

- [ ] Test: contact form test still passes; `contact: chapter is accent, inputs keep >= 4.5 contrast`.
- [ ] Full suite green; screenshots at 1440 and 375 opened and checked; commit `feat: loud contact chapter + record decisions`.
