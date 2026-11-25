"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { annotate } from "rough-notation";

// Hand-drawn marker that draws itself once the phrase scrolls into view (same idea and API
// shape as Magic UI's Highlighter, without the shadcn setup this repo does not use).
// Reduced motion gets the mark already drawn; no JS leaves the plain text.
type Props = {
  children: ReactNode;
  action?: "highlight" | "underline";
  color?: string;
  strokeWidth?: number;
};

export default function Highlighter({ children, action = "highlight", color = "var(--accent-soft)", strokeWidth = 2 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mark = annotate(el, {
      type: action,
      color,
      strokeWidth,
      multiline: true,
      padding: action === "highlight" ? 2 : 3,
      iterations: 1,
      animate: !still,
      animationDuration: 900,
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        mark.show();
        io.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      mark.remove();
    };
  }, [action, color, strokeWidth]);

  return (
    <span ref={ref} className="relative inline">
      {children}
    </span>
  );
}
