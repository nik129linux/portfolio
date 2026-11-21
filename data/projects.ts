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
    summary: "An Electron desktop app that helps you pick up where you left off, with a resume card, a Today timeline and a privacy tab. Suggestions come from on-device rules first, then local Ollama or Gemini when consent is given.",
    stack: ["Electron", "JavaScript", "Ollama", "Gemini", "CSS"],
    github: "https://github.com/nik129linux/handwatch-desktop-fe",
    download: "[RELEASE_URL_RETOMA]",
    media: "/projects/placeholder.svg",
  },
  {
    slug: "acompana",
    screens: acompanaScreens,
    device: "phone",
    title: "Acompaña",
    kind: "Mobile",
    summary: "A shift companion for nurses, patients and families: the shift plan, visit hours, and answers pulled from the shift data. Ships as a Capacitor Android app over a zero-dependency Node server that tries rules first and then Ollama.",
    stack: ["JavaScript", "Node.js", "Capacitor", "Ollama"],
    github: "https://github.com/nik129linux/acompana-mobile",
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
    summary: "A hospital hand-hygiene smartwatch that reminds and records in silence and lets one tap fix a wrong mark. Infection control only sees anonymous unit totals, and an Electron backend answers its questions through Ollama after consent.",
    stack: ["JavaScript", "Electron", "Ollama", "Java", "Wear OS"],
    github: "https://github.com/nik129linux/handwatch-smartwatch-fe",
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
    summary: "A dog-walking platform split into four repos: a FastAPI API on Supabase Postgres, a React PWA for owners and walkers, a schema with row-level security, and a vision check that confirms a dog is really in the check-in photo.",
    stack: ["FastAPI", "Python", "React", "Vite", "Supabase", "PostgreSQL"],
    github: "https://github.com/nik129linux/cantrack-backend",
    media: "/projects/placeholder.svg",
  },
  {
    slug: "linked-beats",
    title: "Linked Beats",
    kind: "Web",
    summary: "A browser music player where every playlist is a hand-written doubly linked list, so prev and next move through real node pointers. Songs load from local files at runtime and play through a single audio element with a canvas visualizer.",
    stack: ["TypeScript", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/nik129linux/linked-beats",
    demo: "https://linked-beats-sooty.vercel.app",
    media: "/projects/placeholder.svg",
  },
  {
    slug: "octree",
    title: "octree",
    kind: "Tool",
    summary: "A live terminal UI that shows delegated opencode sessions orbiting Claude, polling the opencode SQLite database every 500 ms. Enter on a node opens its live log, and review badges or agent-to-agent handoffs draw on the tree.",
    stack: ["Python", "Textual", "Rich", "SQLite"],
    github: "https://github.com/nik129linux/octree",
    media: "/projects/placeholder.svg",
  },
];
