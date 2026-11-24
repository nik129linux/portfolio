import type { Project } from "./types";
import retomaScreens from "@/public/projects/retoma/screens.json";
import acompanaScreens from "@/public/projects/acompana/screens.json";
import watchScreens from "@/public/projects/hand-hygiene-watch/screens.json";
import lumenfallScreens from "@/public/projects/lumenfall/screens.json";
import cantrackScreens from "@/public/projects/cantrack/screens.json";
import cotizaiaScreens from "@/public/projects/cotizaia/screens.json";

// Order matters: the 4 class projects first, then other work.
export const projects: Project[] = [
  {
    slug: "retoma",
    screens: retomaScreens,
    device: "laptop",
    title: "Retoma",
    kind: "Desktop",
    summary: "An Electron desktop app that helps you pick up where you left off, with a resume card, a Today timeline and a privacy tab. Suggestions come from on-device rules first, then local Ollama or Gemini when consent is given.",
    proof: ["AI wiring: the renderer never touches the network. Local Ollama or Gemini calls go through the Electron main process, only after per-mode consent and with a payload preview, and only a summary (minutes per app) leaves the device.", "Only app names and window titles are recorded, and history deletes after seven days.", "275-check acceptance suite and a tagged v1.0.0 Windows installer."],
    stack: ["Electron", "JavaScript", "Ollama", "Gemini", "CSS"],
    github: "https://github.com/nik129linux/handwatch-desktop-fe",
    demo: "https://retoma-desktop.acompana-mobile.workers.dev",
    download: "https://github.com/nik129linux/handwatch-desktop-fe/releases/tag/v1.0.0",
    media: "/projects/placeholder.svg",
  },
  {
    slug: "acompana",
    screens: acompanaScreens,
    device: "phone",
    title: "Acompaña",
    kind: "Mobile",
    summary: "A shift companion for nurses, patients and families: the shift plan, visit hours, and answers pulled from the shift data. Ships as a Capacitor Android app over a zero-dependency Node server that tries rules first and then Ollama.",
    proof: ["AI wiring: a zero-dependency client for local or cloud Ollama (gemma4:31b) or any OpenAI-compatible API, with Gemini as fallback. Any failure drops to deterministic rules, there is a daily cap on model calls, and the key lives outside the repo.", "GitHub Actions builds the Android APK and attaches it to a release on every version tag.", "AWS EC2 provisioned with Terraform, reachable over HTTPS with SSM only and no SSH."],
    stack: ["JavaScript", "Node.js", "Capacitor", "Ollama"],
    github: "https://github.com/nik129linux/acompana-mobile",
    demo: "https://acompana-mobile.acompana-mobile.workers.dev",
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
    proof: ["Infection control sees only anonymous unit totals; wrong marks are fixed with one tap.", "The backend answers its questions through Ollama only after consent."],
    stack: ["JavaScript", "Electron", "Ollama", "Java", "Wear OS"],
    github: "https://github.com/nik129linux/handwatch-smartwatch-fe",
    demo: "https://handwatch.acompana-mobile.workers.dev",
    media: "/projects/placeholder.svg",
  },
  {
    slug: "lumenfall",
    screens: lumenfallScreens,
    device: "monitor",
    title: "Lumenfall",
    kind: "Video game",
    summary: "A 2D action platformer with three levels, three bosses and enemies that read how you play. Built with a team.",
    proof: ["Built with two teammates: 130+ commits and a real merge history through pull requests.", "Smoke test drives title, cutscene, every level, boss and ending, and fails on any console error.", "Adaptive enemy AI covered by its own fairness gates."],
    stack: ["Three.js", "JavaScript", "ES modules"],
    github: "https://github.com/nik129linux/lumenfall",
    demo: "[DEMO_URL_LUMENFALL]",
    media: "/projects/placeholder.svg",
    collaboration: true,
  },
  {
    slug: "cantrack",
    screens: cantrackScreens,
    device: "phone",
    title: "CanTrack",
    kind: "Web",
    summary: "A dog-walking platform split into four repos: a FastAPI API on Supabase Postgres, a React PWA for owners and walkers, a schema with row-level security, and a vision check that confirms a dog is really in the check-in photo.",
    proof: ["CI runs the pytest suite and a dependency audit on every push, against a separate schema repo.", "17 documented attacks, each closed by a named regression test, with deny-all row-level security.", "AI wiring: an ordered chain of OpenAI-compatible providers (Gemini, then Groq, set by one env var). Any failure hands the call to the next, and the client never raises, so the app falls back to the plain flow. Keys are never logged.", "CLIP vision check on check-in photos, with an offline accuracy eval to calibrate the threshold.", "API ships as a non-root Docker image with health-checked deploys and a documented rollback."],
    stack: ["FastAPI", "Python", "React", "Vite", "Supabase", "PostgreSQL"],
    github: "https://github.com/nik129linux/cantrack-backend",
    demo: "https://d2p0dna7twnh6n.cloudfront.net/",
    media: "/projects/placeholder.svg",
  },
  {
    slug: "cotizaia",
    screens: cotizaiaScreens,
    device: "laptop",
    title: "CotizaIA",
    kind: "Web",
    summary: "An operations center for agencies. An agent turns a client brief into a priced proposal through a seven-stage pipeline (classify, extract, estimate, price, ambiguity check, documents, compose) and keeps the evidence of each stage. A React and Vite front end over a Java REST API.",
    proof: ["AI wiring: one LlmClient interface with Groq, Ollama Cloud, local Ollama and an offline stub behind a provider factory, wrapped in retry (honoring retry-after), a circuit breaker and a fallback. Embeddings use the same pattern with Voyage.", "RAG over an agency's past proposals: pgvector with Voyage embeddings, cosine retrieval, and every hour estimate carries its citations (document, page, similarity).", "Evaluated, not eyeballed: 9.5 h mean error against 21.0 h for a fixed catalog (55% lower) with real models, on a synthetic corpus of 30 proposals.", "Grounded drafts with numbered sources and a validator that rejects invented figures and uncited claims, with one retry and then a safe template.", "Live on Vercel in front of a live Java API, with strict CSP and HSTS headers, and cookie sessions with double-submit CSRF.", "590+ backend tests, and CI that runs the pgvector tests, gitleaks and a dependency scan."],
    stack: ["React", "Vite", "Tailwind CSS", "Framer Motion", "Java"],
    github: "https://github.com/GUERRREROALEXANDER/frontend-cotizaIA",
    demo: "https://frontend-cotizaia-swart.vercel.app",
    media: "/projects/placeholder.svg",
    collaboration: true,
  },
];
