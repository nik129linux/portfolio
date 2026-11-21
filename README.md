# Nicolas Casanova · Portfolio

Personal portfolio for the Interfaces course (UCC, Pasto) and CV link. Next.js 15, Tailwind 4, GSAP (Flip), Framer Motion, Lenis.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm exec playwright test   # e2e judge (builds on its own port)
```

## Where things live

- `data/` all content: `profile.ts`, `projects.ts`, `experience.ts`, `testimonials.ts`, `now.ts`. `[Placeholders]` are owner-filled facts and are never rendered as links.
- `components/sections/` page sections. `components/projects/` filter chips and tiles. `components/motion/` reveal, parallax, tilt, smooth scroll.
- `app/globals.css` design tokens ("Sky on cream": cream paper, ink, taupe wordmarks, light-blue accent).
- `tests/e2e/` the judge: structure, content wiring, reduced motion, 375px layout.

## Images

- `public/photo.webp` is the original portrait. `public/photo-cutout.webp` is the same photo with the background removed (rembg), used in the hero.
- `public/projects/*` real app screens (captured with `tools/screens`).
- `public/icons/*.svg` technology logos (devicon, MIT; Gemini from simple-icons, CC0). The marks belong to their owners.
- `public/3d/*.png` optional glossy objects (`laptop`, `phone`, `watch`, `gamepad`, `terminal`, `folder`), transparent PNG. Missing files fall back to soft blue shapes.
