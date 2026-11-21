// Clean screen capture for portfolio. Run: node tools/screens/capture.mjs [slug]
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const DEMO = path.join(ROOT, "demo-src");
const PUB = path.join(ROOT, "public", "projects");

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webm": "video/webm", ".mp4": "video/mp4", ".woff": "font/woff",
  ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
  ".wasm": "application/wasm", ".txt": "text/plain",
};

function startServer(root) {
  const srv = http.createServer((req, res) => {
    try {
      let u = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (u.endsWith("/")) u += "index.html";
      const f = path.join(root, path.normalize(u).replace(/^\/+/, ""));
      if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end("no"); return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(f).toLowerCase()] || "application/octet-stream" });
      fs.createReadStream(f).pipe(res);
    } catch { res.writeHead(500); res.end("err"); }
  });
  return new Promise((res) => srv.listen(0, "127.0.0.1", () => res(srv)));
}

async function hideCursor(page) {
  await page.addStyleTag({ content: `*{cursor:none!important;caret-color:transparent!important}*:focus{outline:none!important;box-shadow:none!important}*:focus-visible{outline:none!important}.fingertip,#fingertip{display:none!important}` }).catch(() => {});
  await page.evaluate(() => { if (document.activeElement) document.activeElement.blur(); }).catch(() => {});
  await page.mouse.move(1275, 795).catch(() => {});
}

async function settle(page, ms = 1000) {
  await page.waitForTimeout(ms);
}

async function shot(page, outWebp) {
  await settle(page, 900);
  await hideCursor(page);
  await page.waitForTimeout(200);
  const tmp = outWebp + ".tmp.png";
  await page.screenshot({ path: tmp });
  for (const q of [78, 65, 55, 45, 35, 25]) {
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", tmp, "-vf", "scale=1280:800", "-c:v", "libwebp", "-quality", String(q), outWebp]);
    if (fs.statSync(outWebp).size <= 250 * 1024) break;
  }
  fs.rmSync(tmp, { force: true });
}

async function click(page, sel, timeout = 4000) {
  await page.waitForSelector(sel, { timeout });
  await page.click(sel, { timeout });
}

