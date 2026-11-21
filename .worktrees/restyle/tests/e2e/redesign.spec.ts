import { test, expect, type Page } from "@playwright/test";
import { trackErrors } from "./helpers";

// Redesign 2026-10-25: three effects taken (as mechanisms) from verified teardowns.
// Projects: scroll-velocity skew (mathildedechiara). Hero: exit blur + rise (cartier).
// Nav: sliding highlight pill (recent.design).

async function skewDeg(page: Page) {
  // Largest |skewY| among velocity-skew elements, computed in the browser.
  return page.evaluate(() => {
    const els = [...document.querySelectorAll("[data-velocity-skew]")] as HTMLElement[];
    return Math.max(0, ...els.map((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return Math.abs((Math.atan2(m.b, m.a) * 180) / Math.PI);
    }));
  });
}

async function wheelBurst(page: Page) {
  // Real wheel input so the smooth scroller produces velocity; sample while it moves.
  let peak = 0;
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(40);
    peak = Math.max(peak, await skewDeg(page));
  }
  return peak;
}

async function toCards(page: Page) {
  await page.evaluate(() => {
    const card = document.querySelector('[data-testid="project-card"]') as HTMLElement;
    window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - 200);
  });
  await page.waitForTimeout(1200);
  await page.mouse.move(720, 450);
}

test.describe("projects: velocity skew", () => {
  test("project media skews while scrolling fast and settles flat when scrolling stops", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    expect(await page.locator("[data-velocity-skew]").count()).toBeGreaterThanOrEqual(2);
    await toCards(page);
    expect(await skewDeg(page)).toBeLessThan(0.1);
    const peak = await wheelBurst(page);
    expect(peak).toBeGreaterThan(0.5);
    expect(peak).toBeLessThanOrEqual(6); // subtle, never a wobble
    await page.waitForTimeout(1500);
    expect(await skewDeg(page)).toBeLessThan(0.1);
    expect(errors).toEqual([]);
  });

  test("reduced motion: project media never skews", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await toCards(page);
    expect(await wheelBurst(page)).toBeLessThan(0.1);
    await ctx.close();
  });
});

async function heroExit(page: Page) {
  return page.getByTestId("hero-exit").evaluate((el) => {
    const cs = getComputedStyle(el);
    const blur = Number((cs.filter.match(/blur\(([\d.]+)px\)/) ?? [0, 0])[1]);
    return { blur, y: new DOMMatrix(cs.transform).m42 };
  });
}

async function scrollHero(page: Page, frac: number) {
  await page.evaluate((f) => {
    const h = document.getElementById("home") as HTMLElement;
    window.scrollTo(0, h.offsetTop + h.offsetHeight * f);
  }, frac);
  await page.waitForTimeout(1000);
}

test.describe("hero: exit blur and rise", () => {
  test("the hero photo is sharp at rest, blurs and rises as the hero leaves, and reverses", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    const rest = await heroExit(page);
    expect(rest.blur).toBeLessThan(0.5);
    expect(Math.abs(rest.y)).toBeLessThan(2);
    await scrollHero(page, 0.7);
    const out = await heroExit(page);
    expect(out.blur).toBeGreaterThan(2);
    expect(out.blur).toBeLessThanOrEqual(12);
    expect(out.y).toBeLessThan(-10);
    await scrollHero(page, 0);
    const back = await heroExit(page);
    expect(back.blur).toBeLessThan(0.5);
    expect(errors).toEqual([]);
  });

  test("reduced motion: the hero photo never blurs", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await scrollHero(page, 0.7);
    expect((await heroExit(page)).blur).toBeLessThan(0.5);
    await ctx.close();
  });
});

async function pillCenterIn(page: Page, link: import("@playwright/test").Locator) {
  await page.waitForTimeout(600);
  const p = await page.getByTestId("nav-pill").boundingBox();
  const l = await link.boundingBox();
  const cx = p!.x + p!.width / 2;
  return cx >= l!.x && cx <= l!.x + l!.width && Math.abs(p!.width - l!.width) <= 8;
}

test.describe("nav: sliding highlight pill", () => {
  test("one pill follows the hovered link and returns to the active section", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Sections" });
    const links = nav.getByRole("link");
    expect(await page.getByTestId("nav-pill").count()).toBe(1);
    const n = await links.count();
    await links.nth(2).hover();
    expect(await pillCenterIn(page, links.nth(2))).toBe(true);
    await links.nth(n - 1).hover();
    expect(await pillCenterIn(page, links.nth(n - 1))).toBe(true);
    await page.mouse.move(720, 600);
    const active = nav.locator('[aria-current="true"]');
    expect(await pillCenterIn(page, active)).toBe(true);
    expect(errors).toEqual([]);
  });

  test("the pill moves by transform, not by left or width", async ({ page }) => {
    await page.goto("/");
    const links = page.getByRole("navigation", { name: "Sections" }).getByRole("link");
    await links.nth(2).hover();
    await page.waitForTimeout(60); // mid-animation
    const style = await page.getByTestId("nav-pill").evaluate((el) => (el as HTMLElement).style.cssText);
    expect(style).not.toMatch(/(^|;)\s*(left|width)\s*:/);
  });
});
