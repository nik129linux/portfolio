import ScrubHeading from "@/components/motion/ScrubHeading";
import { nav } from "@/data/nav";
import { profile } from "@/data/profile";

const sectionLabel =
  nav.find((item) => item.id === "about")?.label ?? "About";

const sectionIndex = String(nav.findIndex((item) => item.id === "about") + 1).padStart(2, "0");

export default function About() {
  return (
    <section
      id="about"
      className="border-t border-line px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">
          <span aria-hidden className="h-px w-10 bg-cobalt" />
          {sectionIndex} / {sectionLabel}
        </p>
        <div className="mt-8 grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:col-start-1">
            <ScrubHeading className="max-w-none text-6xl leading-none text-ink sm:text-7xl lg:text-8xl" text={sectionLabel} />
            <div className="mt-8 max-w-prose space-y-5 text-xl leading-relaxed text-ink-2">
              {profile.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <h3 className="mt-10 text-sm font-semibold uppercase tracking-widest text-ink-2">
              Stack
            </h3>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {profile.stack.map((group) => (
                <div key={group.group}>
                  <h4 className="font-display text-base font-bold text-ink">
                    {group.group}
                  </h4>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-line bg-paper-2 px-3 py-1 text-sm text-ink"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="self-start lg:col-span-4 lg:col-start-9 lg:sticky lg:top-28">
            <p className="text-base text-ink-2">Based in {profile.location}</p>

            <h3 className="mt-10 text-sm font-semibold uppercase tracking-widest text-ink-2">
              Hobbies
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {profile.hobbies.map((hobby) => (
                <li
                  key={hobby}
                  className="rounded-full border border-line bg-paper-2 px-3 py-1 text-sm text-ink"
                >
                  {hobby}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
