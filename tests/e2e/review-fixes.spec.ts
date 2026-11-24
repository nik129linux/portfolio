import { test, expect } from "@playwright/test";

// Final-review fixes (loud remix): focus ring on cobalt, gate hydration marker, WebGL probe count.

const lumOf = (rgb: string) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

test("focus ring on a cobalt chapter keeps >= 3:1 against the chapter", async ({ page }) => {
  await page.goto("/");
  const link = page.locator("footer a").first();
  await link.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const { outline, bg, visible } = await link.evaluate((e) => ({
    outline: getComputedStyle(e).outlineColor,
    bg: getComputedStyle(e.closest("footer")!).backgroundColor,
    visible: e.matches(":focus-visible"),
  }));
  expect(visible).toBe(true);
  expect(contrast(lumOf(outline), lumOf(bg)), `${outline} on ${bg}`).toBeGreaterThanOrEqual(3);
});

test("scene gates mark themselves resolved after hydration, in list and scene mode", async ({ browser }) => {
  for (const opts of [{ viewport: { width: 1440, height: 900 } }, { viewport: { width: 375, height: 812 } }, { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" as const }]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByTestId("build-chapter")).toHaveAttribute("data-gate", "resolved");
    await expect(page.getByTestId("hero-blob")).toHaveAttribute("data-gate", "resolved");
    await ctx.close();
  }
});

test("WebGL is probed at most once per page, even across 768px flips", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    (window as unknown as { __probes: number }).__probes = 0;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (/webgl/i.test(type) && !this.isConnected && !this.parentNode) (window as unknown as { __probes: number }).__probes++;
      return (original as (t: string, ...r: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await expect(page.getByTestId("build-chapter")).toHaveAttribute("data-mode", "scene");
  for (const w of [600, 1440, 600, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(300);
  }
  // webgl2 then webgl fallback can make one probe call getContext twice.
  expect(await page.evaluate(() => (window as unknown as { __probes: number }).__probes)).toBeLessThanOrEqual(2);
});
