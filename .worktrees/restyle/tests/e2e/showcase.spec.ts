import { test, expect } from "@playwright/test";
import { trackErrors } from "./helpers";


async function toProgress(page: import("@playwright/test").Page, f: number) {
  await page.evaluate((frac) => {
    const s = document.querySelector('[data-testid="showcase"]') as HTMLElement;
    const top = s.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + (s.offsetHeight - window.innerHeight) * frac);
  }, f);
  await page.waitForTimeout(900);
}

test("showcase pins a stage while you scroll through it", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/lab/showcase");
  const sc = page.getByTestId("showcase").first();
  const h = await sc.evaluate((e) => (e as HTMLElement).offsetHeight);
  expect(h).toBeGreaterThan(2.5 * 900);
  await toProgress(page, 0.2);
  const a = await page.getByTestId("device").first().boundingBox();
  await toProgress(page, 0.6);
  const b = await page.getByTestId("device").first().boundingBox();
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(120); // pinned: barely moves on screen
  expect(errors).toEqual([]);
});

test("the device tilts in 3D and its screen steps through the screens, both reversible", async ({ page }) => {
  await page.goto("/lab/showcase");
  const dev = page.getByTestId("device").first();
  const active = () => page.getByTestId("showcase").first().locator('[data-screen][data-active="true"]').getAttribute("data-screen");
  const rot = () => dev.evaluate((e) => { const t = getComputedStyle(e).transform; const x = new DOMMatrix(t === "none" ? undefined : t); return [x.m13, x.m31, x.m23].map((v) => Math.round(v * 100)).join(","); });
  await toProgress(page, 0.05);
  const r0 = await rot(); const s0 = await active();
  await toProgress(page, 0.7);
  const r1 = await rot(); const s1 = await active();
  expect(r1).not.toBe(r0);
  expect(Number(s1)).toBeGreaterThan(Number(s0));
  await toProgress(page, 0.05);
  expect(await active()).toBe(s0);
});

test("the giant title moves behind the device", async ({ page }) => {
  await page.goto("/lab/showcase");
  const t = page.getByTestId("showcase-title").first();
  expect(await t.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(96);
  await toProgress(page, 0.1); const a = await t.boundingBox();
  await toProgress(page, 0.8); const b = await t.boundingBox();
  expect(Math.abs(a!.y - b!.y) + Math.abs(a!.x - b!.x)).toBeGreaterThan(60);
  const z = await page.evaluate(() => {
    const ti = document.querySelector('[data-testid="showcase-title"]')!, d = document.querySelector('[data-testid="device"]')!;
    return { title: Number(getComputedStyle(ti).zIndex) || 0, device: Number(getComputedStyle(d).zIndex) || 0 };
  });
  expect(z.device).toBeGreaterThan(z.title);
});

test("each device kind renders its own frame", async ({ page }) => {
  await page.goto("/lab/showcase");
  const kinds = await page.getByTestId("device").evaluateAll((ds) => ds.map((d) => d.getAttribute("data-device")));
  expect(new Set(kinds)).toEqual(new Set(["laptop", "phone", "watch", "monitor"]));
});

test("reduced motion: no tilt, first screen, no pin", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/lab/showcase");
  await toProgress(page, 0.6);
  const t = await page.getByTestId("device").first().evaluate((e) => getComputedStyle(e).transform);
  expect(t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
  expect(await page.getByTestId("showcase").first().locator('[data-screen][data-active="true"]').getAttribute("data-screen")).toBe("0");
  await ctx.close();
});

test("phone width: no horizontal overflow, screens still step", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("/lab/showcase");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await toProgress(page, 0.05);
  const a = await page.getByTestId("showcase").first().locator('[data-screen][data-active="true"]').getAttribute("data-screen");
  await toProgress(page, 0.75);
  const b = await page.getByTestId("showcase").first().locator('[data-screen][data-active="true"]').getAttribute("data-screen");
  expect(Number(b)).toBeGreaterThan(Number(a));
  await ctx.close();
});
