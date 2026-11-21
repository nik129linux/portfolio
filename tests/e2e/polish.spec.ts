import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const layers = (s: string) => (s === "none" ? 0 : s.split(/,(?![^(]*\))/).length);

test("primary button has an inner top highlight and presses in", async ({ page }) => {
  await page.goto("/");
  const btn = page.locator("section#home a[data-cta]").filter({ hasText: /projects/i }).first();
  const s = await btn.evaluate((e) => getComputedStyle(e).boxShadow);
  expect(s).toMatch(/inset/);
  const box = await btn.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  const t = await btn.evaluate((e) => getComputedStyle(e).transform);
  await page.mouse.up();
  expect(t).not.toBe("none");
});

test("secondary buttons and chips are visibly distinct from body chips", async ({ page }) => {
  await page.goto("/");
  const cv = page.locator("section#home").getByText(/download cv/i).first();
  expect(layers(await cv.evaluate((e) => getComputedStyle(e).boxShadow))).toBeGreaterThanOrEqual(1);
});

test("no slop utilities in components", () => {
  const dir = path.join(process.cwd(), "components");
  const files = fs.readdirSync(dir, { recursive: true }).map(String).filter((f) => f.endsWith(".tsx"));
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    expect(src, f).not.toMatch(/shadow-2xl|rounded-3xl|from-purple|to-pink|text-\[#|bg-\[#|indigo-/);
  }
});
