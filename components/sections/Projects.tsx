import RevealHeading from "@/components/motion/RevealHeading";
import ProjectFilter from "@/components/projects/ProjectFilter";
import { nav } from "@/data/nav";
import { projects } from "@/data/projects";

const sectionLabel = nav.find((item) => item.id === "projects")?.label ?? "Projects";

export default function Projects() {
  return (
    <section id="projects" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <RevealHeading as="h2" text={sectionLabel} className="wordmark wordmark-xl lg:col-span-8" />
          <p className="max-w-sm text-lg text-ink-2 lg:col-span-4 lg:justify-self-end">
            Class projects and side builds. Hover a tile to look inside, then open the code.
          </p>
        </div>

        <div className="mt-14">
          <ProjectFilter projects={projects} />
        </div>
      </div>
    </section>
  );
}
