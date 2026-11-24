# Product

register: brand

## Product purpose
Personal portfolio of a software engineering student (UCC, Pasto, Colombia), graded for the Interfaces course and used as a CV link on LinkedIn/GitHub. Shows four class projects (desktop, mobile, smartwatch, video game) plus other work.

## Users
- Recruiters and hiring managers (LatAm and remote), scanning on a laptop or phone in under a minute, deciding whether to open the code.
- The Interfaces professor, grading against a checklist: nav always visible, hero with real photo and CV, about, projects with GitHub + live links, 3+ testimonials, experience, contact form validated with regex, footer with computed year, one extra section, strong primary color (not black/white), subtle and slow motion, no templates, no custom cursor, no skill bars.

## Brand and tone
Confident, precise, warm. Backend + AI integration engineer who cares about interfaces. Copy in English, short, specific, no em dashes.
Palette "Cobalt on cream" (2026-11-22, replaces "Sky on cream"): cream paper, ink text, ONE saturated cobalt accent (paper text on it) for actions, wordmarks and full-bleed chapters. No purple.
Type: Bricolage Grotesque 800/700 (display, giant wordmarks), Hanken Grotesk (body).

## References
prathamfolio.com (giant wordmark behind a cut-out portrait, floating glossy objects, ink pill nav, filter chips + rounded tiles), eathungrytiger.com (big type), belgradearbor.rs (word reveals). Mechanisms only, nothing copied.

## Anti-references
Downloaded templates, purple gradients, glass on everything, skill bars with percentages, avatars instead of a real photo, all-black pages, generic three-card feature grids.

## Strategic principles
The hero is the signature moment (wordmark, cut-out portrait, floating objects). Projects are an orbit of real app screens (see Decisions). Loud through scale, colour and 3D; slow in tempo: motion is scroll-driven or pointer-driven and reversible, any time loop takes >= 6 s, reduced motion leaves everything readable.

## Decisions
- **2026-11-22: Projects are a 3D orbit, not a tile grid.** Six projects (Retoma, Acompaña, Hand Hygiene Watch, Lumenfall, CanTrack, CotizaIA; Linked Beats and Octree dropped) orbit a core node, tied to it by threads, turned by scroll (React Three Fiber). Each orbiter is the app's own screenshot in a device frame, never the 3D icons (those stay in the hero). Click a preview or chip: detail panel with screens, description, stack and only working links. Spec: `docs/superpowers/specs/2026-11-22-project-orbit-design.md`.
  Why: Nico found the CSS ring's flat rectangles ugly, did not want a grid under it ("redundant"), and felt the 3D icons were reused too much.
  Fallback: under 768px, with reduced motion or without WebGL there is a plain list with the same panel, so no visitor loses a project.
  Accepted risk (Nico, 2026-11-22): the professor's guide asks for a responsive project grid (1 column mobile, 2-3 desktop). Desktop no longer has one; the panel carries the per-project card content.
- **2026-11-22: CotizaIA is a team project.** Repo is in a teammate's GitHub account; shown with a "Team project" label (`collaboration: true`).
- **2026-11-22: Loud remix** (spec `docs/superpowers/specs/2026-11-22-loud-remix-design.md`). Nico found the site too calm and the 01-04 "What I build" cards AI-generated; refs madebyigor.com, vadimcarazan.com (mechanisms only). Still graded, so "subtle and slow" is read as slow tempo, not small scale.
  - Accent is cobalt `#2340ff`; text on it is paper (`--accent-ink`). Section wordmarks are cobalt; the hero name stays taupe because it overlaps the cobalt blob.
  - Cobalt chapters: `#build`, `#now`, footer. Contact stays cream so three cobalt blocks do not run together and the form stays calm.
  - "What I build" is a pinned cobalt chapter: one group at a time as giant type, its logos as 3D slabs (R3F). (The role-word marquee that closed it was removed the same day: Nico, "told u to delete this".) It replaces the 01-04 cards AND the StackIcons strip (same logos twice was redundant).
  - Hero: a glossy cobalt 3D blob behind the portrait (loads only after the portrait), the name splits apart on scroll, floating objects scatter outward.
  - Every WebGL scene uses one gate (`components/motion/useSceneMode.ts`): >= 768px, motion allowed, WebGL present; otherwise static DOM.
- **2026-11-22: Orbit core is a glass N, the detail panel animates.** Nico: "that ugly ball" and the panel "looks horrendous how it pops". The solid ball + ring became a frosted-glass block with the N monogram (refracted inside), lifted above the front device; straight spokes became soft arcs with a light pulse to the front project. The panel grows out of the chip/row that opened it and shrinks back (bottom sheet slides on phones); scroll lock releases the moment closing starts. JS easings mirror the CSS tokens in `components/motion/tokens.ts`.
- **2026-11-22 (later): Projects are a fly-through field of screens, not an orbit.** Nico disliked the glass N and wanted madebyigor.com's feel. Every screenshot is a thin curved screen on a grainy moving gradient; scroll flies the camera station to station (`components/projects/ScreenField.tsx`). Device frames, the core and its threads are gone. The section opens on cobalt and fades to near-white before the field. Spec: `docs/superpowers/specs/2026-11-22-screen-field-design.md`. The left-gutter backend thread was also removed (a misread of "rm the trail"; Nico meant the marquee).
- **2026-11-22: Build stage is full-bleed** and the slab cluster is sized from the visible frame (a slab was cut at the 1500px container edge).
- **Class names:** never name a component class `.ring`; Tailwind's `ring` utility paints a 1px box-shadow around the element (this was the "ugly box").
