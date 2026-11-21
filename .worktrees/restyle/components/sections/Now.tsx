import ScrubHeading from "@/components/motion/ScrubHeading";
import { nav } from "@/data/nav";
import { now } from "@/data/now";

const sectionLabel = nav.find((item) => item.id === "now")?.label ?? "Now";

const sectionIndex = String(nav.findIndex((item) => item.id === "now") + 1).padStart(2, "0");

export default function Now() {
  return (
    <section
      id="now"
      className="border-t border-cobalt bg-cobalt px-4 py-28 text-paper sm:px-6 sm:py-36 lg:px-8 lg:py-40"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="self-start lg:col-span-4 lg:sticky lg:top-28">
          <p className="eyebrow text-paper">
            <span aria-hidden className="h-px w-10 bg-paper" />
            {sectionIndex} / {sectionLabel}
          </p>
          <ScrubHeading className="mt-8 text-5xl leading-none text-paper sm:text-6xl lg:text-7xl" text={sectionLabel} />
          <p className="mt-8 max-w-prose text-xl leading-relaxed text-paper">
            {now.intro}
          </p>
        </div>

        <dl className="grid gap-5 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {now.items.map((item, index) => (
            <div
              key={`${item.label}-${item.value}`}
              className={`rounded-2xl bg-paper p-6 text-ink sm:p-7 ${index % 2 === 1 ? "sm:mt-10" : ""}`}
            >
              <dt className="text-sm font-semibold uppercase tracking-widest text-ink-2">
                {item.label}
              </dt>
              <dd className="mt-2 text-xl text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
