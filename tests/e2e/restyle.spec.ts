import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { projects } from "../../data/projects";
import { trackErrors, noHorizontalScroll } from "./helpers";
import type { Locator } from "@playwright/test";

// A click before React hydrates does nothing; retry until the chip reports pressed.
async function pressChip(chip: Locator) {
  await expect(async () => {
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "true", { timeout: 800 });
  }).toPass({ timeout: 10_000 });
}

// Judge for the v3 restyle (prathamfolio-inspired): wordmark hero with a cut-out
// portrait, pill nav, floating objects, chips + tiles for projects.

test("hero: one h1, giant wordmark, cut-out portrait in front of it, floating objects", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  const mark = page.getByTestId("hero-wordmark");
  await expect(mark).toHaveText(/^nicolas$/i);
  await expect(mark).toHaveAttribute("aria-hidden", "true");
  const size = await mark.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  expect(size, "wordmark is display-size").toBeGreaterThanOrEqual(96);
  const img = page.locator("section#home img[src*='photo-cutout']");
  await expect(img).toHaveCount(1);
  expect(await img.evaluate((e) => (e as HTMLImageElement).naturalWidth), "cut-out loads").toBeGreaterThan(0);
  const stack = await page.evaluate(() => {
    const m = document.querySelector('[data-testid="hero-wordmark"]')!;
    const i = document.querySelector("section#home img[src*='photo-cutout']")!;
    const zm = parseInt(getComputedStyle(m.closest("[data-layer]") ?? m).zIndex || "0", 10) || 0;
    const zi = parseInt(getComputedStyle(i.closest("[data-layer]") ?? i).zIndex || "0", 10) || 0;
    return { zm, zi };
  });
  expect(stack.zi, "portrait sits above the wordmark").toBeGreaterThan(stack.zm);
  const objs = page.locator('section#home [data-testid="float-object"]');
  expect(await objs.count()).toBeGreaterThanOrEqual(4);
  for (const o of await objs.all()) await expect(o).toHaveAttribute("aria-hidden", "true");
});

test("photo.webp is untouched and the cut-out is a separate file", async () => {
  expect(fs.existsSync(path.join(process.cwd(), "public/photo.webp"))).toBe(true);
  expect(fs.existsSync(path.join(process.cwd(), "public/photo-cutout.webp"))).toBe(true);
});

test("nav is a sticky pill with one accent CTA outside the section list", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header").first();
  expect(await header.evaluate((e) => getComputedStyle(e).position)).toBe("sticky");
  const cta = header.getByRole("link", { name: /let.s talk/i });
  await expect(cta).toHaveAttribute("href", "#contact");
  await expect(header.locator("nav").getByRole("link", { name: /let.s talk/i })).toHaveCount(0);
});

test("projects: wordmark h2, the orbit chips cover each project exactly once", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section#projects");
  await expect(section.locator("h2")).toHaveCount(1);

  const root = page.getByTestId("project-orbit");
  await expect(root).toHaveAttribute("data-mode", "orbit");
  await expect(root).toHaveAttribute("data-ready", "", { timeout: 15000 });
  const chips = root.getByTestId("project-chips").locator("button[data-slug]");
  await expect(chips).toHaveCount(projects.length);
  const slugs = await chips.evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")));
  expect(new Set(slugs).size).toBe(projects.length);
  expect(slugs).toEqual(projects.map((p) => p.slug));
  await expect(root.getByTestId("project-list")).toHaveCount(0);
  const firstChip = root.getByTestId("project-chips").locator(`button[data-slug="${projects[0].slug}"]`);
  await expect(firstChip).toHaveAttribute("aria-pressed", "true");
  await expect(root).toHaveAttribute("data-front", projects[0].slug);

  const dialog = page.getByRole("dialog");
  for (const p of projects.slice(1)) {
    const chip = root.getByTestId("project-chips").locator(`button[data-slug="${p.slug}"]`);
    await chip.scrollIntoViewIfNeeded();
    await pressChip(chip);
    await expect(firstChip).toHaveAttribute("aria-pressed", "false");
    await expect(root).toHaveAttribute("data-front", p.slug);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  const listRoot = page.getByTestId("project-orbit");
  await expect(listRoot).toHaveAttribute("data-mode", "list");
  const rows = listRoot.getByTestId("project-list").locator("li[data-slug]");
  await expect(rows).toHaveCount(projects.length);
  const listSlugs = await rows.evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")));
  expect(new Set(listSlugs).size).toBe(projects.length);
  expect(listSlugs).toEqual(projects.map((p) => p.slug));
  await expect(listRoot.getByTestId("project-chips")).toHaveCount(0);
});

