"use client";

import type { JSX } from "react";
import type { Project } from "@/data/types";

// Chip row for the orbit: one chip per project, the active one filled with the accent.
// Same chip look as the kind filter, so both rows read as one control family.
export default function ProjectChips({
  projects,
  activeSlug,
  onSelect,
}: {
  projects: Project[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}): JSX.Element {
  return (
    <div
      data-testid="project-chips"
      role="group"
      aria-label="Projects"
      className="flex flex-wrap justify-center gap-2"
    >
      {projects.map((project) => (
        <button
          key={project.slug}
          type="button"
          data-slug={project.slug}
          aria-pressed={project.slug === activeSlug}
          onClick={() => onSelect(project.slug)}
          className="chip min-h-11"
        >
          {project.title}
        </button>
      ))}
    </div>
  );
}
