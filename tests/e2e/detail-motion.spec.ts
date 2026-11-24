import { test, expect, type Page } from "@playwright/test";
import { projects } from "../../data/projects";

// Nico 2026-11-22: opening a project "looks horrendous how it pops". The panel now grows out of the
// chip that opened it and shrinks back into it; reduced motion skips the movement.

const chip = (page: Page, slug: string) => page.locator(`[data-testid="project-chips"] button[data-slug="${slug}"]`);
const ready = async (page: Page) => {
  await page.goto("/");
  const root = page.getByTestId("project-orbit");
  await expect(root).toHaveAttribute("data-ready", "", { timeout: 15_000 });
  await chip(page, projects[0].slug).scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
};

// Clicks and samples the panel a few frames later, inside the page, so the sample is not late.
const clickAndSample = (page: Page, slug: string, ms: number) =>
  page.evaluate(
    ([s, wait]) =>
      new Promise<{ opacity: number; scale: number } | null>((resolve) => {
        (document.querySelector(`[data-testid="project-chips"] button[data-slug="${s}"]`) as HTMLButtonElement).click();
        setTimeout(() => {
          const el = document.querySelector('[data-testid="project-detail"]') as HTMLElement | null;
          if (!el) return resolve(null);
          const cs = getComputedStyle(el);
          const m = new DOMMatrix(cs.transform === "none" ? undefined : cs.transform);
          resolve({ opacity: Number(cs.opacity), scale: m.a });
        }, wait as number);
      }),
    [slug, ms] as const,
  );

test("detail: opening grows the panel in, then it settles fully opaque at full size", async ({ page }) => {
  await ready(page);
  const early = await clickAndSample(page, projects[1].slug, 70);
  expect(early, "panel mounted").not.toBeNull();
  expect(early!.opacity < 0.95 || early!.scale < 0.97, `mid-animation ${JSON.stringify(early)}`).toBe(true);
  const panel = page.getByTestId("project-detail");
  await expect.poll(() => panel.evaluate((e) => Number(getComputedStyle(e).opacity))).toBe(1);
  await expect.poll(() => panel.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform === "none" ? undefined : getComputedStyle(e).transform).a)).toBeCloseTo(1, 2);
});

test("detail: the panel grows from the chip that opened it", async ({ page }) => {
  await ready(page);
  const c = await chip(page, projects[2].slug).boundingBox();
  await chip(page, projects[2].slug).click();
  const panel = page.getByTestId("project-detail");
  await expect.poll(() => panel.evaluate((e) => Number(getComputedStyle(e).opacity))).toBe(1);
  const origin = await panel.evaluate((e) => {
    const r = e.getBoundingClientRect();
    const [x, y] = getComputedStyle(e).transformOrigin.split(" ").map(parseFloat);
    return { x: r.left + x, y: r.top + y };
  });
  expect(Math.abs(origin.x - (c!.x + c!.width / 2))).toBeLessThanOrEqual(6);
  expect(Math.abs(origin.y - (c!.y + c!.height / 2))).toBeLessThanOrEqual(6);
});

test("detail: closing animates out before the dialog leaves the page", async ({ page }) => {
  await ready(page);
  await chip(page, projects[0].slug).click();
  const panel = page.getByTestId("project-detail");
  await expect.poll(() => panel.evaluate((e) => Number(getComputedStyle(e).opacity))).toBe(1);
  const mid = await page.evaluate(
    () =>
      new Promise<number | null>((resolve) => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        setTimeout(() => {
          const el = document.querySelector('[data-testid="project-detail"]') as HTMLElement | null;
          resolve(el ? Number(getComputedStyle(el).opacity) : null);
        }, 150); // mid-exit: the 320 ms ease-in-out has barely moved at 60 ms
      }),
  );
  expect(mid, "still on the page, fading").not.toBeNull();
  expect(mid!).toBeLessThan(1);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("detail: reduced motion opens fully visible at once", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 800 } });
  const page = await ctx.newPage();
  await page.goto("/");
  const sample = await page.evaluate(
    () =>
      new Promise<number | null>((resolve) => {
        (document.querySelector('[data-testid="project-list"] [data-slug] button') as HTMLButtonElement).click();
        setTimeout(() => {
          const el = document.querySelector('[data-testid="project-detail"]') as HTMLElement | null;
          resolve(el ? Number(getComputedStyle(el).opacity) : null);
        }, 60);
      }),
  );
  expect(sample).toBe(1);
  await ctx.close();
});
