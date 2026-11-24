"use client";

import type { JSX } from "react";
import type { Project } from "@/data/types";

function firstSentence(text: string) {
  const end = text.indexOf(". ");
  return end === -1 ? text : text.slice(0, end + 1);
}

// List mode for phones: one readable row per project. The row's button opens the
// detail panel, which keeps the row itself free of nested controls.
export default function ProjectList({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (slug: string) => void;
}): JSX.Element {
  return (
    <ul data-testid="project-list" className="flex flex-col gap-3">
      {projects.map((project) => (
        <li
          key={project.slug}
          data-slug={project.slug}
          className="rounded-[28px] bg-paper-2 p-5 shadow-card"
        >
          <p className="font-display text-lg font-bold text-ink">{project.title}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent-strong">
            {project.kind}
          </p>
          <p className="mt-2 text-sm text-ink-2">{firstSentence(project.summary)}</p>
          <button
            type="button"
            aria-label={`Open ${project.title}`}
            onClick={() => onOpen(project.slug)}
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-accent-soft px-4 text-sm font-semibold text-accent-strong transition-opacity duration-200 hover:opacity-70"
          >
            Details
          </button>
        </li>
      ))}
    </ul>
  );
}
