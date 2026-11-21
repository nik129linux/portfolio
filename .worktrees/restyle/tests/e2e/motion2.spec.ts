import { test, expect } from "@playwright/test";
import { trackErrors } from "./helpers";
import { projects } from "../../data/projects";

const moved = (t: string) => t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)";
const insetTop = (c: string) => { const m = c.match(/inset\(([\d.]+)/); return m ? parseFloat(m[1]) : 0; };

async function reducedPage(browser: import("@playwright/test").Browser, url: string) {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage(); await page.goto(url); return { ctx, page };
}

// ---- part 1: /lab/m1 ----
test("m1 renders without console errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/lab/m1");
  for (const id of ["portal", "tunnel", "parallax"]) await expect(page.getByTestId(id).first()).toBeAttached();
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test("Portal: the card window opens to full bleed as you scroll", async ({ page }) => {
  await page.goto("/lab/m1");
  const win = page.getByTestId("portal-window").first();
  await page.getByTestId("portal").first().scrollIntoViewIfNeeded();
  const a = insetTop(await win.evaluate((e) => getComputedStyle(e).clipPath));
  expect(a).toBeGreaterThan(10);
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 200); await page.waitForTimeout(60); }
  await page.waitForTimeout(900);
  expect(insetTop(await win.evaluate((e) => getComputedStyle(e).clipPath))).toBeLessThan(a - 5);
});

test("Portal shows its end state under reduced motion", async ({ browser }) => {
  const { ctx, page } = await reducedPage(browser, "/lab/m1");
  expect(insetTop(await page.getByTestId("portal-window").first().evaluate((e) => getComputedStyle(e).clipPath))).toBeLessThanOrEqual(1);
  await ctx.close();
});

test("Tunnel: giant title + counter follow the card in front", async ({ page }) => {
  await page.goto("/lab/m1");
  const tunnel = page.getByTestId("tunnel").first();
  await tunnel.scrollIntoViewIfNeeded();
  const counter = tunnel.getByTestId("tunnel-counter");
  const title = tunnel.getByTestId("tunnel-title");
  await expect(counter).toHaveText(/^0?1\s*\/\s*0?5$/);
  expect(projects.map((p) => p.title)).toContain((await title.textContent())?.trim());
  const box = await tunnel.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, 150); await page.waitForTimeout(60); }
  await page.waitForTimeout(900);
  await expect(counter).not.toHaveText(/^0?1\s*\//);
  const size = await title.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  expect(size).toBeGreaterThanOrEqual(96);
  const prevented = await tunnel.evaluate((s) => { const e = new WheelEvent("wheel", { deltaY: 30, cancelable: true, bubbles: true }); s.dispatchEvent(e); return e.defaultPrevented; });
  expect(prevented).toBe(true);
});

test("Parallax layers move at different speeds", async ({ page }) => {
  await page.goto("/lab/m1");
  const layers = page.getByTestId("parallax").first().locator("[data-speed]");
  expect(await layers.count()).toBeGreaterThanOrEqual(2);
  await page.getByTestId("parallax").first().scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 500); await page.waitForTimeout(900);
  const ys = await layers.evaluateAll((ls) => ls.map((l) => new DOMMatrix(getComputedStyle(l).transform).m42));
  expect(new Set(ys.map((y) => Math.round(y))).size).toBeGreaterThanOrEqual(2);
});

test("Parallax is still under reduced motion", async ({ browser }) => {
  const { ctx, page } = await reducedPage(browser, "/lab/m1");
  await page.mouse.wheel(0, 800); await page.waitForTimeout(600);
  const t = await page.getByTestId("parallax").first().locator("[data-speed]").evaluateAll((ls) => ls.map((l) => getComputedStyle(l).transform));
  expect(t.some(moved)).toBe(false);
  await ctx.close();
});

// ---- part 2: /lab/m2 ----
test("m2 renders without console errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/lab/m2");
  for (const id of ["scrub-heading", "marquee", "drum"]) await expect(page.getByTestId(id).first()).toBeAttached();
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test("ScrubHeading: a real heading whose words rise with the scroll (scrubbed, reversible)", async ({ page }) => {
  await page.goto("/lab/m2");
  const h = page.getByTestId("scrub-heading").first();
  expect(await h.evaluate((e) => e.tagName)).toBe("H2");
  await h.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -window.innerHeight * 0.6));
  await page.waitForTimeout(600);
  const y = () => h.locator("[data-word]").first().evaluate((w) => new DOMMatrix(getComputedStyle(w).transform).m42);
  const start = await y();
  await page.mouse.wheel(0, 400); await page.waitForTimeout(800);
  const mid = await y();
  expect(mid).toBeLessThan(start);
  await page.mouse.wheel(0, -400); await page.waitForTimeout(800);
  expect(await y()).toBeGreaterThan(mid);
});

test("Marquee loops by itself and keeps one accessible copy", async ({ page }) => {
  await page.goto("/lab/m2");
  const track = page.getByTestId("marquee-track").first();
  const x = () => track.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m41);
  const a = await x(); await page.waitForTimeout(700);
  expect(await x()).not.toBe(a);
  expect(await page.getByTestId("marquee").first().locator('[aria-hidden="true"]').count()).toBeGreaterThanOrEqual(1);
});

test("Marquee is static under reduced motion", async ({ browser }) => {
  const { ctx, page } = await reducedPage(browser, "/lab/m2");
  const track = page.getByTestId("marquee-track").first();
  const a = await track.evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(700);
  expect(await track.evaluate((e) => getComputedStyle(e).transform)).toBe(a);
  await ctx.close();
});

test("DrumWheel: wheel rolls the cylinder, front item changes, never traps the page", async ({ page }) => {
  await page.goto("/lab/m2");
  const drum = page.getByTestId("drum").first();
  await drum.scrollIntoViewIfNeeded();
  await expect(drum).toHaveAttribute("data-mode", "3d");
  await expect(drum.getByTestId("drum-item")).toHaveCount(projects.length);
  const active = () => drum.locator('[data-testid="drum-item"][data-active="true"]').getAttribute("data-slug");
  const first = await active();
  const box = await drum.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, 250); await page.waitForTimeout(900);
  expect(await active()).not.toBe(first);
  const y0 = await page.evaluate(() => window.scrollY);
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(40); }
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(y0 + 200);
});

test("DrumWheel is a plain list on phones and under reduced motion", async ({ browser }) => {
  for (const opts of [{ viewport: { width: 375, height: 812 } }, { reducedMotion: "reduce" as const }]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage(); await page.goto("/lab/m2");
    await expect(page.getByTestId("drum").first()).toHaveAttribute("data-mode", "static");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await ctx.close();
  }
});