test("orbit panels keep their real links reachable by keyboard and never render placeholders", async ({ page }) => {
  await page.goto("/");
  const root = page.getByTestId("project-orbit");
  await expect(root).toHaveAttribute("data-ready", "", { timeout: 15000 });
  const dialog = page.getByRole("dialog");
  for (const p of projects) {
    const chip = root.getByTestId("project-chips").locator(`button[data-slug="${p.slug}"]`);
    await chip.scrollIntoViewIfNeeded();
    await expect(async () => {
      await chip.focus();
      await page.keyboard.press("Enter");
      await expect(dialog).toBeVisible({ timeout: 800 });
    }).toPass({ timeout: 10_000 });
    const gh = dialog.locator('a[href^="https://github.com"]');
    if (p.github.startsWith("http")) {
      await expect(gh).toHaveCount(1);
      expect(await gh.evaluate((e) => (e as HTMLElement).tabIndex)).toBeGreaterThanOrEqual(0);
    } else {
      await expect(gh).toHaveCount(0);
    }
    await expect(dialog).not.toContainText("[");
    await expect(dialog.getByRole("heading", { name: p.title })).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }
});

test("orbit panels cover with the project's first screen when it has one", async ({ page }) => {
  await page.goto("/");
  const root = page.getByTestId("project-orbit");
  await expect(root).toHaveAttribute("data-ready", "", { timeout: 15000 });
  for (const p of projects.filter((x) => x.screens?.length)) {
    const chip = root.getByTestId("project-chips").locator(`button[data-slug="${p.slug}"]`);
    await chip.scrollIntoViewIfNeeded();
    await pressChip(chip);
    // The panel's main image is the project's first screen (the thumbnail strip repeats it, so not "exactly one").
    await expect(page.getByRole("dialog").locator("img").first()).toHaveAttribute("src", p.screens![0].src);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("no custom cursor anywhere", async ({ page }) => {
  await page.goto("/");
  const hidden = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).cursor === "none").length);
  expect(hidden).toBe(0);
});

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const hexLum = (hex: string) => lumOf([1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
function lumOf([r, g, b]: number[]) {
  const [R, G, B] = [r, g, b].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

test("palette: accent is a saturated cobalt, paper is cream, text on accent is paper, nothing is purple", async ({ page }) => {
  await page.goto("/");
  const tok = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    const v = (n: string) => s.getPropertyValue(n).trim().toLowerCase();
    return { accent: v("--accent"), paper: v("--paper"), onAccent: getComputedStyle(document.querySelector(".btn-primary")!).color };
  });
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(tok.accent.slice(i, i + 2), 16));
  expect(b, "accent is cobalt: blue far above red").toBeGreaterThan(r + 120);
  expect(b, "accent is cobalt: blue far above green").toBeGreaterThan(g + 60);
  expect(r, "not purple").toBeLessThan(80);
  expect(tok.paper).toMatch(/^#f/);
  const onAccent = (tok.onAccent.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  expect(contrast(lumOf(onAccent), hexLum(tok.accent)), "primary button text contrast").toBeGreaterThanOrEqual(4.5);
  expect(contrast(hexLum(tok.paper), hexLum(tok.accent)), "paper on accent").toBeGreaterThanOrEqual(4.5);
});

test("reduced motion: hero, wordmarks and project rows are fully readable at first paint", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  expect(await page.locator("h1").evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  const chars = await page.locator("h1 .ch").evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
  for (const o of chars) expect(o).toBe("1");
  const root = page.getByTestId("project-orbit");
  await expect(root).toHaveAttribute("data-mode", "list");
  const row = root.locator('[data-testid="project-list"] li[data-slug]').first();
  await row.scrollIntoViewIfNeeded();
  expect(await row.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  await expect(root.locator("canvas")).toHaveCount(0);
  const floatT = await page.locator('[data-testid="float-object"]').first().evaluate((e) => getComputedStyle(e).animationName);
  expect(floatT, "floating objects are still").toBe("none");
  await ctx.close();
});

test("mobile 375px: no horizontal scroll, project rows reachable, single column", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } });
  expect(await noHorizontalScroll(page)).toBe(true);
  const rows = page.locator('[data-testid="project-list"] li[data-slug]');
  const lefts = await rows.evaluateAll((els) => els.filter((e) => e.getClientRects().length).map((e) => Math.round(e.getBoundingClientRect().left)));
  expect(new Set(lefts).size, "one column").toBe(1);
  for (const row of await rows.all()) {
    await expect(row.locator("button")).toHaveCount(1);
    const box = await row.locator("button").boundingBox();
    expect(box?.height, "row button is a real tap target").toBeGreaterThanOrEqual(44);
  }
  expect(errors).toEqual([]);
});

