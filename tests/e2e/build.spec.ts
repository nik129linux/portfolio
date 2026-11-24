import { test, expect, type Page } from "@playwright/test";
import { profile } from "../../data/profile";
import { trackErrors, noHorizontalScroll } from "./helpers";

// Judge for the loud "What I build" chapter (spec 2026-11-22-loud-remix-design.md).
// DOM contract: section#build > [data-testid="build-chapter"] data-mode="scene"|"list";
// scene mode has [data-testid="build-track"] (tall) and [data-testid="build-stage"] (sticky);
// every group is an h3[data-group] with data-active="true" on the one in focus.

const chapter = (page: Page) => page.getByTestId("build-chapter");
const groups = profile.stack.map((g) => g.group);
const items = profile.stack.flatMap((g) => g.items);

const scrollToProgress = (page: Page, p: number) =>
  page.evaluate((prog) => {
    const track = document.querySelector('[data-testid="build-track"]') as HTMLElement;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + prog * (track.offsetHeight - window.innerHeight));
  }, p);

const activeGroup = (page: Page) =>
  page.locator('section#build h3[data-group][data-active="true"]').getAttribute("data-group");

const noWebGL = () => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    if (/webgl/i.test(type)) return null;
    return (original as (t: string, ...r: unknown[]) => unknown).call(this, type, ...rest);
  } as typeof HTMLCanvasElement.prototype.getContext;
};

test("build: four group headings from data, every stack item in the DOM, no numerals, no bars", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section#build");
  await expect(section.locator("h2")).toHaveCount(1);
  expect(await section.locator("h3[data-group]").evaluateAll((els) => els.map((e) => e.getAttribute("data-group")))).toEqual(groups);
  const text = (await section.textContent()) ?? "";
  for (const item of items) expect(text, `item ${item}`).toContain(item);
  expect(text).not.toMatch(/\b0[1-4]\b/);
  expect(text).not.toMatch(/\d+\s?%/);
  await expect(page.getByTestId("build-card")).toHaveCount(0);
  await expect(page.getByTestId("stack-icons")).toHaveCount(0);
  await expect(page.locator('[role="progressbar"], progress, meter')).toHaveCount(0);
});

test("build: the chapter is the accent colour and its headings are paper", async ({ page }) => {
  await page.goto("/");
  const c = await page.evaluate(() => {
    const probe = (v: string) => { const d = document.createElement("div"); d.style.color = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    const s = document.querySelector("section#build")!;
    return { accent: probe("--accent"), paper: probe("--paper"), bg: getComputedStyle(s).backgroundColor, h2: getComputedStyle(s.querySelector("h2")!).color, h3: getComputedStyle(s.querySelector("h3")!).color };
  });
  expect(c.bg).toBe(c.accent);
  expect(c.h2).toBe(c.paper);
  expect(c.h3).toBe(c.paper);
});

test("build: desktop pins the stage for the whole track and shows one canvas", async ({ page }) => {
  await page.goto("/");
  await expect(chapter(page)).toHaveAttribute("data-mode", "scene");
  await expect(chapter(page)).toHaveAttribute("data-ready", "", { timeout: 15_000 });
  await expect(chapter(page).locator("canvas")).toHaveCount(1);
  const stage = page.getByTestId("build-stage");
  for (const p of [0.05, 0.5, 0.95]) {
    await scrollToProgress(page, p);
    await page.waitForTimeout(250);
    const top = await stage.evaluate((e) => e.getBoundingClientRect().top);
    expect(Math.abs(top), `stage pinned at ${p}`).toBeLessThanOrEqual(2);
  }
});

test("build: the group in focus follows the scroll, both ways", async ({ page }) => {
  await page.goto("/");
  await expect(chapter(page)).toHaveAttribute("data-mode", "scene");
  await scrollToProgress(page, 0.05);
  await expect.poll(() => activeGroup(page)).toBe(groups[0]);
  await scrollToProgress(page, 0.95);
  await expect.poll(() => activeGroup(page)).toBe(groups[3]);
  await scrollToProgress(page, 0.4);
  await expect.poll(() => activeGroup(page)).toBe(groups[1]);
  await scrollToProgress(page, 0.05);
  await expect.poll(() => activeGroup(page)).toBe(groups[0]);
});

test("build: reduced motion shows four stacked groups with logos, no canvas, all readable", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(chapter(page)).toHaveAttribute("data-gate", "resolved");
  await expect(chapter(page)).toHaveAttribute("data-mode", "list");
  await expect(chapter(page).locator("canvas")).toHaveCount(0);
  for (const h of await page.locator("section#build h3[data-group]").all()) {
    expect(await h.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  }
  const logos = chapter(page).locator('img[src^="/icons/"]');
  expect(await logos.count()).toBeGreaterThanOrEqual(12);
  for (const img of await logos.all()) await expect(img).toHaveAttribute("alt", "");
  await ctx.close();
});

test("build: 375px is the stacked list, no canvas, no horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(chapter(page)).toHaveAttribute("data-gate", "resolved");
  await expect(chapter(page)).toHaveAttribute("data-mode", "list");
  await expect(chapter(page).locator("canvas")).toHaveCount(0);
  await page.locator("section#build").scrollIntoViewIfNeeded();
  expect(await noHorizontalScroll(page)).toBe(true);
});

