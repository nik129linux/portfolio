import { test, expect } from "@playwright/test";
import { profile } from "../../data/profile";

test("footer back to top scrolls the page to the top", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.getByRole("link", { name: /back to top/i }).click();
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 10000 })
    .toBeLessThan(5);
});

test("footer back to top is a 44px link to #top, a real element at y=0", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /back to top/i });
  await expect(link).toHaveAttribute("href", "#top");
  expect(await page.locator("#top").evaluate((e) => e.getBoundingClientRect().top + window.scrollY)).toBe(0);
  const box = await link.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

test("hero CV anchor follows profile.cvUrl", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("section#home");
  if (profile.cvUrl.startsWith("[")) {
    await expect(hero.getByRole("link", { name: /download cv/i })).toHaveCount(0);
    await expect(hero.getByRole("button", { name: /download cv/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  } else {
    const cv = hero.getByRole("link", { name: /download cv/i });
    await expect(cv).toHaveAttribute("download", "");
    await expect(cv).toHaveAttribute("href", profile.cvUrl);
  }
});
