import ScrubHeading from "@/components/motion/ScrubHeading";
import Marquee from "@/components/motion/Marquee";
import DrumWheel from "@/components/motion/DrumWheel";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

const stack = profile.stack.flatMap((group) => group.items);
const drumItems = projects.map((project) => ({
  slug: project.slug,
  title: project.title,
  kind: project.kind,
  href: `#${project.slug}`,
}));

export default function MotionLabPage() {
  return (
    <main className="bg-paper text-ink">
      <div aria-hidden className="min-h-screen" />
      <section className="px-6 py-24">
        <ScrubHeading text={profile.heroLine} className="text-4xl font-bold md:text-6xl" />
      </section>
      <div aria-hidden className="min-h-screen" />
      <Marquee items={stack} />
      <div aria-hidden className="min-h-screen" />
      <section className="py-16">
        <DrumWheel items={drumItems} />
      </section>
      <div aria-hidden className="min-h-screen" />
    </main>
  );
}
