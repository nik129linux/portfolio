import { test, expect, type Page } from "@playwright/test";
import { projects } from "../../data/projects";

// Phone width = list mode: rows with a button that opens the detail panel (DOM contract in the plan).
test.use({ viewport: { width: 390, height: 800 } });

const row = (page: Page, slug: string) => page.locator(`[data-testid="project-list"] [data-slug="${slug}"]`);
const open = async (page: Page, slug: string) => {
  await row(page, slug).getByRole("button").click();
  await expect(page.getByRole("dialog")).toBeVisible();
};
const bySlug = (slug: string) => projects.find((p) => p.slug === slug)!;

test("detail: list mode shows one row per project and the row opens a dialog with its title and links", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-testid="project-orbit"]')).toHaveAttribute("data-mode", "list");
  await expect(page.locator('[data-testid="project-list"] [data-slug]')).toHaveCount(projects.length);

  await open(page, "cantrack");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog.getByRole("heading", { level: 3, name: "CanTrack" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /github/i })).toHaveAttribute("href", bySlug("cantrack").github);
  await expect(dialog.getByText(/team project/i)).toHaveCount(0);
});

test("detail: a team project says so and links its live demo", async ({ page }) => {
  await page.goto("/");
  await open(page, "cotizaia");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/team project/i)).toBeVisible();
  await expect(dialog.getByRole("link", { name: /live demo/i })).toHaveAttribute("href", "https://frontend-cotizaia-swart.vercel.app/");
});

test("detail: a project with only placeholder links shows no link and no bracket text", async ({ page }) => {
  await page.goto("/");
  await open(page, "lumenfall");
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator("a")).toHaveCount(0);
  expect(await dialog.innerText()).not.toContain("[");
});

test("detail: first screen has a real alt, summary and stack come from the data", async ({ page }) => {
  await page.goto("/");
  await open(page, "retoma");
  const dialog = page.getByRole("dialog");
  const first = dialog.locator("img").first();
  expect((await first.getAttribute("alt"))!.length).toBeGreaterThan(5);
  expect(await first.getAttribute("src")).toBe(bySlug("retoma").screens![0].src);
  await expect(dialog.getByText(bySlug("retoma").summary.slice(0, 40))).toBeVisible();
  for (const tech of bySlug("retoma").stack) await expect(dialog.getByText(tech, { exact: true }).first()).toBeVisible();
});

test("detail: Esc closes it and focus returns to the row's button", async ({ page }) => {
  await page.goto("/");
  await open(page, "acompana");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const slug = await page.evaluate(() => document.activeElement?.closest("[data-slug]")?.getAttribute("data-slug") ?? null);
  expect(slug).toBe("acompana");
});

test("detail: Tab never leaves the open dialog", async ({ page }) => {
  await page.goto("/");
  await open(page, "cotizaia");
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await page.getByRole("dialog").evaluate((d) => d.contains(document.activeElement)), `tab #${i + 1}`).toBe(true);
  }
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Shift+Tab");
    expect(await page.getByRole("dialog").evaluate((d) => d.contains(document.activeElement)), `shift+tab #${i + 1}`).toBe(true);
  }
});

test("detail: the page behind does not scroll while the dialog is open, and does again after", async ({ page }) => {
  await page.goto("/");
  await row(page, "retoma").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await open(page, "retoma");
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(8, 400); // over the backdrop, not the panel
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(900);
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(1);
  await page.keyboard.press("Escape");
  await page.mouse.wheel(0, 700);
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 6000 }).toBeGreaterThan(before + 100);
});