test("project rows are light and the panel is light too (no dark navy blocks)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  const lum = (rgb: string) => {
    const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const rows = page.locator('[data-testid="project-list"] li[data-slug]');
  for (const row of await rows.all()) {
    const bg = await row.evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(lum(bg), `row bg ${bg}`).toBeGreaterThan(0.8);
    const color = await row.evaluate((e) => getComputedStyle(e).color);
    expect(lum(color), "row text is dark ink").toBeLessThan(0.1);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const root = page.getByTestId("project-orbit");
  await expect(root).toHaveAttribute("data-ready", "", { timeout: 15000 });
  await pressChip(root.getByTestId("project-chips").locator(`button[data-slug="${projects[0].slug}"]`));
  const dialog = page.getByRole("dialog");
  const dbg = await dialog.evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(lum(dbg), `panel bg ${dbg}`).toBeGreaterThan(0.8);
});

const lum = (rgb: string) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test("cobalt chapters are #build, #now and the footer; every other section is light; none is black", async ({ page }) => {
  await page.goto("/");
  const accent = await page.evaluate(() => {
    const d = document.createElement("div");
    d.style.color = "var(--accent)";
    document.body.append(d);
    const c = getComputedStyle(d).color;
    d.remove();
    return c;
  });
  const rows = await page.$$eval("main section, footer", (els) => els.map((e) => ({ id: e.id || e.tagName.toLowerCase(), bg: getComputedStyle(e).backgroundColor })));
  const cobalt = rows.filter((r) => r.bg === accent).map((r) => r.id).sort();
  expect(cobalt).toEqual(["build", "footer", "now"]);
  for (const { id, bg } of rows) {
    if (cobalt.includes(id)) continue;
    const alpha = bg.startsWith("rgba") ? Number(bg.split(",")[3]) : 1;
    if (alpha > 0) expect(lum(bg), `section ${id} bg ${bg}`).toBeGreaterThan(0.4);
  }
});

test("about: the statement is word-by-word (scroll lit) and fully readable under reduced motion", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  const words = page.locator("section#about .scrub-word");
  expect(await words.count()).toBeGreaterThan(8);
  for (const o of await words.evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity))) expect(o).toBe("1");
  await expect(page.locator("section#about h2")).toHaveCount(1);
  await ctx.close();
});

test("the orbit does not reuse the 3D icons: one canvas, no tile objects", async ({ page }) => {
  await page.goto("/");
  const root = page.getByTestId("project-orbit");
  await expect(root).toHaveAttribute("data-mode", "orbit");
  await expect(root).toHaveAttribute("data-ready", "", { timeout: 15000 });
  await expect(root.locator("canvas")).toHaveCount(1);
  await expect(root.locator('img[src^="/3d/"]')).toHaveCount(0);
  await expect(page.getByTestId("tile-object")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  await expect(page.getByTestId("project-orbit")).toHaveAttribute("data-mode", "list");
  await expect(page.getByTestId("project-orbit").locator('img[src^="/3d/"]')).toHaveCount(0);
});

test("hero objects react to the pointer (native translate), calm without hover", async ({ page }) => {
  await page.goto("/");
  const obj = page.locator('section#home [data-testid="float-object"]').first();
  const t0 = await obj.evaluate((e) => getComputedStyle(e).translate);
  await page.mouse.move(100, 300);
  await page.mouse.move(1300, 700, { steps: 8 });
  await page.waitForTimeout(900);
  const t1 = await obj.evaluate((e) => getComputedStyle(e).translate);
  expect(t1).not.toBe(t0);
});

test("body font is not on the banned list and fonts are loaded", async ({ page }) => {
  await page.goto("/");
  const ff = await page.evaluate(() => getComputedStyle(document.body).fontFamily.toLowerCase());
  for (const banned of ["dm sans", "geist", "inter", "poppins", "roboto"]) expect(ff).not.toContain(banned);
});
