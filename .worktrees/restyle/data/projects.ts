import type { Project } from "./types";
import retomaScreens from "@/public/projects/retoma/screens.json";
import acompanaScreens from "@/public/projects/acompana/screens.json";
import watchScreens from "@/public/projects/hand-hygiene-watch/screens.json";
import lumenfallScreens from "@/public/projects/lumenfall/screens.json";

// Order matters: the 4 class projects first, then other work.
export const projects: Project[] = [
  {
    slug: "retoma",
    screens: retomaScreens,
    device: "laptop",
    title: "Retoma",
    kind: "Desktop",
    summary: "A desktop companion that shows where you left off after a break, with a resume card, a daily timeline and privacy controls.",
    stack: ["Electron", "JavaScript", "Ollama", "Gemini"],
    github: "[REPO_URL_RETOMA]",
    demo: "[DEMO_URL_RETOMA]",
    download: "[RELEASE_URL_RETOMA]",
    media: "/projects/placeholder.svg",
  },
  {
    slug: "acompana",
    screens: acompanaScreens,
    device: "phone",
    title: "Acompaña",
    kind: "Mobile",
    summary: "One nursing app with two faces: the nurse logs care at the bedside, and the patient sees what comes next in plain words.",
    stack: ["JavaScript", "Node.js", "Express", "Ollama"],
    github: "[REPO_URL_ACOMPANA]",
    demo: "[DEMO_URL_ACOMPANA]",
    media: "/projects/placeholder.svg",
  },
  {
    slug: "hand-hygiene-watch",
    screens: watchScreens,
    deviceScreens: [
          {
                "src": "/projects/hand-hygiene-watch/face-01.webp",
                "caption": "Watch home with day shift panel"
          },
          {
                "src": "/projects/hand-hygiene-watch/face-02.webp",
                "caption": "Entering zone reminder on wrist"
          },
          {
                "src": "/projects/hand-hygiene-watch/face-03.webp",
                "caption": "Wash confirmed on the watch"
          },
          {
                "src": "/projects/hand-hygiene-watch/face-04.webp",
                "caption": "Missed wash alert to fix"
          }
    ],
    device: "watch",
    title: "Hand Hygiene Watch",
    kind: "Smartwatch",
    summary: "A smartwatch that reminds and records hand hygiene in silence, with a one-tap fix when the sensor gets it wrong.",
    stack: ["Electron", "JavaScript", "Ollama"],
    github: "[REPO_URL_WATCH]",
    demo: "[DEMO_URL_WATCH]",
    media: "/projects/placeholder.svg",
  },
  {
    slug: "lumenfall",
    screens: lumenfallScreens,
    device: "monitor",
    title: "Lumenfall",
    kind: "Video game",
    summary: "A 2D action platformer with three levels, three bosses and enemies that read how you play. Built with a team.",
    stack: ["Three.js", "JavaScript", "ES modules"],
    github: "[REPO_URL_LUMENFALL]",
    demo: "[DEMO_URL_LUMENFALL]",
    media: "/projects/placeholder.svg",
    collaboration: true,
  },
  {
    slug: "cantrack",
    title: "CanTrack",
    kind: "Web",
    summary: "A dog-walking platform split into backend, frontend, AI and database repos, connected over a REST API.",
    stack: ["FastAPI", "Python", "Next.js", "PostgreSQL"],
    github: "https://github.com/nik129linux/cantrack-backend",
    media: "/projects/placeholder.svg",
  },
];
