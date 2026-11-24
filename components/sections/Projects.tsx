import RevealHeading from "@/components/motion/RevealHeading";
import ProjectOrbit from "@/components/projects/ProjectOrbit";
import { nav } from "@/data/nav";
import { projects } from "@/data/projects";

const sectionLabel = nav.find((item) => item.id === "projects")?.label ?? "Projects";

export default function Projects() {
  // Opens on the accent (the Build chapter flows into it) and fades to near-white, where the screen
  // field takes over.
  return (
    <section
      id="projects"
      className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      style={{ backgroundImage: "linear-gradient(180deg, var(--accent) 0, var(--accent) 16rem, var(--paper-2) calc(16rem + 70vh))" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <RevealHeading as="h2" text={sectionLabel} className="wordmark wordmark-xl !text-accent-ink lg:col-span-8" />
          <p className="max-w-sm text-lg text-accent-ink lg:col-span-4 lg:justify-self-end">
            Scroll to fly through the work, then pick a project to see what it does and open the code.
          </p>
        </div>

        <ProjectOrbit projects={projects} />
      </div>
    </section>
  );
}
