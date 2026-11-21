import ScrubHeading from "@/components/motion/ScrubHeading";
import { experience } from "@/data/experience";
import { nav } from "@/data/nav";

const sectionLabel =
  nav.find((item) => item.id === "experience")?.label ?? "Experience";

const sectionIndex = String(nav.findIndex((item) => item.id === "experience") + 1).padStart(2, "0");

export default function Experience() {
  return (
    <section
      id="experience"
      className="border-t border-line px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-40"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="self-start lg:col-span-4 lg:sticky lg:top-28">
          <p className="eyebrow">
            <span aria-hidden className="h-px w-10 bg-cobalt" />
            {sectionIndex} / {sectionLabel}
          </p>
          <ScrubHeading className="mt-8 text-5xl leading-none text-ink sm:text-6xl lg:text-7xl" text={sectionLabel} />
        </div>

        <ol className="mt-12 ml-1.5 border-l border-line lg:col-span-7 lg:col-start-6 lg:mt-0">
          {experience.map((item, index) => {
            const isAcademic = item.type === "academic";

            return (
              <li
                key={`${item.title}-${item.place}-${item.start}`}
                data-testid="experience-item"
                className={`relative pb-12 pl-8 last:pb-0 ${index % 2 === 1 ? "sm:ml-12" : ""}`}
              >
                <span
                  aria-hidden
                  className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-paper ${
                    isAcademic ? "bg-coral" : "bg-ink"
                  }`}
                />

                <div className="rounded-2xl bg-paper-2 p-6 shadow-card sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        isAcademic
                          ? "bg-coral text-ink"
                          : "border border-line bg-paper text-ink-2"
                      }`}
                    >
                      {isAcademic ? "Academic" : "Work"}
                    </span>
                    <span className="text-sm text-ink-2">
                      {item.start} to {item.end}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl text-ink">{item.title}</h3>
                  <p className="mt-1 text-base text-ink-2">{item.place}</p>
                  <p className="mt-2 text-base leading-relaxed text-ink-2">
                    {item.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
