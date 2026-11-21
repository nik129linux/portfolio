import { test, expect } from "@playwright/test";
import { trackErrors } from "./helpers";

const SCRAMBLE = "Backend engineer who ships AI";

test("lab renders every motion component without console errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/lab");
  for (const id of ["scramble", "fly-apart", "blur-reveal", "tunnel"]) await expect(page.getByTestId(id).first()).toBeAttached();
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});

test("TextScramble settles on the exact text and exposes it to screen readers", async ({ page }) => {
  await page.goto("/lab");
  const el = page.getByTestId("scramble").first();
  await expect(el).toHaveAttribute("aria-label", SCRAMBLE);
  await expect(el).toHaveText(SCRAMBLE, { timeout: 2500 });
});

test("TextScramble is instant under reduced motion", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/lab");
  expect(await page.getByTestId("scramble").first().textContent()).toBe(SCRAMBLE);
  await ctx.close();
});

const moved = (t: string) => t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)";

test("FlyApartText: words at rest, then fly apart as the user scrolls past", async ({ page }) => {
  await page.goto("/lab");
  const block = page.getByTestId("fly-apart").first();
  await block.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -window.innerHeight / 3));
  await page.waitForTimeout(600);
  const words = block.locator("[data-word]");
  expect(await words.count()).toBeGreaterThan(2);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(1200);
  const after = await words.evaluateAll((ws) => ws.map((w) => getComputedStyle(w).transform));
  expect(after.some(moved)).toBe(true);
  expect(await block.textContent()).toContain("ship");
});

test("FlyApartText never transforms under reduced motion", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/lab");
  const block = page.getByTestId("fly-apart").first();
  await block.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(800);
  const t = await block.locator("[data-word]").evaluateAll((ws) => ws.map((w) => getComputedStyle(w).transform));
  expect(t.some(moved)).toBe(false);
  await ctx.close();
});

test("BlurReveal keeps a real heading and ends unblurred", async ({ page }) => {
  await page.goto("/lab");
  const el = page.getByTestId("blur-reveal").first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  expect(await el.evaluate((e) => e.tagName)).toMatch(/^H[1-3]$/);
  const filters = await el.locator("[data-word]").evaluateAll((ws) => ws.map((w) => getComputedStyle(w).filter));
  expect(filters.every((f) => f === "none" || f === "blur(0px)")).toBe(true);
});

test("Tunnel: one card per item, 3D on desktop, and it never traps the page scroll", async ({ page }) => {
  await page.goto("/lab");
  const tunnel = page.getByTestId("tunnel").first();
  await tunnel.scrollIntoViewIfNeeded();
  await expect(tunnel).toHaveAttribute("data-mode", "3d");
  await expect(tunnel.getByTestId("tunnel-card")).toHaveCount(5);
  const box = await tunnel.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  const y0 = await page.evaluate(() => window.scrollY);
  for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(40); }
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(y0 + 200);
});

test("Tunnel is a static, swipeable row on phones and under reduced motion", async ({ browser }) => {
  for (const opts of [{ viewport: { width: 375, height: 812 } }, { reducedMotion: "reduce" as const }]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    await page.goto("/lab");
    const tunnel = page.getByTestId("tunnel").first();
    await expect(tunnel).toHaveAttribute("data-mode", "static");
    await expect(tunnel.getByTestId("tunnel-card")).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await ctx.close();
  }
});

test("Tunnel cards are keyboard reachable", async ({ page }) => {
  await page.goto("/lab");
  const first = page.getByTestId("tunnel-card").first();
  const focusable = await first.evaluate((e) => e.matches("a,button,[tabindex]") || !!e.querySelector("a,button,[tabindex]"));
  expect(focusable).toBe(true);
});

test("Page transition: route change shows the wipe and lands on the new page", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/lab");
  await expect(page.getByTestId("page-transition")).toBeAttached();
  await page.getByRole("link", { name: /next page/i }).click();
  await expect(page).toHaveURL(/\/lab\/next$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 3000 });
  await page.waitForTimeout(1000);
  const overlayCovering = await page.getByTestId("page-transition").evaluate((e) => {
    const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
    return s.visibility !== "hidden" && s.opacity !== "0" && s.clipPath !== "inset(100% 0px 0px)" && r.height > window.innerHeight / 2 && s.pointerEvents !== "none";
  });
  expect(overlayCovering).toBe(false);
  expect(errors).toEqual([]);
});

test("home: no transition panel covers the page on first load", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1500);
  const covering = await page.getByTestId("page-transition").evaluate((e) => {
    const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
    const m = s.clipPath.match(/inset\(([\d.]+)%?\s+[\d.]+%?\s+([\d.]+)%?/);
    const visibleFraction = m ? 1 - (parseFloat(m[1]) + parseFloat(m[2])) / 100 : 1;
    return s.display !== "none" && s.visibility !== "hidden" && r.height > 0 && visibleFraction > 0.01;
  });
  expect(covering).toBe(false);
});

test("home: projects are pinned showcases that never capture the wheel", async ({ page }) => {
  await page.goto("/");
  const shows = page.locator('section#projects [data-testid="showcase"]');
  await expect(shows).toHaveCount(4);
  await expect(page.locator('section#projects [data-testid="tunnel"]')).toHaveCount(0);
  await shows.first().scrollIntoViewIfNeeded();
  const box = await shows.first().boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, 400);
  const y0 = await page.evaluate(() => window.scrollY);
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(80); }
  await page.waitForTimeout(900);
  expect(await page.evaluate(() => window.scrollY), "the page keeps scrolling through a showcase").toBeGreaterThan(y0 + 800);
});
