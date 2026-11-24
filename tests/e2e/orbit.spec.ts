import { test, expect, type Page } from "@playwright/test";
import { projects } from "../../data/projects";
import { noHorizontalScroll } from "./helpers";

const N = projects.length;
const LAST = N - 1;
const root = (page: Page) => page.getByTestId("project-orbit");
const ready = (page: Page) => expect(root(page)).toHaveAttribute("data-ready", "", { timeout: 15_000 });

// Progress p in [0, 1] along the tall track: p=0 puts the track top at the viewport top, p=1 its bottom.
const scrollToProgress = (page: Page, p: number) =>
  page.evaluate((prog) => {
    const track = document.querySelector('[data-testid="orbit-track"]') as HTMLElement;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + prog * (track.offsetHeight - window.innerHeight));
  }, p);

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
]) {
  test(`orbit: ${viewport.width}px is orbit mode, one canvas, six chips, no icons, no horizontal scroll`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(root(page)).toHaveAttribute("data-mode", "orbit");
    await ready(page);
    await expect(root(page).locator("canvas")).toHaveCount(1);
    const chips = page.locator('[data-testid="project-chips"] button[data-slug]');
    await expect(chips).toHaveCount(N);
    expect(await chips.evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")))).toEqual(projects.map((p) => p.slug));
    await expect(root(page).locator('img[src^="/3d/"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="project-list"]')).toHaveCount(0);
    await scrollToProgress(page, 0.5);
    await page.waitForTimeout(600);
    expect(await noHorizontalScroll(page)).toBe(true);
  });
}

test("orbit: draws within the budget (<= 100 draw calls)", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  // The scene stops drawing off screen, so bring it into view to get its 90th frame.
  await scrollToProgress(page, 0);
  await expect.poll(() => root(page).locator("canvas").first().getAttribute("data-calls"), { timeout: 15_000 }).not.toBeNull();
  expect(Number(await root(page).locator("canvas").first().getAttribute("data-calls"))).toBeLessThanOrEqual(100);
});

test("orbit: the front project follows the scroll, both ways, and the caption shows it", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  const front = (i: number) => projects[i].slug;
  // p = 0.5 would land exactly between two projects (2.5 of 5 steps), so aim at one project's own position.
  const mid = Math.round(0.5 * LAST);

  await scrollToProgress(page, 0);
  await expect(root(page)).toHaveAttribute("data-front", front(0), { timeout: 8000 });
  await scrollToProgress(page, mid / LAST);
  await expect(root(page)).toHaveAttribute("data-front", front(mid), { timeout: 8000 });
  await expect(page.getByTestId("orbit-caption")).toContainText(projects[mid].title);
  await scrollToProgress(page, 1);
  await expect(root(page)).toHaveAttribute("data-front", front(LAST), { timeout: 8000 });
  await expect(page.getByTestId("orbit-caption")).toContainText(projects[LAST].title);
  await scrollToProgress(page, 0);
  await expect(root(page)).toHaveAttribute("data-front", front(0), { timeout: 8000 });
});

test("orbit: the stage sticks for the whole track", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await scrollToProgress(page, 0.5);
  const stage = page.getByTestId("orbit-stage");
  await expect.poll(() => stage.evaluate((e) => Math.abs(e.getBoundingClientRect().top)), { timeout: 8000 }).toBeLessThanOrEqual(2);
  await expect.poll(() => stage.evaluate((e) => Math.abs(e.getBoundingClientRect().height - window.innerHeight)), { timeout: 8000 }).toBeLessThanOrEqual(2);
});

test("orbit: a chip turns the orbit to its project and opens the panel; closing keeps the orbit there", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  const target = projects[LAST - 1];
  const chip = page.locator(`[data-testid="project-chips"] button[data-slug="${target.slug}"]`);
  await scrollToProgress(page, 0);
  await chip.scrollIntoViewIfNeeded();
  await chip.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 3, name: target.title })).toBeVisible();
  await expect(root(page)).toHaveAttribute("data-front", target.slug, { timeout: 8000 });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  // The page moved to the project, so the orbit does not swing back to the start.
  await page.waitForTimeout(1500);
  await expect(root(page)).toHaveAttribute("data-front", target.slug);
});

// Review focus 1: no WebGL means the list, never a blank canvas.
test("orbit: without WebGL the section falls back to the list", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (/webgl/i.test(type)) return null;
      return (original as (t: string, ...r: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-mode", "list");
  await expect(root(page).locator("canvas")).toHaveCount(0);
  await expect(page.locator('[data-testid="project-list"] li[data-slug]')).toHaveCount(N);
});

// Review focus 2: crossing 768 while the page is open flips the mode both ways without leaking canvases.
test("orbit: resizing across 768px flips orbit -> list -> orbit with at most one canvas", async ({ page }) => {
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-mode", "orbit");
  await ready(page);
  await page.setViewportSize({ width: 600, height: 900 });
  await expect(root(page)).toHaveAttribute("data-mode", "list");
  await expect(root(page).locator("canvas")).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(root(page)).toHaveAttribute("data-mode", "orbit");
  await ready(page);
  expect(await root(page).locator("canvas").count()).toBeLessThanOrEqual(1);
  await expect(page.locator('[data-testid="project-chips"] button[data-slug]')).toHaveCount(N);
});

test("orbit: reduced motion uses the list and never loads a canvas", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(root(page)).toHaveAttribute("data-mode", "list");
  await expect(root(page).locator("canvas")).toHaveCount(0);
  await expect(page.locator('[data-testid="project-list"] li[data-slug]')).toHaveCount(N);
  await ctx.close();
});

// Review focus 5: slow screenshots must not block the controls or change the stage.
test("orbit: with slow textures the chips already work and the stage keeps its height", async ({ page }) => {
  await page.route("**/projects/**/*.webp", async (route) => {
    await new Promise((r) => setTimeout(r, 3500));
    await route.continue();
  });
  await page.goto("/");
  await ready(page);
  const stage = page.getByTestId("orbit-stage");
  await scrollToProgress(page, 0);
  expect(Math.abs((await stage.evaluate((e) => e.getBoundingClientRect().height)) - 900)).toBeLessThanOrEqual(2);
  const chip = page.locator(`[data-testid="project-chips"] button[data-slug="${projects[1].slug}"]`);
  await chip.scrollIntoViewIfNeeded();
  await chip.click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
