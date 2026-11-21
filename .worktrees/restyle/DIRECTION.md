# DIRECTION: Bolder Restyle v2 (Mode: structural)

Mode: structural. Content and brand stay. Every section changes layout, not
just spacing. Palette C cobalt/coral, Bricolage Grotesque + Geist stay.
No new dependencies. No copied code, images, or video from reference sites.
Structural moves borrowed as mechanisms (never copied): full-width oversized
headline type (haoqi), editorial project index with numbers + media
(mathildedechiara), sticky section titles beside scrolling content (flshfrm),
broken asymmetric grids with overlap/offsets (sweet-tape), full-bleed color
chapters (Cartier sapphire), footer as a statement. Projects stays the
loudest chapter: biggest type, deepest color, most motion, most space.

Global rhythm:
- Containers: editorial sections max-w-7xl; Projects max-w-7xl full-bleed deep.
- Section spacing: quiet chapters py-28 sm:py-36 lg:py-40; Projects
  py-32 sm:py-40 lg:py-48; vertical offsets (mt-12/16/24) break the grids.
- Type scale: hero h1 text-7xl sm:text-8xl lg:text-9xl full-width;
  section h2 text-5xl sm:text-6xl lg:text-7xl; Projects h2
  text-7xl sm:text-8xl lg:text-9xl; footer wordmark
  text-7xl sm:text-8xl lg:text-9xl; display lines text-5xl sm:text-7xl.
- Eyebrow pattern (unchanged tokens): index number from nav order
  (String(index+1).padStart(2,"0"), derived from data/nav, no invented copy)
  plus short cobalt rule (aria-hidden h-px w-10 bg-cobalt) plus label.
- Motion: unchanged. Projects keeps the strongest motion (velocity skew,
  scroll screens, pinned showcases). Everything else quiet: ScrubHeading
  word rise, hero exit blur + rise (reversible), nav pill slide. All gated on
  prefers-reduced-motion. No new motion libraries.

app/globals.css:
- Keep every token value (paper, paper-2, ink, ink-2, line, cobalt, coral,
  deep, deep-2, mist, shadow-card, shadow-card-hover, shadow-raised,
  shadow-primary, btn, field, glass-nav, hero-photo mask). No token changes.
- Add only: html/body overflow-x clip (kills accidental 320px scroll, keeps
  sticky working, unlike hidden), img max-width 100%, ::selection cobalt
  wash (kept), .eyebrow helper (kept). No new colors or fonts.

app/page.tsx:
- Keep order: Hero, About, Marquee, Projects, Testimonials, Experience,
  Now, FlyApartText band, Contact. FlyApartText band becomes a full-bleed
  cobalt chapter (bg-cobalt text-paper, max-w-none, text-6xl sm:text-8xl)
  so the page alternates paper / deep / paper / cobalt / paper voids.

Header:
- Layout: sticky top-0 z-50, FULL-BLEED bar (no floating pill box):
  inner max-w-none rounded-none border-b border-line glass-nav,
  px-4 sm:px-8 py-3. Brand text-xl left, nav center-right, menu button mobile.
- Type: brand font-display text-xl bold; links text-sm.
- Motion: same nav-pill layoutId sliding on hover/active, transform only,
  instant under reduced motion. Keep nav aria-label Sections, button name
  Menu, every a href #id, aria-current on active.

