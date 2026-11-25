import SectionLabel from "@/components/ui/SectionLabel";
import ExperienceMotion from "@/components/motion/ExperienceMotion";
import ExperienceCard, { type ProjectThumb } from "@/components/experience/ExperienceCard";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { nav } from "@/data/nav";

const sectionLabel = nav.find((item) => item.id === "experience")?.label ?? "Experience";

function thumbs(slugs: string[] = []): ProjectThumb[] {
  return slugs.flatMap((slug) => {
    const p = projects.find((x) => x.slug === slug);
    return p ? [{ slug: p.slug, title: p.title, kind: p.kind, cover: p.screens?.[0]?.src }] : [];
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// "2026-09" -> { month: "Sep", year: "2026" }; "2025" -> { year: "2025" }; "Present" stays as is.
function parseDate(value: string) {
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(value.trim());
  if (!m) return { year: value, month: undefined, label: value };
  const month = m[2] ? MONTHS[Number(m[2]) - 1] : undefined;
  return { year: m[1], month, label: month ? `${month} ${m[1]}` : m[1] };
}

// A timeline on a cobalt rail. The rail draws itself as the list scrolls past, each row's node
// lights up when it reaches the middle of the screen, and its year fills from outline to cobalt.
// Without JS or with reduced motion everything renders in its finished, filled state.
export default function Experience() {
  return (
    <section id="experience" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>{sectionLabel}</SectionLabel>

        <ExperienceMotion className="relative mt-16">
          {/* the rail: a faint track and the cobalt fill that scroll draws */}
          <span aria-hidden className="absolute bottom-0 left-[11px] top-2 w-0.5 rounded-full bg-white shadow-[0_0_0_1px_rgb(25_25_25/0.04)] sm:left-[calc(16rem+2.5rem+11px)]" />
          <span
            aria-hidden
            data-exp-rail
            className="absolute bottom-0 left-[11px] top-2 w-0.5 origin-top rounded-full bg-accent sm:left-[calc(16rem+2.5rem+11px)]"
          />
          {/* the pen tip: rides the end of the cobalt line while it draws (hidden without motion) */}
          <span
            aria-hidden
            data-exp-tip
            className="exp-tip absolute left-[12px] top-2 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent sm:left-[calc(16rem+2.5rem+12px)]"
          />

          <ol className="flex flex-col gap-16 sm:gap-24">
            {experience.map((item) => {
              const start = parseDate(item.start);
              const end = parseDate(item.end);
              return (
                <li
                  key={`${item.title}-${item.place}-${item.start}`}
                  data-testid="experience-item"
                  data-exp-row
                  className="group relative grid gap-4 pl-12 sm:grid-cols-[16rem_minmax(0,1fr)] sm:gap-10 sm:pl-0"
                >
                  {/* date column */}
                  <div className="sm:pr-2 sm:text-right">
                    {start.month && <p className="text-sm font-semibold text-ink-2">{start.month}</p>}
                    <p className="overflow-hidden pb-1">
                      <span data-exp-year className="exp-year block font-display text-6xl font-extrabold leading-none sm:text-7xl">
                        {start.year}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-ink-2">to {end.label}</p>
                  </div>

                  {/* node on the rail + entry */}
                  <div className="relative sm:pl-12">
                    <span
                      aria-hidden
                      data-exp-node
                      className="exp-node absolute -left-12 top-3 grid size-6 place-items-center rounded-full border-2 border-accent bg-paper sm:left-0"
                    >
                      <span className="size-2 rounded-full bg-accent" />
                    </span>

                    {/* GSAP moves this wrapper, so the card's own hover transform stays free */}
                    <div data-exp-card>
                      <ExperienceCard item={item} projects={thumbs(item.projects)} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </ExperienceMotion>
      </div>
    </section>
  );
}
