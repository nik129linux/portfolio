import { test, expect } from "@playwright/test";
import { projects } from "../../data/projects";
import { noHorizontalScroll } from "./helpers";

// Judge for the screen field (spec 2026-11-22-screen-field-design.md). The orbit's DOM contract stays
// (orbit.spec.ts); this file checks what changed: the look and what was removed.

const root = (page: import("@playwright/test").Page) => page.getByTestId("project-orbit");
const totalScreens = projects.reduce((n, p) => n + (p.screens?.length ?? 0), 0);

test("projects: the section opens on the accent and fades to a light tone", async ({ page }) => {
  await page.goto("/");
  const { bg, accent, paper } = await page.evaluate(() => {
    const probe = (v: string) => { const d = document.createElement("div"); d.style.color = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    return { bg: getComputedStyle(document.querySelector("section#projects")!).backgroundImage, accent: probe("--accent"), paper: probe("--paper-2") };
  });
  expect(bg).toContain("linear-gradient");
  expect(bg.indexOf(accent), "starts on the accent").toBeGreaterThan(-1);
  expect(bg.indexOf(paper), "ends on near-white").toBeGreaterThan(bg.indexOf(accent));
});

test("field: one canvas with a plane per screenshot on the grain background, no device frames or core", async ({ page }) => {
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-ready", "", { timeout: 15_000 });
  const canvas = root(page).locator("canvas");
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute("data-screens", String(totalScreens));
  await expect(canvas).toHaveAttribute("data-bg", "grain");
  await expect(canvas).not.toHaveAttribute("data-devices", /.+/);
});

test("field: scrolling fast never causes horizontal scroll or console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-ready", "", { timeout: 15_000 });
  await page.evaluate(async () => {
    const t = document.querySelector('[data-testid="orbit-track"]') as HTMLElement;
    const top = t.getBoundingClientRect().top + scrollY;
    for (let i = 0; i <= 10; i++) { window.scrollTo(0, top + (i / 10) * (t.offsetHeight - innerHeight)); await new Promise((r) => setTimeout(r, 60)); }
  });
  await page.waitForTimeout(800);
  expect(await noHorizontalScroll(page)).toBe(true);
  expect(errors).toEqual([]);
});

test("the left-gutter trail is gone", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("backend-thread")).toHaveCount(0);
  await expect(page.locator("[data-thread-node]")).toHaveCount(0);
});

// Nico 2026-11-23: the field "cut to the next phase" as a hard block. Its edges now dissolve into the
// section behind it (a vertical mask), so no straight seam shows above or below the screens.
test("field: the stage fades in at the top and out at the bottom, no hard edge", async ({ page }) => {
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-mode", "orbit");
  const mask = await page.locator(".orbit-canvas").evaluate((e) => {
    const s = getComputedStyle(e);
    return s.maskImage || s.getPropertyValue("-webkit-mask-image");
  });
  expect(mask).toContain("linear-gradient");
  const stops = mask.match(/(transparent|rgba\(0, 0, 0, 0\))/g) ?? [];
  expect(stops.length, `transparent at both ends: ${mask}`).toBeGreaterThanOrEqual(2);
});
