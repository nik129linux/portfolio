import { test, expect, type Page } from "@playwright/test";
import { trackErrors, noHorizontalScroll } from "./helpers";

// Judge for the hero blob (spec 2026-11-22-loud-remix-design.md). DOM contract:
// section#home [data-testid="hero-blob"] data-mode="scene"|"list", data-ready after the first frame;
// [data-testid="hero-glow"] is the static radial fallback.

const blob = (page: Page) => page.getByTestId("hero-blob");
const zOf = (page: Page, sel: string) =>
  page.locator(sel).evaluate((e) => parseInt(getComputedStyle(e.closest("[data-layer]") ?? e).zIndex || "0", 10) || 0);

const noWebGL = () => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    if (/webgl/i.test(type)) return null;
    return (original as (t: string, ...r: unknown[]) => unknown).call(this, type, ...rest);
  } as typeof HTMLCanvasElement.prototype.getContext;
};

test("hero: desktop draws one blob canvas behind the portrait", async ({ page }) => {
  await page.goto("/");
  await expect(blob(page)).toHaveAttribute("data-mode", "scene");
  await expect(blob(page)).toHaveAttribute("data-ready", "", { timeout: 15_000 });
  await expect(page.locator("section#home canvas")).toHaveCount(1);
  expect(await zOf(page, '[data-testid="hero-blob"]')).toBeLessThan(await zOf(page, "section#home img[src*='photo-cutout']"));
  await expect(blob(page)).toHaveAttribute("aria-hidden", "true");
});

test("hero: the portrait has loaded before the blob canvas exists", async ({ page }) => {
  await page.addInitScript(() => {
    new MutationObserver((_, obs) => {
      const c = document.querySelector("section#home canvas");
      if (!c) return;
      const img = document.querySelector("section#home img[src*='photo-cutout']") as HTMLImageElement | null;
      (window as unknown as { __portraitFirst: boolean }).__portraitFirst = Boolean(img?.complete && img.naturalWidth > 0);
      obs.disconnect();
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/");
  await expect(blob(page)).toHaveAttribute("data-ready", "", { timeout: 15_000 });
  expect(await page.evaluate(() => (window as unknown as { __portraitFirst?: boolean }).__portraitFirst)).toBe(true);
});

test("hero: reduced motion keeps the static glow and no canvas", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(blob(page)).toHaveAttribute("data-gate", "resolved");
  await expect(blob(page)).toHaveAttribute("data-mode", "list");
  await expect(page.locator("section#home canvas")).toHaveCount(0);
  await expect(page.getByTestId("hero-glow")).toBeVisible();
  await ctx.close();
});

test("hero: 375px keeps the glow, no canvas, no horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(blob(page)).toHaveAttribute("data-gate", "resolved");
  await expect(blob(page)).toHaveAttribute("data-mode", "list");
  await expect(page.locator("section#home canvas")).toHaveCount(0);
  await expect(page.getByTestId("hero-glow")).toBeVisible();
  expect(await noHorizontalScroll(page)).toBe(true);
});

test("hero: without WebGL the glow stays and nothing errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.addInitScript(noWebGL);
  await page.goto("/");
  await expect(blob(page)).toHaveAttribute("data-gate", "resolved");
  await expect(blob(page)).toHaveAttribute("data-mode", "list");
  await expect(page.locator("section#home canvas")).toHaveCount(0);
  await expect(page.getByTestId("hero-glow")).toBeVisible();
  expect(errors).toEqual([]);
});

const translateX = (s: string) => parseFloat(s.split(" ")[0]) || 0;

test("hero: wordmark letters spread apart as the hero scrolls away", async ({ page }) => {
  await page.goto("/");
  const chars = page.locator('[data-testid="hero-wordmark"] .ch');
  expect(await chars.count()).toBe(7);
  const before = await chars.evaluateAll((els) => els.map((e) => getComputedStyle(e).translate));
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.5));
  await page.waitForTimeout(900);
  const after = await chars.evaluateAll((els) => els.map((e) => getComputedStyle(e).translate));
  expect(translateX(after[0]), "first letter moves left").toBeLessThan(translateX(before[0]) - 10);
  expect(translateX(after[6]), "last letter moves right").toBeGreaterThan(translateX(before[6]) + 10);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  const back = await chars.evaluateAll((els) => els.map((e) => getComputedStyle(e).translate));
  expect(Math.abs(translateX(back[0])), "reversible").toBeLessThan(2);
});

test("hero: reduced motion keeps the wordmark letters in place", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.5));
  await page.waitForTimeout(600);
  for (const t of await page.locator('[data-testid="hero-wordmark"] .ch').evaluateAll((els) => els.map((e) => getComputedStyle(e).translate))) {
    expect(t === "none" || Math.abs(translateX(t)) < 1).toBe(true);
  }
  await ctx.close();
});

test("hero: floating objects scatter outward on scroll", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  const xs = () => page.locator('section#home [data-testid="float-object"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().left + e.getBoundingClientRect().width / 2));
  const before = await xs();
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.5));
  await page.waitForTimeout(1200);
  const after = await xs();
  const mid = 1440 / 2;
  for (let i = 0; i < before.length; i++) {
    const outward = before[i] < mid ? before[i] - after[i] : after[i] - before[i];
    expect(outward, `object ${i} moves away from the centre`).toBeGreaterThan(15);
  }
});