async function captureRetoma(page, base, dir) {
  const shots = [];
  await page.goto(`${base}/desktop/index.html`, { waitUntil: "load" });
  await page.waitForSelector("#storyPlay", { timeout: 15000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    try { window.__storySpeed = 8; } catch {}
    try { Desk.focus("Document"); } catch {}
    try { Retoma.closePanel(); } catch {}
    try { Retoma.setClock(9, 0); } catch {}
  });
  await page.waitForTimeout(400);
  await shot(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/retoma/01.webp", caption: "Desktop before the interruption" });

  await page.evaluate(() => {
    try { Retoma.openPanel(); } catch {}
    document.getElementById("tabBtnAhora")?.click();
    try { Retoma.receiveWhatsapp(); } catch {}
  });
  await shot(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/retoma/02.webp", caption: "WhatsApp interruption noted" });

  await page.evaluate(() => { try { Retoma.goAway(25); } catch {} });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { try { Retoma.comeBack(); } catch {} });
  await page.waitForTimeout(800);
  await shot(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/retoma/03.webp", caption: "Resume card after stepping away" });

  await page.evaluate(() => {
    try { Retoma.showEndOfDay(); } catch {}
    try { Retoma.openPanel(); } catch {}
    document.getElementById("tabBtnHoy")?.click();
  });
  await shot(page, path.join(dir, "04.webp"));
  shots.push({ src: "/projects/retoma/04.webp", caption: "Today timeline with suggestion" });

  await page.evaluate(() => document.getElementById("tabBtnPriv")?.click());
  await shot(page, path.join(dir, "05.webp"));
  shots.push({ src: "/projects/retoma/05.webp", caption: "Privacy controls on this device" });
  return shots;
}

async function captureAcompana(page, base, dir) {
  const shots = [];
  await page.goto(`${base}/mobile/index.html`, { waitUntil: "load" });
  await page.waitForSelector("[data-splash-skip]", { timeout: 15000 });
  await page.waitForTimeout(800);
  await click(page, "[data-splash-skip]");
  await page.waitForTimeout(1200);

  await shot(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/acompana/01.webp", caption: "Nurse shift overview" });

  await click(page, '[data-patient="mg"]');
  await page.waitForTimeout(600);
  await shot(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/acompana/02.webp", caption: "Patient file with hidden clinical data" });

  await click(page, '[data-back="enfermero"]');
  await page.waitForTimeout(600);
  await click(page, '[data-nav="pendientes"]');
  await page.waitForTimeout(600);
  await shot(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/acompana/03.webp", caption: "Pending tasks to confirm" });

  await click(page, '.role-tab[data-role="paciente"]');
  await page.waitForTimeout(800);
  await shot(page, path.join(dir, "04.webp"));
  shots.push({ src: "/projects/acompana/04.webp", caption: "Patient simple view of the day" });

  await click(page, '.role-tab[data-role="familia"]');
  await page.waitForTimeout(800);
  await click(page, '.role-tab[data-role="enfermero"]');
  await page.waitForTimeout(600);
  await click(page, '[data-nav="registrar"]');
  await page.waitForTimeout(800);
  await shot(page, path.join(dir, "05.webp"));
  shots.push({ src: "/projects/acompana/05.webp", caption: "Registering an event with one tap" });
  return shots;
}

async function captureWatch(page, base, dir) {
  const shots = [];
  await page.goto(`${base}/smartwatch/index.html`, { waitUntil: "load" });
  await page.waitForSelector("#storyPlay", { timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/hand-hygiene-watch/01.webp", caption: "Watch home with day shift panel" });

  await click(page, '[data-act="zona"]');
  await page.waitForTimeout(600);
  await shot(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/hand-hygiene-watch/02.webp", caption: "Entering zone reminder on wrist" });

  await click(page, '[data-act="lavado"]');
  await page.waitForTimeout(600);
  await shot(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/hand-hygiene-watch/03.webp", caption: "Wash confirmed on the watch" });

  await click(page, '[data-act="salir"]');
  await page.waitForTimeout(600);
  await shot(page, path.join(dir, "04.webp"));
  shots.push({ src: "/projects/hand-hygiene-watch/04.webp", caption: "Missed wash alert to fix" });

  await page.goto(`${base}/smartwatch/unit.html`, { waitUntil: "load" });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, path.join(dir, "05.webp"));
  shots.push({ src: "/projects/hand-hygiene-watch/05.webp", caption: "Unit dashboard with weekly trends" });
  return shots;
}

async function captureLumenfall(page, base, dir) {
  const shots = [];
  await page.goto(`${base}/juego/index.html`, { waitUntil: "load" });
  await page.waitForSelector("#menu-new", { timeout: 20000 });
  await page.waitForTimeout(2500); // boot clears
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/lumenfall/01.webp", caption: "Title menu starting a new run" });

  // Story cutscene driven with the keyboard, then real gameplay the same way.
  await page.goto(`${base}/juego/index.html?cutscene=prologue`, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  await page.keyboard.press("Space");
  await page.waitForTimeout(800);
  await shot(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/lumenfall/02.webp", caption: "Opening story cutscene" });

  // Gameplay via direct level param, driven with keyboard
  await page.goto(`${base}/juego/index.html?level=1`, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(1500);
  await page.keyboard.up("ArrowRight");
  await page.keyboard.press("Space");
  await page.waitForTimeout(800);
  await shot(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/lumenfall/03.webp", caption: "Running through the first level" });

  await page.goto(`${base}/juego/index.html?level=2`, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(1500);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(500);
  await shot(page, path.join(dir, "04.webp"));
  shots.push({ src: "/projects/lumenfall/04.webp", caption: "Exploring the second zone" });

  await page.goto(`${base}/juego/index.html?level=1&boss=1`, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(700);
  await page.keyboard.up("ArrowLeft");
  await page.waitForTimeout(500);
  await shot(page, path.join(dir, "05.webp"));
  shots.push({ src: "/projects/lumenfall/05.webp", caption: "Boss fight for the fallen light" });
  return shots;
}

const CAPTURERS = { retoma: captureRetoma, acompana: captureAcompana, "hand-hygiene-watch": captureWatch, lumenfall: captureLumenfall };

const only = process.argv[2];
const wanted = only ? [only] : ["retoma", "acompana", "hand-hygiene-watch", "lumenfall"];
for (const s of wanted) if (!CAPTURERS[s]) { console.error(`unknown slug ${s}`); process.exit(1); }

const srv = await startServer(DEMO);
const port = srv.address().port;
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();
try {
  for (const slug of wanted) {
    const dir = path.join(PUB, slug);
    fs.mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const shots = await CAPTURERS[slug](page, base, dir);
    fs.writeFileSync(path.join(dir, "screens.json"), JSON.stringify(shots, null, 2) + "\n");
    console.log(slug, "done", shots.length);
    await ctx.close();
  }
} finally {
  await browser.close();
  srv.close();
}
