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

test("projects: wordmark h2, chips filter the tiles, each project appears once", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section#projects");
  await expect(section.locator("h2")).toHaveCount(1);
  const tiles = section.locator('[data-testid="project-tile"]');
  await expect(tiles).toHaveCount(projects.length);
  const slugs = await tiles.evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")));
  expect(new Set(slugs).size).toBe(projects.length);
  expect(slugs.sort()).toEqual(projects.map((p) => p.slug).sort());

  const chips = section.getByTestId("project-chip");
  const kinds = [...new Set(projects.map((p) => p.kind))];
  await expect(chips).toHaveCount(kinds.length + 1);
  await expect(chips.first()).toHaveText(/all/i);
  await expect(chips.first()).toHaveAttribute("aria-pressed", "true");

  for (const kind of kinds) {
    await pressChip(chips.filter({ hasText: new RegExp(`^${kind}$`, "i") }));
    await page.waitForTimeout(700);
    const shown = await tiles.evaluateAll((els) => els.filter((e) => e.getClientRects().length > 0).map((e) => e.getAttribute("data-kind")));
    expect(shown.length).toBeGreaterThan(0);
    for (const k of shown) expect(k).toBe(kind);
  }
  await pressChip(chips.first());
  await page.waitForTimeout(700);
  const all = await tiles.evaluateAll((els) => els.filter((e) => e.getClientRects().length > 0).length);
  expect(all).toBe(projects.length);
});

test("tiles keep their real links reachable by keyboard and never render placeholders", async ({ page }) => {
  await page.goto("/");
  for (const p of projects) {
    const tile = page.locator(`[data-testid="project-tile"][data-slug="${p.slug}"]`);
    const gh = tile.locator('a[href^="https://github.com"]');
    if (p.github.startsWith("http")) {
      await expect(gh).toHaveCount(1);
      expect(await gh.evaluate((e) => (e as HTMLElement).tabIndex)).toBeGreaterThanOrEqual(0);
    } else {
      await expect(gh).toHaveCount(0);
    }
    await expect(tile).not.toContainText("[");
    await expect(tile.getByRole("heading", { name: p.title })).toHaveCount(1);
  }
});

test("tiles cover with the project's first screen when it has one", async ({ page }) => {
  await page.goto("/");
  for (const p of projects.filter((x) => x.screens?.length)) {
    const tile = page.locator(`[data-testid="project-tile"][data-slug="${p.slug}"]`);
    await expect(tile.locator(`img[src="${p.screens![0].src}"]`)).toHaveCount(1);
  }
});

test("no custom cursor anywhere", async ({ page }) => {
  await page.goto("/");
  const hidden = await page.evaluate(() => [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).cursor === "none").length);
  expect(hidden).toBe(0);
});

test("the build cards show the four stack groups from data, no skill bars", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator('section#build [data-testid="build-card"]');
  await expect(cards).toHaveCount(4);
  await expect(page.locator("section#build h2")).toHaveCount(1);
  await expect(page.locator('[role="progressbar"], progress, meter')).toHaveCount(0);
});

test("palette: accent is a light blue, paper is cream, nothing is purple", async ({ page }) => {
  await page.goto("/");
  const tok = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return { accent: s.getPropertyValue("--accent").trim().toLowerCase(), paper: s.getPropertyValue("--paper").trim().toLowerCase() };
  });
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(tok.accent.slice(i, i + 2), 16));
  expect(b, "accent is blue-dominant").toBeGreaterThan(r + 40);
  expect(b).toBeGreaterThan(g);
  expect(r + g + b, "light enough for ink text").toBeGreaterThan(480);
  expect(tok.paper).toMatch(/^#f/);
});

