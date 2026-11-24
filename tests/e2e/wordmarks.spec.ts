import { test, expect } from "@playwright/test";

// Nico 2026-11-22 removed the role-word marquee ("told u to delete this"). It must not come back.
test("no marquee band anywhere", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("marquee")).toHaveCount(0);
  await expect(page.locator(".marquee, .marquee-track")).toHaveCount(0);
});

test("wordmarks: section h2 wordmarks on cream are the accent colour", async ({ page }) => {
  await page.goto("/");
  const accent = await page.evaluate(() => { const d = document.createElement("div"); d.style.color = "var(--accent)"; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; });
  for (const id of ["contact"]) { // the only cream section with a wordmark h2 (others use small labels)
    const h2 = page.locator(`section#${id} h2.wordmark`).first();
    await expect(h2, id).toHaveCount(1);
    expect(await h2.evaluate((e) => getComputedStyle(e).color), id).toBe(accent);
  }
});
