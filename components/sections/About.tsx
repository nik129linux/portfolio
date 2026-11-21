import ScrubText from "@/components/ui/ScrubText";
import SectionLabel from "@/components/ui/SectionLabel";
import { nav } from "@/data/nav";
import { profile } from "@/data/profile";

const sectionLabel = nav.find((item) => item.id === "about")?.label ?? "About";

// Editorial split: a sticky label column on the left (title, place, hobbies), and one
// large statement on the right whose words light up as you read down the page.
export default function About() {
  return (
    <section id="about" className="px-4 pb-24 pt-8 sm:px-6 sm:pb-32 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
        <div className="self-start lg:sticky lg:top-28 lg:col-span-3">
          <SectionLabel>{sectionLabel}</SectionLabel>
          <p className="mt-5 text-base text-ink-2">Based in {profile.location}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {profile.hobbies.map((hobby) => (
              <li key={hobby} className="rounded-full bg-paper-2 px-4 py-2 text-sm font-semibold text-ink shadow-card">
                {hobby}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-10 lg:col-span-9">
          {profile.about.map((paragraph) => (
            <ScrubText
              key={paragraph}
              text={paragraph}
              className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-6xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
