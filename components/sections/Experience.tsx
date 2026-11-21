import SectionLabel from "@/components/ui/SectionLabel";
import { experience } from "@/data/experience";
import { nav } from "@/data/nav";

const sectionLabel = nav.find((item) => item.id === "experience")?.label ?? "Experience";

// A plain timeline: dates at display size on the left, the entry on the right,
// one thin rule per row. No cards, no dots, no vertical rail.
export default function Experience() {
  return (
    <section id="experience" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>{sectionLabel}</SectionLabel>

        <ol className="mt-12">
          {experience.map((item) => (
            <li
              key={`${item.title}-${item.place}-${item.start}`}
              data-testid="experience-item"
              className="grid gap-4 border-t border-ink/15 py-8 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:gap-10 sm:py-12"
            >
              <div>
                <p className="font-display text-4xl font-bold leading-none text-ink sm:text-5xl">
                  {item.start}
                </p>
                <p className="mt-2 text-sm text-ink-2">to {item.end}</p>
              </div>

              <div>
                <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-ink">
                  {item.type === "academic" ? "Academic" : "Work"}
                </span>

                <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-1 text-base text-ink-2">{item.place}</p>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-2">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
