// Logo files in /public/icons (devicon, MIT; Gemini and Claude from simple-icons, CC0; opencode mark from its MIT repo). Items without a
// logo ("LLM APIs", "Prompt design") are still listed as text everywhere.
export const ICON: Record<string, string> = {
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
  "Claude Code": "claude",
  opencode: "opencode",
  AWS: "aws",
  Vercel: "vercel",
  PostgreSQL: "postgresql",
  Docker: "docker",
  Git: "git",
};

export const iconSrc = (name: string) => (ICON[name] ? `/icons/${ICON[name]}.svg` : null);
