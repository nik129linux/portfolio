import { test, expect } from "@playwright/test";
import { projects } from "../../data/projects";

const withScreens = projects.filter((p) => p.screens && p.screens.length >= 4);

test("the four class projects have clean screens", () => {
  expect(withScreens.map((p) => p.slug).sort()).toEqual(["acompana", "hand-hygiene-watch", "lumenfall", "retoma"]);
});

test("card screen changes as you scroll, and walks back when you scroll up", async ({ page }) => {
  await page.goto("/");
  const slug = withScreens[0].slug;
  const card = page.locator(`[data-testid="project-card"][data-slug="${slug}"]`);
  const active = () => card.locator('[data-screen][data-active="true"]').getAttribute("data-screen");
  await card.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.85));
  await page.waitForTimeout(700);
  const first = await active();
  const cap1 = await card.getByTestId("screen-caption").textContent();
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 150); await page.waitForTimeout(120); }
  await page.waitForTimeout(800);
  const later = await active();
  expect(Number(later)).toBeGreaterThan(Number(first));
  expect(await card.getByTestId("screen-caption").textContent()).not.toBe(cap1);
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, -150); await page.waitForTimeout(120); }
  await page.waitForTimeout(800);
  expect(Number(await active())).toBeLessThan(Number(later));
  // exactly one visible screen, no zoom on it
  const visible = await card.locator("[data-screen]").evaluateAll((ims) => ims.filter((i) => getComputedStyle(i).opacity === "1").map((i) => getComputedStyle(i).transform));
  expect(visible.length).toBe(1);
  expect(visible[0] === "none" || visible[0] === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
});

test("reduced motion keeps the first screen", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  const card = page.locator(`[data-testid="project-card"][data-slug="${withScreens[0].slug}"]`);
  await card.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400); await page.waitForTimeout(700);
  expect(await card.locator('[data-screen][data-active="true"]').getAttribute("data-screen")).toBe("0");
  await ctx.close();
});
