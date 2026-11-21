import RevealHeading from "@/components/motion/RevealHeading";
import { profile } from "@/data/profile";

// A light-blue chapter. On desktop each layer is a wide card that sticks and the next
// one slides over it (position: sticky, no JS). On phones they simply stack.
export default function Build() {
  return (
    <section id="build" className="bg-accent-soft px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <RevealHeading as="h2" text="What I build" className="wordmark wordmark-section lg:col-span-8" />
          <p className="max-w-sm text-lg text-ink-2 lg:col-span-4 lg:justify-self-end">
            Four layers, from the API to the model behind it. Scroll to stack them.
          </p>
        </div>

        <ol className="mt-16 space-y-6 lg:space-y-10">
          {profile.stack.map((group, i) => (
            <li key={group.group} className="lg:sticky" style={{ top: `calc(6.5rem + ${i * 1.25}rem)` }}>
              <article
                data-testid="build-card"
                className="grid gap-8 rounded-[28px] bg-paper-2 p-6 shadow-raised sm:p-10 lg:min-h-[17rem] lg:grid-cols-12 lg:items-center"
              >
                <div className="lg:col-span-5">
                  <p aria-hidden className="font-display text-6xl font-extrabold leading-none text-accent-strong sm:text-7xl">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 font-display text-4xl font-bold leading-none text-ink sm:text-5xl">{group.group}</h3>
                </div>
                <ul className="flex flex-wrap content-center gap-3 lg:col-span-7">
                  {group.items.map((item) => (
                    <li key={item} className="rounded-full bg-accent-soft px-5 py-2.5 text-lg font-semibold text-ink">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
