import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { projects } from "../../data/projects";

const SLUGS = ["retoma", "acompana", "hand-hygiene-watch", "lumenfall", "cantrack", "cotizaia"];
const bySlug = (slug: string) => projects.find((p) => p.slug === slug)!;

test("data: the six orbit projects in order, no linked-beats, no octree", () => {
  expect(projects.map((p) => p.slug)).toEqual(SLUGS);
});

test("data: every project has a first screen that exists on disk", () => {
  for (const p of projects) {
    expect(p.screens?.length, `${p.slug} has screens`).toBeGreaterThan(0);
    const file = path.join(process.cwd(), "public", p.screens![0].src);
    expect(fs.existsSync(file), `${p.slug}: ${p.screens![0].src}`).toBe(true);
    expect(fs.statSync(file).size, `${p.slug} first screen is not empty`).toBeGreaterThan(5_000);
  }
});

test("data: cantrack is a phone project and cotizaia a laptop one, three screens each", () => {
  expect(bySlug("cantrack").device).toBe("phone");
  expect(bySlug("cotizaia").device).toBe("laptop");
  for (const slug of ["cantrack", "cotizaia"]) {
    const p = bySlug(slug);
    expect(p.screens!.length, `${slug} screens`).toBe(3);
    for (const s of p.screens!) {
      expect(s.caption.length, `${slug} caption`).toBeGreaterThan(8);
      expect(fs.existsSync(path.join(process.cwd(), "public", s.src)), s.src).toBe(true);
    }
  }
});

test("data: cotizaia is a team project with its repo and live demo", () => {
  const p = bySlug("cotizaia");
  expect(p.collaboration).toBe(true);
  expect(p.github).toBe("https://github.com/GUERRREROALEXANDER/frontend-cotizaIA");
  expect(p.demo).toBe("https://frontend-cotizaia-swart.vercel.app/");
  expect(p.stack).toEqual(["React", "Vite", "Tailwind CSS", "Framer Motion", "Java"]);
});

test("data: no summary has an em dash and none is a placeholder", () => {
  for (const p of projects) {
    expect(p.summary, `${p.slug} summary`).not.toContain("—");
    expect(p.summary.startsWith("["), `${p.slug} summary placeholder`).toBe(false);
  }
});