test("reduced motion: hero, wordmarks and tiles are fully readable at first paint", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  expect(await page.locator("h1").evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  const chars = await page.locator("h1 .ch").evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
  for (const o of chars) expect(o).toBe("1");
  const tile = page.locator('[data-testid="project-tile"]').first();
  await tile.scrollIntoViewIfNeeded();
  expect(await tile.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  const floatT = await page.locator('[data-testid="float-object"]').first().evaluate((e) => getComputedStyle(e).animationName);
  expect(floatT, "floating objects are still").toBe("none");
  await ctx.close();
});

test("mobile 375px: no horizontal scroll, filter chips reachable, tiles single column", async ({ page }) => {
  const errors = trackErrors(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } });
  expect(await noHorizontalScroll(page)).toBe(true);
  const xs = await page.locator('[data-testid="project-tile"]').evaluateAll((els) => els.filter((e) => e.getClientRects().length).map((e) => Math.round(e.getBoundingClientRect().left)));
  expect(new Set(xs).size, "one column").toBe(1);
  expect(errors).toEqual([]);
});

test("project tiles are light and flow with the page (no dark navy blocks)", async ({ page }) => {
  await page.goto("/");
  const lum = (rgb: string) => {
    const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  for (const tile of await page.locator('[data-testid="project-tile"]').all()) {
    const bg = await tile.evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(lum(bg), `tile bg ${bg}`).toBeGreaterThan(0.8);
    const color = await tile.evaluate((e) => getComputedStyle(e).color);
    expect(lum(color), "tile text is dark ink").toBeLessThan(0.1);
  }
});

const lum = (rgb: string) => {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test("what-I-build: four light cards that stack (sticky) on desktop", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator('[data-testid="build-card"]');
  await expect(cards).toHaveCount(4);
  for (const card of await cards.all()) {
    expect(lum(await card.evaluate((e) => getComputedStyle(e).backgroundColor))).toBeGreaterThan(0.8);
    expect(await card.locator("xpath=ancestor::li[1]").evaluate((e) => getComputedStyle(e).position), "stacks with sticky").toBe("sticky");
  }
});

test("no dark chapters: every section background is light", async ({ page }) => {
  await page.goto("/");
  const bgs = await page.$$eval("main section, footer", (els) => els.map((e) => getComputedStyle(e).backgroundColor));
  for (const bg of bgs) {
    const alpha = bg.startsWith("rgba") ? Number(bg.split(",")[3]) : 1;
    if (alpha > 0) expect(lum(bg), `section bg ${bg}`).toBeGreaterThan(0.4);
  }
});

test("tech strip: logos with small black captions, no marquee", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("ribbon")).toHaveCount(0);
  const strip = page.getByTestId("stack-icons");
  await strip.scrollIntoViewIfNeeded();
  const items = strip.locator("li");
  expect(await items.count()).toBeGreaterThanOrEqual(12);
  await page.waitForTimeout(800);
  for (const li of await items.all()) {
    const img = li.locator("img");
    await expect(img).toHaveAttribute("alt", "");
    expect(await img.evaluate((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth), "logo loads").toBeGreaterThan(0);
    const cap = li.locator("span");
    expect(await cap.evaluate((e) => parseFloat(getComputedStyle(e).fontSize)), "caption is small").toBeLessThanOrEqual(13);
    expect(lum(await cap.evaluate((e) => getComputedStyle(e).color)), "caption is black").toBeLessThan(0.05);
  }
  const names = await items.locator("span").allTextContents();
  expect(names).toEqual(expect.arrayContaining(["Python", "Node.js", "TypeScript", "AWS"]));
  const anim = await strip.evaluate((e) => [e, ...e.querySelectorAll("*")].some((n) => getComputedStyle(n).animationName !== "none"));
  expect(anim, "calm: nothing animates here").toBe(false);
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

test("projects bento: first tile is wide, each tile carries its 3D object, filter resets spans", async ({ page }) => {
  await page.goto("/");
  const tiles = page.locator('[data-testid="project-tile"]');
  const w = await tiles.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
  expect(w[0], "feature tile is wider").toBeGreaterThan(w[1] * 1.6);
  expect(await page.getByTestId("tile-object").count()).toBe(await tiles.count());
  for (const o of await page.getByTestId("tile-object").all()) await expect(o).toHaveAttribute("aria-hidden", "true");
  await pressChip(page.getByTestId("project-chip").filter({ hasText: /^Web$/ }));
  await page.waitForTimeout(800);
  const vis = await tiles.evaluateAll((els) => els.filter((e) => e.getClientRects().length).map((e) => Math.round(e.getBoundingClientRect().width)));
  expect(new Set(vis).size, "uniform widths while filtered").toBe(1);
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
