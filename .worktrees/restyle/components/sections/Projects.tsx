import ScrubHeading from "@/components/motion/ScrubHeading";
import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import { nav } from "@/data/nav";
import ScrollScreens from "@/components/motion/ScrollScreens";
import PortalReveal from "@/components/motion/PortalReveal";
import ProjectShowcase from "@/components/motion/ProjectShowcase";
import VelocitySkew from "@/components/motion/VelocitySkew";
import { projects } from "@/data/projects";
import { buttonPrimarySmall, buttonSecondarySmall } from "@/components/ui/button";

const sectionLabel =
  nav.find((item) => item.id === "projects")?.label ?? "Projects";

function isPlaceholder(value: string) {
  return value.startsWith("[");
}

function ProjectAction({
  label,
  url,
  variant = "secondary",
}: {
  label: string;
  url?: string;
  variant?: "primary" | "secondary" | "github";
}) {
  // Placeholders are not shown; a card only offers links that work.
  if (!url || isPlaceholder(url)) return null;

  if (variant === "github") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" title="Code on GitHub" className="btn btn-secondary btn-icon">
        <Github aria-hidden className="size-5" strokeWidth={1.75} />
        <span className="sr-only">GitHub</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-cta
      className={variant === "primary" ? buttonPrimarySmall : buttonSecondarySmall}
    >
      {label} <ArrowUpRight aria-hidden className="btn-arrow size-4" />
    </a>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="bg-deep px-4 py-32 text-paper sm:px-6 sm:py-40 lg:px-8 lg:py-48"
    >
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow text-mist">
          <span aria-hidden className="h-px w-10 bg-coral" />
          {String(nav.findIndex((item) => item.id === "projects") + 1).padStart(2, "0")} / {sectionLabel}
        </p>
        <ScrubHeading className="mt-8 max-w-none text-7xl leading-none text-paper sm:text-8xl lg:text-9xl" text={sectionLabel} />

        <p className="mt-8 max-w-prose text-xl text-mist">
          Scroll through the work, then open any project for the code and a live demo.
        </p>

        <ol className="mt-12 border-t border-paper/20">
          {projects.map((project, index) => (
            <li key={project.slug} className="border-b border-paper/20">
              <a
                href={`#project-${project.slug}`}
                className="group grid grid-cols-12 items-center gap-3 py-4"
              >
                <span aria-hidden className="col-span-2 font-display text-2xl text-mist sm:col-span-1 sm:text-3xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="col-span-7 font-display text-2xl text-paper sm:col-span-6 sm:text-4xl">
                  {project.title}
                </span>
                <span className="col-span-3 text-right text-sm uppercase tracking-widest text-mist sm:text-base">
                  {project.kind}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      <PortalReveal media={projects[0].screens?.[2]?.src ?? projects[0].media} title="Selected work" />

      {projects.filter((p) => p.screens && p.device).map((p) => (
        <ProjectShowcase key={p.slug} project={p} />
      ))}

      <div className="mx-auto max-w-7xl">
        <div className="mt-16 grid gap-6 md:grid-cols-12">
          {projects.map((project, index) => (
            <article
              key={project.slug}
              id={`project-${project.slug}`}
              data-testid="project-card"
              data-slug={project.slug}
              className={`lift flex flex-col rounded-2xl border border-transparent bg-paper p-2 shadow-card hover:shadow-card-hover md:col-span-6 ${index % 2 === 0 ? "lg:col-span-7" : "lg:col-span-5 lg:mt-16"}`}
            >
              <VelocitySkew>
                <div
                  data-testid="card-media"
                  className="relative aspect-8/5 overflow-hidden rounded-lg bg-paper-2 ring-1 ring-line"
                >
                  {project.screens ? (
                    <ScrollScreens screens={project.screens} title={project.title} />
                  ) : (
                    <Image
                      src={project.media}
                      alt={`${project.title} preview`}
                      width={720}
                      height={450}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </VelocitySkew>

              <div className="flex flex-1 flex-col gap-4 px-2 pb-2 pt-4 sm:px-3 sm:pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-paper-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-2">
                    {project.kind}
                  </span>
                  {project.collaboration ? (
                    <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold text-ink">
                      Team project
                    </span>
                  ) : null}
                </div>

                <h3 className="text-2xl text-ink">{project.title}</h3>
                <p className="text-base leading-relaxed text-ink-2">
                  {project.summary}
                </p>

                <ul
                  className="flex flex-wrap gap-2"
                  aria-label={`${project.title} stack`}
                >
                  {project.stack.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-2"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  <ProjectAction label="GitHub" url={project.github} variant="github" />
                  <ProjectAction label="Live demo" url={project.demo} variant="primary" />
                  <ProjectAction label="Download" url={project.download} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
