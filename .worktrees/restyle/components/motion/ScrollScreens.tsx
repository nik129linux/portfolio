"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";

export type Screen = { src: string; caption: string };

// Clean app screens that follow the scroll: the card's position in the
// viewport picks the screen, so scrolling back walks back through them.
export default function ScrollScreens({ screens, title }: { screens: Screen[]; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.15"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setActive(Math.min(screens.length - 1, Math.max(0, Math.floor(p * screens.length))));
  });

  return (
    <div ref={ref} className="relative h-full w-full">
      {screens.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.src}
          src={s.src}
          alt={i === active ? `${title}: ${s.caption}` : ""}
          aria-hidden={i !== active}
          data-screen={i}
          data-active={i === active ? "true" : "false"}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ease-out ${i === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-3 rounded-md bg-paper/90 px-3 py-2 text-sm text-ink shadow-card">
        <span data-testid="screen-caption">{screens[active].caption}</span>
        <span className="tabular-nums text-ink-2">
          {String(active + 1).padStart(2, "0")} / {String(screens.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
