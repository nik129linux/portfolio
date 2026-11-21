"use client";

import { useState } from "react";
import ProjectLinks from "@/components/ui/ProjectLinks";
import type { Project } from "@/data/types";
import TileCover from "./TileCover";

// Each kind of project pops its glossy object out of the tile's top-right corner.
const OBJECT: Record<Project["kind"], string> = {
  Desktop: "laptop",
  Mobile: "phone",
  Smartwatch: "watch",
  "Video game": "gamepad",
  Web: "folder",
  Tool: "terminal",
};

export default function ProjectTile({
  project,
  visible = true,
  span = "lg:col-span-2",
  wide = false,
  index = 0,
}: {
  project: Project;
  visible?: boolean;
  span?: string;
  wide?: boolean;
  index?: number;
}) {
  const [active, setActive] = useState(false);

  return (
    <article
      data-testid="project-tile"
      data-slug={project.slug}
      data-kind={project.kind}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={`lift relative ${visible ? "flex" : "hidden"} ${wide ? "sm:col-span-2 lg:flex-row" : ""} ${span} flex-col rounded-[28px] bg-paper-2 text-ink shadow-card`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-testid="tile-object"
        aria-hidden="true"
        alt=""
        src={`/3d/${OBJECT[project.kind]}.png`}
        width={96}
        height={96}
        loading="lazy"
        className="float-object pointer-events-none absolute -right-3 -top-7 z-10 w-16 drop-shadow-xl sm:w-20"
        style={{ ["--float-delay" as string]: `${(index % 4) * 0.7}s`, ["--float-dur" as string]: "7.5s" }}
      />
      <div className={`p-3 ${wide ? "lg:w-[56%] lg:shrink-0 lg:self-center lg:pb-3" : "pb-0"}`}>
        <div className="overflow-hidden rounded-[20px]">
          <TileCover project={project} active={active} />
        </div>
      </div>
      <div className={`flex flex-1 flex-col gap-4 px-6 pb-6 pt-5 ${wide ? "lg:justify-center lg:p-10" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-ink">{project.kind}</span>
          {project.collaboration ? <span className="text-xs font-semibold text-ink-2">Team project</span> : null}
        </div>
        <h3 className={`font-display font-bold leading-none ${wide ? "text-3xl lg:text-5xl" : "text-3xl"}`}>{project.title}</h3>
        <p className="text-base leading-relaxed text-ink-2">{project.summary}</p>
        <ul className="flex flex-wrap gap-2" aria-label={`${project.title} stack`}>
          {project.stack.map((item) => (
            <li key={item} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-ink">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-2">
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}
