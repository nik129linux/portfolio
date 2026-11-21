import Link from "next/link";
import ProjectShowcase from "@/components/motion/ProjectShowcase";
import type { Project } from "@/data/types";

function demo(
  slug: string,
  title: string,
  kind: Project["kind"],
  device: NonNullable<Project["device"]>,
  captions: string[],
): Project {
  return {
    slug,
    title,
    kind,
    device,
    summary: "",
    stack: [],
    github: "",
    media: `/showcase-demo/${slug}-1.svg`,
    screens: captions.map((caption, i) => ({ src: `/showcase-demo/${slug}-${i + 1}.svg`, caption })),
  };
}

const showcases: Project[] = [
  demo("retoma", "Retoma", "Desktop", "laptop", [
    "Resume card",
    "Daily timeline",
    "Privacy controls",
    "Focus mode",
  ]),
  demo("acompana", "Acompaña", "Mobile", "phone", [
    "Bedside log",
    "Patient view",
    "Shift handoff",
    "Alerts",
  ]),
  demo("hand-hygiene-watch", "Hand Hygiene Watch", "Smartwatch", "watch", [
    "Silent reminder",
    "Hygiene log",
    "One-tap fix",
    "Shift summary",
  ]),
  demo("lumenfall", "Lumenfall", "Video game", "monitor", [
    "Level one",
    "Boss fight",
    "Enemy AI",
    "Run summary",
  ]),
];

export default function ShowcaseLabPage() {
  return (
    <main className="bg-paper text-ink">
      <header className="flex items-baseline justify-between gap-4 px-6 py-8">
        <h1 className="text-xl font-semibold">Pinned project showcase</h1>
        <Link href="/lab" className="text-sm text-ink-2 underline-offset-4 hover:underline">
          Back to lab
        </Link>
      </header>
      {showcases.map((project) => (
        <ProjectShowcase key={project.slug} project={project} />
      ))}
    </main>
  );
}
