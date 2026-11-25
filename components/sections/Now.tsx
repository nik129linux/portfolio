import RevealHeading from "@/components/motion/RevealHeading";
import NowFocus from "@/components/now/NowFocus";
import { now } from "@/data/now";

// The loudest blue on the page: a drenched band with depth (a deep-cobalt pool and a slow
// drifting light behind everything). Wordmark, intro and a live "updated" line on the left;
// the focus list on the right, one item open at a time (components/now/NowFocus.tsx).
export default function Now() {
  return (
    <section id="now" className="relative isolate overflow-hidden bg-accent px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <span aria-hidden className="now-bg absolute inset-0 -z-10" />
      <span aria-hidden className="now-drift absolute -z-10" />

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <RevealHeading as="h2" text="Now" className="wordmark wordmark-xl !text-accent-ink" />
          <p className="mt-8 max-w-md text-xl leading-relaxed text-accent-ink">{now.intro}</p>
          <p className="mt-8 inline-flex items-center gap-3 rounded-full bg-accent-deep/50 px-4 py-2 text-sm font-semibold text-accent-ink">
            <span aria-hidden className="now-live relative size-2.5 rounded-full bg-accent-ink" />
            Updated {now.updated}
          </p>
        </div>

        <div className="lg:col-span-7">
          <NowFocus items={now.items} />
        </div>
      </div>
    </section>
  );
}
