import { profile } from "@/data/profile";

// Logo files in /public/icons (devicon, MIT; Gemini from simple-icons, CC0). Only items with
// a logo appear here; the full stack, with or without a logo, is listed in "What I build".
const ICON: Record<string, string> = {
  Python: "python",
  FastAPI: "fastapi",
  "Node.js": "nodejs",
  NestJS: "nestjs",
  Java: "java",
  TypeScript: "typescript",
  "Next.js": "nextjs",
  React: "react",
  "Tailwind CSS": "tailwindcss",
  Electron: "electron",
  Ollama: "ollama",
  Gemini: "gemini",
  AWS: "aws",
  Vercel: "vercel",
  PostgreSQL: "postgresql",
  Docker: "docker",
  Git: "git",
};

// A calm row of technology logos with a small black caption under each. Individual
// cached SVG files, decorative (alt=""): the caption is the accessible name.
export default function StackIcons() {
  const items = profile.stack.flatMap((g) => g.items).filter((name) => ICON[name]);
  return (
    <div className="px-4 pb-16 pt-4 sm:px-6 sm:pb-24 lg:px-8">
      <ul data-testid="stack-icons" aria-label="Technologies" className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-2 gap-y-7 sm:gap-x-8">
        {items.map((name) => (
          <li key={name} className="flex w-[3.75rem] flex-col items-center gap-2 text-center sm:w-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/icons/${ICON[name]}.svg`} alt="" width={36} height={36} loading="lazy" decoding="async" className="size-9 object-contain" />
            <span className="text-xs font-medium leading-tight text-ink">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
