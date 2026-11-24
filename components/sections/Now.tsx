import RevealHeading from "@/components/motion/RevealHeading";
import { now } from "@/data/now";

// The loudest blue on the page: a drenched band. Wordmark and intro on the left,
// the three focus items as white cards on the right.
export default function Now() {
  return (
    <section id="now" className="bg-accent px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <RevealHeading as="h2" text="Now" className="wordmark wordmark-xl !text-accent-ink" />
          <p className="mt-8 max-w-md text-xl leading-relaxed text-accent-ink">{now.intro}</p>
        </div>

        <dl className="grid gap-4 lg:col-span-7">
          {now.items.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-[28px] bg-paper-2 p-6 shadow-raised sm:p-8">
              <dt className="text-sm font-semibold text-accent-strong">{item.label}</dt>
              <dd className="mt-2 font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