test("build: without WebGL, the list and no console errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.addInitScript(noWebGL);
  await page.goto("/");
  await expect(chapter(page)).toHaveAttribute("data-gate", "resolved");
  await expect(chapter(page)).toHaveAttribute("data-mode", "list");
  await expect(chapter(page).locator("canvas")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("build: resizing 1440 -> 600 -> 1440 keeps at most one canvas in the chapter", async ({ page }) => {
  await page.goto("/");
  await expect(chapter(page)).toHaveAttribute("data-mode", "scene");
  await page.setViewportSize({ width: 600, height: 900 });
  await expect(chapter(page)).toHaveAttribute("data-gate", "resolved");
  await expect(chapter(page)).toHaveAttribute("data-mode", "list");
  await expect(chapter(page).locator("canvas")).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(chapter(page)).toHaveAttribute("data-mode", "scene");
  await expect(chapter(page)).toHaveAttribute("data-ready", "", { timeout: 15_000 });
  await expect(chapter(page).locator("canvas")).toHaveCount(1);
});

test("build: with the pinned chapter above it, the Projects nav link still lands on #projects", async ({ page }) => {
  await page.goto("/");
  await expect(chapter(page)).toHaveAttribute("data-mode", "scene");
  await page.locator("header nav").getByRole("link", { name: /projects/i }).first().click();
  const top = () => page.locator("section#projects").evaluate((e) => Math.round(e.getBoundingClientRect().top));
  await expect.poll(top, { timeout: 6000 }).toBeLessThanOrEqual(120);
  expect(await top()).toBeGreaterThanOrEqual(-10);
});

// Nico 2026-11-22: a slab was cut in half. The canvas ended at the 1500px container, and the cluster
// was placed in fixed scene units. The scene publishes how far out its widest visible slab reaches
// in clip space (data-max-ndc, 1 = the canvas edge).
for (const viewport of [{ width: 1920, height: 1080 }, { width: 1440, height: 900 }, { width: 1024, height: 768 }]) {
  test(`build: at ${viewport.width}px the stage spans the viewport and every slab stays inside it`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(chapter(page)).toHaveAttribute("data-ready", "", { timeout: 15_000 });
    const canvas = chapter(page).locator("canvas");
    for (const p of [0.12, 0.37, 0.62, 0.87]) {
      await scrollToProgress(page, p);
      await page.waitForTimeout(1600);
      const box = await canvas.evaluate((c) => { const r = c.getBoundingClientRect(); return { left: r.left, width: r.width, vw: document.documentElement.clientWidth }; });
      expect(Math.abs(box.left), "canvas starts at the viewport edge").toBeLessThanOrEqual(1);
      expect(Math.abs(box.width - box.vw), "canvas is full-bleed").toBeLessThanOrEqual(1);
      // Software WebGL under two workers can take a few seconds to settle: wait for a reading, same limits.
      const ndc = () => canvas.getAttribute("data-max-ndc").then(Number);
      await expect.poll(ndc, { message: `a settled slab at progress ${p}`, timeout: 10_000 }).toBeGreaterThan(0);
      await expect.poll(ndc, { message: `widest slab at progress ${p}`, timeout: 4_000 }).toBeLessThanOrEqual(0.97);
    }
  });
}

// Nico 2026-11-23: the AI layer names the coding agents he works with, each with its logo.
test("build: the AI group lists Claude Code and opencode with their logos", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  const ai = page.locator("section#build h3[data-group='AI']").locator("xpath=..");
  for (const name of ["Claude Code", "opencode"]) {
    const item = ai.locator("li", { hasText: name });
    await expect(item, name).toHaveCount(1);
    const img = item.locator("img");
    await expect(img, `${name} logo`).toHaveCount(1);
    expect(await img.evaluate((e) => (e as HTMLImageElement).naturalWidth), `${name} logo loads`).toBeGreaterThan(0);
  }
  await ctx.close();
});
