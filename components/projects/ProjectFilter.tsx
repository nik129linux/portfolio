"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import type { Project } from "@/data/types";
import ProjectTile from "./ProjectTile";

gsap.registerPlugin(Flip);

const ALL = "All";

// Bento rhythm for the unfiltered grid (6 columns on desktop): one full-width feature row,
// then rows of three. Literal class names so Tailwind can see them. While a filter is on,
// every tile is a uniform 2.
const SPANS = ["lg:col-span-6"];

// Chips filter the tiles by project kind. GSAP Flip moves the remaining tiles to
// their new places; tiles that leave are display:none at rest, so layout stays honest.
export default function ProjectFilter({ projects }: { projects: Project[] }) {
  const kinds = [...new Set(projects.map((p) => p.kind))];
  const [selected, setSelected] = useState<string>(ALL);
  const grid = useRef<HTMLDivElement>(null);
  const before = useRef<Flip.FlipState | null>(null);

  function select(kind: string) {
    if (kind === selected) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    before.current = !reduce && grid.current ? Flip.getState(Array.from(grid.current.children)) : null;
    setSelected(kind);
  }

  useLayoutEffect(() => {
    const state = before.current;
    before.current = null;
    if (!state) return;
    Flip.from(state, {
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.04,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", clearProps: "opacity,transform" }),
    });
  }, [selected]);

  const shown = selected === ALL ? projects.length : projects.filter((p) => p.kind === selected).length;

  return (
    <div>
      <div role="group" aria-label="Filter projects by type" className="flex flex-wrap justify-center gap-2">
        {[ALL, ...kinds].map((kind) => (
          <button
            key={kind}
            type="button"
            data-testid="project-chip"
            aria-pressed={selected === kind}
            onClick={() => select(kind)}
            className="chip"
          >
            {kind}
          </button>
        ))}
      </div>
      <p role="status" className="sr-only">
        Showing {shown} {shown === 1 ? "project" : "projects"}
      </p>

      <div ref={grid} className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-6">
        {projects.map((project, i) => (
          <ProjectTile
            key={project.slug}
            project={project}
            index={i}
            visible={selected === ALL || selected === project.kind}
            wide={selected === ALL && i === 0}
            span={selected === ALL ? (SPANS[i] ?? "lg:col-span-2") : "lg:col-span-2"}
          />
        ))}
      </div>
    </div>
  );
}
