import Link from "next/link";
import TextScramble from "@/components/motion/TextScramble";
import FlyApartText from "@/components/motion/FlyApartText";
import BlurReveal from "@/components/motion/BlurReveal";
import PerspectiveTunnel from "@/components/motion/PerspectiveTunnel";
import { projects } from "@/data/projects";

const tunnelItems = projects.slice(0, 5).map((p) => ({ slug: p.slug, title: p.title, kind: p.kind, media: p.media }));

export default function LabPage() {
  return (
    <main className="bg-paper text-ink">
      <nav className="flex gap-4 p-6 text-sm">
        <a href="#scramble-block">Scramble</a>
        <a href="#fly-block">Fly apart</a>
        <a href="#blur-block">Reveal</a>
        <a href="#tunnel-block">Tunnel</a>
      </nav>
      <section id="scramble-block" className="flex min-h-[100vh] items-center px-6">
        <TextScramble text="Backend engineer who ships AI" as="p" />
      </section>
      <div aria-hidden className="min-h-[100vh]" />
      <section id="fly-block" className="flex min-h-[100vh] items-center px-6">
        <FlyApartText text="I design it, I build it, and I ship it" />
      </section>
      <div aria-hidden className="min-h-[100vh]" />
      <section id="blur-block" className="flex min-h-[100vh] items-center px-6">
        <BlurReveal text="Interfaces that explain themselves" as="h2" />
      </section>
      <div aria-hidden className="min-h-[100vh]" />
      <section id="tunnel-block" className="min-h-[100svh]">
        <PerspectiveTunnel items={tunnelItems} />
      </section>
      <div aria-hidden className="min-h-[100vh]" />
      <footer className="p-6">
        <Link href="/lab/next">Next page</Link>
      </footer>
    </main>
  );
}
