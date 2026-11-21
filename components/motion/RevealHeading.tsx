"use client";

import { Fragment, useEffect, useRef, useState, type ElementType } from "react";

// Per-character stagger reveal (haoqi teardown, hsstFadeIn): each letter fades
// and rises on its own delay when the heading enters the viewport, and fades
// back out when it leaves, so the motion stays reversible. Transitions only
// touch opacity and transform; the CSS lives in app/globals.css (.reveal).
const SPREAD_MS = 290; // total delay spread across the whole heading
const MAX_STEP_MS = 24; // short headings should not crawl

export default function RevealHeading({
  text,
  className,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting), {
      rootMargin: "0px 0px -15% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ").filter(Boolean);
  const total = words.reduce((n, w) => n + w.length, 0);
  const step = Math.min(MAX_STEP_MS, SPREAD_MS / Math.max(1, total - 1));
  let index = 0;

  return (
    <Tag
      ref={ref}
      data-testid="reveal-heading"
      data-shown={shown ? "" : undefined}
      aria-label={text}
      className={`reveal ${className ?? ""}`}
    >
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {[...word].map((ch) => {
              const delay = Math.round(index++ * step);
              return (
                <span key={delay} className="ch" style={{ transitionDelay: `${delay}ms` }}>
                  {ch}
                </span>
              );
            })}
          </span>
          {/* The space lives between words: inside an inline-block it collapses. */}
          {w < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