Hero (section#home):
- Layout: FULL-WIDTH stacked, not split. Eyebrow top, h1 max-w-none full
  width, then 12-col row: sub + CTAs lg:col-span-6, photo
  lg:col-span-5 lg:col-start-8 pulled up with lg:-mt-32 lg:z-10 so the
  portrait OVERLAPS the headline (sweet-tape collage move, vertical only,
  no horizontal overflow). Photo keeps hero-photo mask + coral offset via
  Parallax, max-w-sm mobile.
- Type: h1 (single page h1) text-7xl sm:text-8xl lg:text-9xl leading 0.9;
  sub text-xl relaxed; location text-base.
- Motion: unchanged (TextScramble role only; hero-exit y -60 + blur 0-8px
  smoothstepped, reversible, zero under reduced motion; Parallax 0.6/0.15).
  Keep data-testid hero-exit, Download CV control, real img, data-cta,
  min heights 48px.

About (section#about):
- Layout: FLIPPED sticky. Body lg:col-span-7 lg:col-start-1 (left, first
  visually), label lg:col-span-4 lg:col-start-9 sticky top-28 (right).
  Eyebrow row adds nav-derived index number + label. Stack grid 2-col kept.
- Type: h2 text-5xl sm:text-6xl lg:text-7xl; h3 micro uppercase; body
  text-xl relaxed; chips text-sm.
- Motion: ScrubHeading only. Quiet.

Projects (section#projects, loudest chapter):
- Layout: full-bleed bg-deep text-paper kept, widened to max-w-7xl.
  Oversized h2 text-7xl sm:text-8xl lg:text-9xl max-w-none full width.
  EDITORIAL INDEX: ol of all projects (number = index+1 padded, title,
  kind, thumb from project.media, stack count) as hairline rows linking to
  #project-{slug}. Then PortalReveal, 4 pinned ProjectShowcases, then cards
  in BROKEN 12-col grid: even cards md:col-span-7, odd cards
  md:col-span-5 md:mt-16 (staggered, overlapping rhythm). Card internals
  byte-identical (article data-testid project-card data-slug, lift,
  rounded-2xl bg-paper p-2 shadow-card hover shadow-card-hover, VelocitySkew
  wrapper data-velocity-skew, card-media aspect-8/5 rounded-lg ring-1 with
  concentric radius, ScrollScreens reversible stepping, h3 text-2xl, stack
  chips, GitHub icon + Live demo primary + Download secondary).
- Motion: strongest stays here. No layout narrowing.

Testimonials (section#testimonials):
- Layout: sticky title + STAGGERED cards. Grid lg:grid-cols-12: header
  lg:col-span-4 sticky top-28 self-start (ScrubHeading + index eyebrow),
  list lg:col-span-8 grid sm:grid-cols-2 gap-6; first figure sm:col-span-2
  with text-2xl lead quote, remaining cards offset with sm:mt-12 on every
  second card (broken rhythm). Widened to max-w-7xl.
- Type: h2 text-5xl sm:text-6xl lg:text-7xl (grows, 320px stays clean via
  grid stacking); quotes text-lg, lead text-2xl.
- Motion: ScrubHeading only. Keep figure data-testid testimonial,
  bg-paper-2 shadow-card, initials coral fallback.

Experience (section#experience):
- Layout: sticky title + OFFSET timeline. Grid lg:grid-cols-12: header
  lg:col-span-4 sticky top-28, ol lg:col-span-7 lg:col-start-6 border-l
  kept; alternating cards indented (odd items sm:ml-12) so the rail zigzags.
  Widened to max-w-7xl outer with inner grid.
- Type: h2 text-5xl sm:text-6xl lg:text-7xl; item h3 text-xl.
- Motion: ScrubHeading only. Keep li data-testid experience-item, cards
  bg-paper-2 shadow-card.

Now (section#now, full-bleed color chapter):
- Layout: bg-cobalt text-paper full-bleed (second color chapter after
  Projects deep). Grid lg:grid-cols-12: intro lg:col-span-4 sticky top-28,
  dl lg:col-span-7 lg:col-start-6 grid gap-5 sm:grid-cols-2 with odd cards
  sm:mt-10 stagger. Cards bg-paper text-ink (contrast on cobalt), rounded-2xl.
- Type: h2 text-5xl sm:text-6xl lg:text-7xl text-paper; intro text-xl
  text-paper; item dd text-xl text-ink on paper cards.
- Motion: ScrubHeading only. Keep dl/dt/dd semantics.

Contact (section#contact):
- Layout: broken asymmetric. Display line FULL-WIDTH oversized
  (text-5xl sm:text-7xl max-w-none) above a 12-col grid: info
  lg:col-span-5 (ScrubHeading + display + sub + SocialLinks, sticky
  top-28) and form lg:col-span-6 lg:col-start-7 lg:mt-24 pushed DOWN so it
  overlaps the section rhythm diagonally. Widened to max-w-7xl.
- Type: h2 scale match (text-5xl sm:text-6xl lg:text-7xl); display line
  font-display.
- Motion: ScrubHeading only. Keep field-panel, labels, inputs min-h-12
  text-base 16px+, EMAIL_PATTERN RegExp, role alert errors, role status
  confirm, Send message btn-primary.

Footer (a statement):
- Layout: max-w-none full-width, border-t. Giant wordmark (profile.name
  from data) font-display text-7xl sm:text-8xl lg:text-9xl leading 0.9
  tracking-tight max-w-none, then meta row (copyright with computed
  getFullYear + profile.location from data) flex wrap + SocialLinks.
- Type: wordmark display oversized; meta text-base text-ink-2.
- Motion: none. Keep footer element, computed year, no hardcoded year.
