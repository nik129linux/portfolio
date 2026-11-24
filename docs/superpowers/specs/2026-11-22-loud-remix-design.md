# Loud remix: design

Date: 2026-11-22. Status: draft, waiting for Nico's approval.

## Intent

Nico finds the portfolio too calm and the "What I build" 01-04 cards too AI-generated. He wants
it loud, with animation and 3D, after madebyigor.com and vadimcarazan.com (andreas.vision turned
out to be a plain text page). The site **is still graded** for Interfaces, so the professor's
checklist in `PRODUCT.md` still holds, including "subtle and slow motion" and "no custom cursor".

How the two fit together: **loud through scale, color and 3D; slow in tempo.** Motion is big but
scrubbed by scroll or eased slowly, never fast loops, flashes or jitter.

## Goals

- The first screen reads as loud within a second: a saturated color, huge type, and real 3D.
- The 01-04 cards are gone, replaced by one pinned, scroll-driven scene.
- Every checklist item still passes (nav always visible, hero with real photo and CV, about,
  projects with links, 3+ testimonials, experience, regex-validated form, computed year, extra
  section, strong primary color).

## Non-goals

- No custom cursor, no route-level page transitions, no preloader screen.
- The project orbit (decided earlier today) keeps its structure; it only picks up the new color.
- No new sections, no copy rewrite beyond what the new layouts need.

## Anti-goals (a failure even if it works)

- All-black pages, purple, glass on everything, generic card grids.
- Motion a reviewer would call fast or busy: anything that loops quicker than ~6 s or moves
  without the visitor scrolling or pointing.
- A phone, reduced-motion or no-WebGL visitor who loses content.

## Approaches considered

1. **Loud remix of the existing structure (picked).** Keep the graded sections; add 3D to the
   hero, replace the Build cards with a pinned 3D scene, raise type scale, add bands of color and
   marquees. Lowest risk for the grade, biggest visible change per hour.
2. One continuous WebGL fly-through (Vadim). Biggest wow, but the form, testimonials and nav get
   awkward, it is heavy on phones and needs a full second version anyway.
3. Numbered fullscreen work slider with page transitions (Igor). Strong for projects, but it
   would replace the orbit approved today and leave the rest calm.

Nico picked 1.

## Decided by Nico

- Approach 1.
- **Color A, "Cobalt on cream":** cream paper stays; the light blue is replaced by a saturated
  cobalt as the one primary, used for full-bleed chapters at the loud moments. No second accent.

## The design (my calls, correctable)

**Tokens.** All in `app/globals.css`. `--accent` becomes cobalt (around `#2340ff`, tuned for
contrast). Text on cobalt is cream, not ink (this reverses "ink text on accent"; recorded in
`PRODUCT.md` Decisions). Cobalt chapters use `--paper` text and a deeper cobalt for depth. No new
easings: `--ease-out` and `--ease-in-out` stay, plus GSAP scrub for scroll work.

**Hero.** Same layout and tests (wordmark, cut-out portrait in front, CV, h1). Changes:
- The soft radial glow becomes a real R3F object: a large glossy cobalt blob behind the portrait
  that slowly morphs, leans toward the pointer and swells/rotates with scroll.
- The wordmark grows and splits per letter on scroll (letters spread and rise as you leave).
- The floating 3D icons get a pointer push (eased springs) and scatter outward on scroll.

**"What I build" (replaces the 01-04 cards and the StackIcons strip).** One full-bleed cobalt
chapter, pinned for about four screens. The four groups (Backend, Frontend, AI, Cloud & data)
appear one at a time as giant cream type; around each, that group's tech logos float as 3D tiles
(R3F, logo textures on rounded slabs) that fly in, cluster, then clear for the next group. A slow
marquee band of role words ("Backend · AI · Interfaces") closes the chapter. The StackIcons strip
goes, because its logos move into this scene and showing them twice is redundant.

**Elsewhere.**
- Section wordmarks go bigger and cobalt; existing word reveals stay.
- One more cobalt chapter: Contact, so the page ends loud.
- The orbit and project panel adopt the cobalt token; no structural change.

**Fallbacks** (same rule as the orbit): under 768 px, with `prefers-reduced-motion`, or without
WebGL, the 3D parts drop to static images and the Build chapter becomes four stacked groups with
logo lists (not cards with numbers). All text stays in the DOM in every mode.

**Performance.** One canvas per scene, created only near the viewport, paused offscreen, DPR
capped at 1.5. The hero must stay fast to first paint: the canvas loads after the portrait.

**Tests.** Playwright stays the judge. New specs for the hero blob, the Build scene and the
fallbacks. Specs that assert the old design on purpose (StackIcons pipeline, Build cards, light-blue
values) get updated to the new design in the same change, never deleted to go green.

## Left to the builder

Exact cobalt value after contrast checks, blob shader/material, the scroll lengths, logo slab
shape, marquee speed within the "slow" rule, and how the hero canvas defers its load.
