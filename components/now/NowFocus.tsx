"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CircleDot, Cloud, DatabaseZap, Layers, Workflow, type LucideIcon } from "lucide-react";
import type { NowData } from "@/data/now";

const ICONS: Record<string, LucideIcon> = { Shipping: Layers, RAG: DatabaseZap, Cloud, Agents: Workflow };
const pad = (n: number) => String(n).padStart(2, "0");

// The focus list in the Now chapter. One item is open at a time: it becomes a white card with
// its icon, a big index and the full line, and tilts a little toward the pointer. The others stay
// as compact deep-cobalt rows. Hover (fine pointers) or click/Enter opens one. On scroll entry the
// rows deal in from the right, scrubbed, so scrolling back takes them away again.
export default function NowFocus({ items }: { items: NowData["items"] }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLUListElement>(null);
  const base = useId();

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from("[data-now-row]", {
        x: 120,
        opacity: 0,
        rotate: 3,
        transformOrigin: "100% 50%",
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", end: "top 40%", scrub: 0.5 },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const hoverOpen = (i: number) => (e: PointerEvent) => {
    if (e.pointerType === "mouse") setActive(i);
  };

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--rx", `${(((e.clientY - r.top) / r.height) - 0.5) * -5}deg`);
    e.currentTarget.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width) - 0.5) * 6}deg`);
  };
  const untilt = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <ul ref={root} className="now-list flex flex-col gap-3">
      {items.map((item, i) => {
        const open = i === active;
        const Icon = ICONS[item.label] ?? CircleDot;
        const panel = `${base}-${i}`;
        return (
          <li key={`${item.label}-${i}`} data-now-row data-testid="now-item" className="now-row" onPointerEnter={hoverOpen(i)}>
            <div
              data-open={open ? "" : undefined}
              onPointerMove={open ? tilt : undefined}
              onPointerLeave={untilt}
              className="now-card relative overflow-hidden rounded-[28px]"
            >
              <span aria-hidden className="now-index pointer-events-none absolute -right-2 -top-6 select-none font-display font-extrabold leading-none">
                {pad(i + 1)}
              </span>

              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panel}
                  onClick={() => setActive(i)}
                  className="relative flex w-full items-center gap-4 p-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent-ink sm:p-6"
                >
                  <span className="now-icon grid size-11 shrink-0 place-items-center rounded-2xl">
                    <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="now-label font-display text-xl font-bold sm:text-2xl">{item.label}</span>
                  <span aria-hidden className="now-num ml-auto font-display text-sm font-bold tabular-nums">
                    {pad(i + 1)} / {pad(items.length)}
                  </span>
                </button>
              </h3>

              <div id={panel} className="now-panel relative" inert={!open}>
                <div className="overflow-hidden">
                  <p className="now-value px-5 pb-6 font-display text-2xl font-bold leading-snug text-ink sm:px-6 sm:pb-8 sm:pl-[5.25rem] sm:text-3xl">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
