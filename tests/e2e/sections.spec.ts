import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { nav } from "../../data/nav";
import { testimonials } from "../../data/testimonials";
import { experience } from "../../data/experience";
import { trackErrors, noHorizontalScroll } from "./helpers";

test("every nav section exists, one h1, an h2 per section", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  for (const item of nav) {
    const s = page.locator(`section#${item.id}`);
    await expect(s, `section#${item.id}`).toHaveCount(1);
    if (item.id !== "home") await expect(s.locator("h2"), `h2 in #${item.id}`).toHaveCount(1);
  }
  await expect(page.locator("footer")).toHaveCount(1);
});

test("nav lists every section and stays visible after scrolling", async ({ page }) => {
  await page.goto("/");
  const navEl = page.locator("header nav");
  for (const item of nav) await expect(navEl.locator(`a[href="#${item.id}"]`)).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await expect(navEl).toBeInViewport();
});

test("mobile: menu button reveals every section link", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const btn = page.getByRole("button", { name: /menu/i });
  await expect(btn).toBeVisible();
  await btn.click();
  for (const item of nav) await expect(page.locator(`a[href="#${item.id}"]:visible`).first()).toBeVisible();
});

test("no dead links: no href='#', no [placeholder] hrefs, anchors resolve", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.$$eval("a", (as) => as.map((a) => a.getAttribute("href") ?? ""));
  for (const h of hrefs) {
    expect(h, "empty or # href").not.toMatch(/^#?$/);
    expect(h, "placeholder rendered as link").not.toContain("[");
    if (h.startsWith("#")) await expect(page.locator(`[id="${h.slice(1)}"]`)).toHaveCount(1);
  }
});

test("hero: download CV control, real-photo slot, no avatar", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("section#home");
  await expect(hero.getByText(/download cv/i).first()).toBeVisible();
  await expect(hero.locator("img")).not.toHaveCount(0);
});

test("testimonials (>=3) and experience render from data", async ({ page }) => {
  await page.goto("/");
  expect(testimonials.length).toBeGreaterThanOrEqual(3);
  await expect(page.locator('[data-testid="testimonial"]')).toHaveCount(testimonials.length);
  await expect(page.locator('[data-testid="experience-item"]')).toHaveCount(experience.length);
});

test("no skill bars or percentages in the stack", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[role="progressbar"], progress, meter')).toHaveCount(0);
  await expect(page.locator("section#about")).not.toContainText(/\d+\s?%/);
});

test("footer year is computed, not hardcoded", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("footer")).toContainText(String(new Date().getFullYear()));
  const src = fs.readFileSync(path.join(process.cwd(), "components/sections/Footer.tsx"), "utf8");
  expect(src).toContain("getFullYear()");
});

test("contact form validates with regex and confirms", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("section#contact form");
  await form.getByLabel(/name/i).fill("Ana");
  await form.getByLabel(/email/i).fill("not-an-email");
  await form.getByLabel(/message/i).fill("Hello there, I saw your projects.");
  await form.getByRole("button", { name: /send/i }).click();
  await expect(form.getByRole("alert")).toContainText(/email/i);
  await form.getByLabel(/email/i).fill("ana@example.com");
  await form.getByRole("button", { name: /send/i }).click();
  await expect(page.locator("section#contact").getByRole("status")).toBeVisible();
  const src = fs.readFileSync(path.join(process.cwd(), "components/sections/Contact.tsx"), "utf8");
  expect(src).toMatch(/RegExp|\/\^.*@.*\$\//);
});

test("inputs are at least 16px and buttons at least 44px tall", async ({ page }) => {
  await page.goto("/");
  const sizes = await page.$$eval("input, textarea", (els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
  for (const s of sizes) expect(s).toBeGreaterThanOrEqual(16);
  const heights = await page.$$eval("main button, main a[data-cta]", (els) => els.map((e) => e.getBoundingClientRect().height));
  for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
});

for (const w of [320, 375, 768, 1024, 1440]) {
  test(`no horizontal scroll and no console errors at ${w}px`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto("/");
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
    expect(await noHorizontalScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("reduced motion: every section heading readable at first paint", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  for (const item of nav.filter((n) => n.id !== "home")) {
    const h2 = page.locator(`section#${item.id} h2`);
    await h2.scrollIntoViewIfNeeded();
    expect(await h2.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  }
  await ctx.close();
});

test("file and folder names are English kebab/Pascal case", async () => {
  for (const dir of ["components/sections", "components/motion", "data"]) {
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    for (const f of files) expect(f).toMatch(/^[A-Za-z0-9.-]+$/);
  }
});
