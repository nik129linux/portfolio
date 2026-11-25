"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Scroll motion for the Experience timeline (markup lives in sections/Experience.tsx).
// Everything is tied to one line on the screen, DRAW_AT: the cobalt rail draws down with the
// scroll so its tip sits on that line, a glowing tip rides the end of it, and each entry builds
// itself (year, node, card, lines) only as the tip reaches its node. All of it is scrubbed, so
// scrolling back undraws it. Reduced motion: no motion, finished state.
const DRAW_AT = "60%";

export default function ExperienceMotion({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    root.dataset.motion = "";

    const ctx = gsap.context(() => {
      const rail = root.querySelector<HTMLElement>("[data-exp-rail]");
      const tip = root.querySelector<HTMLElement>("[data-exp-tip]");
      if (!rail) return;

      // The rail spans top-2 (8px) to bottom-0 of the list; its tip is at DRAW_AT the whole way down.
      // Measure the list, not the rail: the rail is scaled to 0 when ScrollTrigger measures it.
      const draw = { trigger: root, start: `top+=8 ${DRAW_AT}`, end: `bottom ${DRAW_AT}`, scrub: true };
      gsap.fromTo(rail, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: draw });
      if (tip) {
        gsap.fromTo(tip, { y: 0 }, { y: () => rail.offsetHeight, ease: "none", scrollTrigger: { ...draw, invalidateOnRefresh: true } });
      }

      gsap.utils.toArray<HTMLElement>("[data-exp-row]").forEach((row) => {
        const node = row.querySelector<HTMLElement>("[data-exp-node]") ?? row;
        // The entry builds over the last stretch before the tip reaches its node, and is
        // complete the moment the line touches it.
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: node, start: "top 85%", end: `top ${DRAW_AT}`, scrub: 0.4 },
        });
        tl.from(row.querySelector("[data-exp-year]"), { yPercent: 110, duration: 1 })
          .from(row.querySelector("[data-exp-card]"), { x: 80, opacity: 0, duration: 1 }, 0.15)
          .from(row.querySelectorAll("[data-exp-in]"), { y: 20, opacity: 0, stagger: 0.12, duration: 0.6 }, 0.4)
          .from(node, { scale: 0, duration: 0.4, ease: "back.out(2.5)" }, 0.75);

        // Lit (filled year, filled node, a pulse) from the moment the line reaches the node.
        ScrollTrigger.create({
          trigger: node,
          start: `top ${DRAW_AT}`,
          onEnter: () => row.classList.add("is-on"),
          onLeaveBack: () => row.classList.remove("is-on"),
        });
      });
    }, root);

    // Sections above (Build, Projects) swap to their tall scroll tracks after mount, which moves
    // this list thousands of pixels down. Recompute trigger positions whenever the page height changes.
    let raf = 0;
    let lastH = document.documentElement.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (h === lastH) return;
      lastH = h;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    ro.observe(document.body);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      ctx.revert();
      delete root.dataset.motion;
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
