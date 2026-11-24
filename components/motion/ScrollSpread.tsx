"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";

// The hero name comes apart as the visitor scrolls away: every letter (.ch) drifts out from the
// centre, rises and tilts. One number, --spread (0..1 over the first 60% of a screen), drives it
// through the CSS `translate` and `rotate` properties, so it never fights the reveal's `transform`.
// Fully reversible; reduced motion never sets --spread and the CSS pins it to 0 anyway.
export default function ScrollSpread(props: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = [...el.querySelectorAll<HTMLElement>(".ch")];
    const mid = (chars.length - 1) / 2 || 1;
    chars.forEach((c, i) => {
      const o = (i - mid) / mid;
      c.style.setProperty("--o", o.toFixed(3));
      c.style.setProperty("--a", Math.abs(o).toFixed(3));
    });
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.6)));
      el.style.setProperty("--spread", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} {...props} className={`spread ${props.className ?? ""}`} />;
}
