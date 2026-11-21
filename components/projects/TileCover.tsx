"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Project } from "@/data/types";

const STEP_MS = 1100;

// Tile cover: the project's own first screen. While the tile is hovered or has
// keyboard focus inside it, the cover steps through the remaining screens (reversible:
// it returns to the first screen on leave). Projects without screens get a typographic cover.
export default function TileCover({ project, active, }: { project: Project; active: boolean }) {
  const screens = project.screens ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || screens.length < 2) {
      setIndex(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % screens.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [active, screens.length]);

  if (screens.length === 0) {
    // Text-only cover: initials (CamelCase or words), so the title is not repeated below.
    const caps = project.title.match(/[A-Z]/g);
    const initials = caps && caps.length > 1 ? caps.slice(0, 2).join("") : project.title.charAt(0).toUpperCase();
    return (
      <div aria-hidden className="@container relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-accent-soft">
        <span className="wordmark block text-[clamp(4rem,42cqw,9rem)] !text-accent-strong">{initials}</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-accent-soft">
      {screens.map((s, i) => (
        <Image
          key={s.src}
          src={s.src}
          alt={i === 0 ? `${project.title}: ${s.caption}` : ""}
          aria-hidden={i === 0 ? undefined : true}
          fill
          unoptimized
          loading={i === 0 ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-opacity duration-500 ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      <p className="pointer-events-none absolute bottom-3 left-3 max-w-[85%] truncate rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-paper-2">
        {screens[index]?.caption}
      </p>
    </div>
  );
}
