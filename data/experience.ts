import type { ExperienceItem } from "./types";

export const experience: ExperienceItem[] = [
  { type: "academic", title: "Software Engineering", place: "Universidad Cooperativa de Colombia", start: "2025", end: "Present", detail: "6th semester. Backend and AI integration.", projects: ["hand-hygiene-watch", "lumenfall"] },
  { type: "work", title: "Desktop app developer", place: "Personal project", start: "2026-09", end: "2026-10", detail: "Electron companion that offers one resume card after an interruption. Only app names and titles are recorded, history deletes after seven days, and any AI call needs consent.", projects: ["retoma"] },
  { type: "work", title: "Freelance developer", place: "Independent projects", start: "2026-10", end: "2026-11", detail: "CanTrack, CotizaIA and Acompaña: APIs, PWAs and AI integration.", projects: ["cantrack", "cotizaia", "acompana"] },
];
