"use client";

import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!<>-_\\/[]{}=+*^?#";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

export default function TextScramble({ text, as, className }: { text: string; as?: Tag; className?: string }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const duration = 1100;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const revealed = Math.floor((elapsed / duration) * text.length);
      if (elapsed >= duration) {
        setDisplay(text);
        return;
      }
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (i < revealed || text[i] === " ") out += text[i];
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  const Tag = (as ?? "p") as Tag;
  return (
    <Tag data-testid="scramble" aria-label={text} className={className}>
      {display}
    </Tag>
  );
}
