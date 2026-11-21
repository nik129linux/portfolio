import Parallax, { ParallaxLayer } from "@/components/motion/Parallax";
import PerspectiveTunnel from "@/components/motion/PerspectiveTunnel";
import PortalReveal from "@/components/motion/PortalReveal";
import { projects } from "@/data/projects";

const tunnelItems = projects.map((p) => ({ slug: p.slug, title: p.title, kind: p.kind, media: p.media }));

export default function M1Page() {
  return (
    <main className="bg-paper text-ink">
      <div aria-hidden className="min-h-screen" />
      <PortalReveal media="/projects/placeholder.svg" title="Selected work" />
      <div aria-hidden className="min-h-screen" />
      <PerspectiveTunnel items={tunnelItems} />
      <div aria-hidden className="min-h-screen" />
      <Parallax>
        <ParallaxLayer speed={0.2} className="flex min-h-screen items-center justify-center px-6">
          <img src="/projects/placeholder.svg" alt="Project preview" draggable={false} className="w-full max-w-3xl object-cover" />
        </ParallaxLayer>
        <ParallaxLayer speed={0.5} className="flex min-h-screen items-center justify-center px-6">
          <h2 className="text-center font-display text-5xl text-ink sm:text-7xl">Work that moves with you</h2>
        </ParallaxLayer>
        <ParallaxLayer speed={0.9} className="flex min-h-screen items-center justify-center px-6">
          <div className="h-64 w-full max-w-3xl bg-coral" />
        </ParallaxLayer>
      </Parallax>
      <div aria-hidden className="min-h-screen" />
    </main>
  );
}
