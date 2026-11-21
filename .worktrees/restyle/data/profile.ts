import type { Profile } from "./types";

// [placeholders] are filled by Nico. Never invent them.
export const profile: Profile = {
  name: "Nicolas Casanova",
  role: "Software Engineering student · Backend & AI integration",
  location: "Pasto, Colombia",
  heroLine: "I build backends that talk to AI.",
  heroSub: "Python and TypeScript, FastAPI and Next.js, shipped to the cloud.",
  photo: "/photo.webp",
  cvUrl: "[CV_GOOGLE_DRIVE_URL]",
  about: ["[About paragraph 1: who you are outside tech]", "[About paragraph 2: what you are building toward]"],
  hobbies: ["[hobby 1]", "[hobby 2]", "[hobby 3]"],
  stack: [
    { group: "Backend", items: ["Python", "FastAPI", "Node.js", "NestJS", "Java"] },
    { group: "Frontend", items: ["TypeScript", "Next.js", "React", "Tailwind CSS", "Electron"] },
    { group: "AI", items: ["LLM APIs", "Ollama", "Gemini", "Prompt design"] },
    { group: "Cloud & data", items: ["AWS", "Vercel", "PostgreSQL", "Docker", "Git"] },
  ],
  email: "[EMAIL]",
  github: "https://github.com/nik129linux",
  linkedin: "https://www.linkedin.com/in/nicolas-casanova-72583b384/",
};
