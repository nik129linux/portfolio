import { ArrowUpRight, Github } from "lucide-react";
import { buttonPrimarySmall, buttonSecondarySmall } from "@/components/ui/button";
import type { Project } from "@/data/types";

function isPlaceholder(value?: string) {
  return !value || value.startsWith("[");
}

export function ProjectAction({
  label,
  url,
  variant = "secondary",
}: {
  label: string;
  url?: string;
  variant?: "primary" | "secondary" | "github";
}) {
  // Placeholders are not shown; an entry only offers links that work.
  if (isPlaceholder(url)) return null;

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

export type ProjectLinksProps = {
  project?: Project;
  github?: string;
  demo?: string;
  download?: string;
};

export function ProjectLinks({ project, github, demo, download }: ProjectLinksProps) {
  const g = project?.github ?? github;
  const d = project?.demo ?? demo;
  const dl = project?.download ?? download;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ProjectAction label="GitHub" url={g} variant="github" />
      <ProjectAction label="Live demo" url={d} variant="primary" />
      <ProjectAction label="Download" url={dl} />
    </div>
  );
}

export default ProjectLinks;
