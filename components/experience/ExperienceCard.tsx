"use client";

import { useId, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { ArrowUpRight, Briefcase, GraduationCap, Plus } from "lucide-react";
import type { ExperienceItem } from "@/data/types";
import { openProject } from "@/components/projects/openProject";

export type ProjectThumb = { slug: string; title: string; kind: string; cover?: string };

// One timeline entry. The card is a disclosure: opening it shows the projects made in that
// period, and each project opens its detail panel. A soft light follows the pointer over the card.
export default function ExperienceCard({ item, projects }: { item: ExperienceItem; projects: ProjectThumb[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const Icon = item.type === "academic" ? GraduationCap : Briefcase;
  const canOpen = projects.length > 0;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      data-open={open ? "" : undefined}
      onPointerMove={onMove}
      className="exp-card relative overflow-hidden rounded-3xl bg-paper-2 shadow-[0_1px_0_rgb(25_25_25/0.04),0_12px_32px_-16px_rgb(13_26_128/0.18)]"
    >
      <span aria-hidden className="exp-spot pointer-events-none absolute inset-0" />

      <div className="relative p-6 sm:p-8">
        <span data-exp-in className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-strong">
          <Icon aria-hidden className="size-4" strokeWidth={1.75} />
          {item.type === "academic" ? "Academic" : "Work"}
        </span>
        <h3 data-exp-in className="mt-4 text-balance font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
          {item.title}
        </h3>
        <p data-exp-in className="mt-1 text-base font-semibold text-accent-strong">
          {item.place}
        </p>
        <p data-exp-in className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-ink-2">
          {item.detail}
        </p>

        {canOpen && (
          <button
            data-exp-in
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className="exp-toggle mt-6 inline-flex min-h-11 items-center gap-3 rounded-full py-1 pr-1 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-strong"
          >
            <span className="exp-toggle-icon grid size-8 place-items-center rounded-full bg-accent text-accent-ink">
              <Plus aria-hidden className="size-4" strokeWidth={2} />
            </span>
            {open ? "Hide projects" : `See ${projects.length === 1 ? "the project" : `${projects.length} projects`}`}
          </button>
        )}
      </div>

      {canOpen && (
        <div id={panelId} className="exp-panel relative" inert={!open}>
          <div className="overflow-hidden">
            <ul className="grid gap-3 px-6 pb-6 sm:grid-cols-2 sm:px-8 sm:pb-8 lg:grid-cols-3">
              {projects.map((p, i) => (
                <li key={p.slug} className="exp-tile" style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}>
                  <button
                    type="button"
                    onClick={() => openProject(p.slug)}
                    className="group/tile block w-full overflow-hidden rounded-2xl bg-paper text-left ring-1 ring-ink/5 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_rgb(13_26_128/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong active:scale-[0.98]"
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden bg-accent-soft">
                      {p.cover && (
                        <Image
                          src={p.cover}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 18rem, (min-width: 640px) 45vw, 90vw"
                          className="object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:scale-105"
                        />
                      )}
                    </span>
                    <span className="flex items-center justify-between gap-2 px-4 py-3">
                      <span>
                        <span className="block text-xs font-semibold text-ink-2">{p.kind}</span>
                        <span className="block font-display text-lg font-bold leading-tight text-ink">{p.title}</span>
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-5 shrink-0 text-accent-strong transition-transform duration-200 group-hover/tile:-translate-y-0.5 group-hover/tile:translate-x-0.5"
                        strokeWidth={1.75}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
