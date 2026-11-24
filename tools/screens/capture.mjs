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

async function calm(page) {
  // Dismiss the welcome guide and any coach mark. Coaches arrive one at a
  // time, so drain until quiet (at most a few rounds).
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => {
      const g = document.querySelector("[data-guide-close]");
      if (g) g.click();
      const d = document.querySelector("[data-guide-done]");
      if (d) d.click();
      const c = document.querySelector("[data-coach-close]");
      if (c) c.click();
    }).catch(() => {});
    await page.waitForTimeout(350);
    const quiet = await page.evaluate(() => {
      const gl = document.getElementById("guideLayer");
      const guideOpen = gl ? gl.classList.contains("is-open") : false;
      return !guideOpen && !document.querySelector(".coach-card");
    }).catch(() => true);
    if (quiet) break;
  }
}

async function calmRetoma(page) {
  // The login gate and the welcome guide cover the app on a fresh profile.
  // Coach marks arrive one at a time, so drain until quiet.
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => {
      // Click only what is actually visible: the buttons still exist while
      // hidden, and Skip would switch back to the Now tab via afterWelcome.
      const lo = document.getElementById("loginScreen");
      if (lo && !lo.classList.contains("is-hidden")) document.getElementById("loginGuest")?.click();
      const go = document.getElementById("guideOverlay");
      if (go && !go.classList.contains("is-hidden")) document.getElementById("guideSkip")?.click();
      const tip = document.getElementById("coachTip");
      if (tip && !tip.classList.contains("is-hidden")) document.getElementById("coachTipClose")?.click();
    }).catch(() => {});
    await page.waitForTimeout(350);
    const quiet = await page.evaluate(() => {
      const login = document.getElementById("loginScreen");
      const guide = document.getElementById("guideOverlay");
      const tip = document.getElementById("coachTip");
      return (!login || login.classList.contains("is-hidden"))
        && (!guide || guide.classList.contains("is-hidden"))
        && (!tip || tip.classList.contains("is-hidden"));
    }).catch(() => true);
    if (quiet) break;
  }
  await page.evaluate(() => {
    document.querySelector(".retoma-tab.is-active")?.scrollTo(0, 0);
  }).catch(() => {});
  await page.waitForTimeout(300);
}

async function captureRetoma(page, base, dir) {
  const shots = [];
  await page.goto(`${base}/desktop/index.html`, { waitUntil: "load" });
  await page.waitForSelector("#storyPlay", { timeout: 15000 });
  await page.waitForFunction(() => window.Retoma && window.Desk, { timeout: 15000 });
  await page.waitForTimeout(600);
  await calmRetoma(page);
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    // Before the interruption: the user is writing in Document.
    try { Desk.focus("Document"); } catch {}
    try { Retoma.setClock(9, 0); } catch {}
  });
  await page.waitForTimeout(400);
  await calmRetoma(page);
  await shot(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/retoma/01.webp", caption: "Desktop before the interruption" });

  await page.evaluate(() => {
    // The interruption arrives and is noted in today's timeline.
    try { Retoma.receiveWhatsapp(); } catch {}
    try { Retoma.switchTab("hoy"); } catch {}
  });
  await calmRetoma(page);
  await shot(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/retoma/02.webp", caption: "WhatsApp interruption noted" });

  await page.evaluate(() => { try { Retoma.goAway(25); } catch {} });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { try { Retoma.comeBack(); } catch {} });
  await page.waitForTimeout(800);
  await calmRetoma(page);
  await shot(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/retoma/03.webp", caption: "Resume card after stepping away" });

  await page.evaluate(() => {
    try { Retoma.showEndOfDay(); } catch {}
    try { Retoma.hideResume(); } catch {}
    try { Retoma.switchTab("hoy"); } catch {}
  });
  await calmRetoma(page);
  await shot(page, path.join(dir, "04.webp"));
  shots.push({ src: "/projects/retoma/04.webp", caption: "Today timeline with suggestion" });

  await page.evaluate(() => { try { Retoma.switchTab("priv"); } catch {} });
  await page.waitForTimeout(600);
  await calmRetoma(page);
  await shot(page, path.join(dir, "05.webp"));
  shots.push({ src: "/projects/retoma/05.webp", caption: "Privacy controls on this device" });
  return shots;
}

async function dclick(page, sel) {
  // DOM click for controls Playwright deems invisible (zero-rect role tabs).
  await page.evaluate((s) => { document.querySelector(s)?.click(); }, sel);
}

async function captureAcompana(page, base, dir) {
  const shots = [];
  await page.goto(`${base}/mobile/index.html`, { waitUntil: "load" });
  await page.waitForSelector("[data-splash-skip]", { timeout: 15000 });
  await page.waitForTimeout(800);
  await click(page, "[data-splash-skip]");
  await page.waitForTimeout(1200);
  await calm(page);

  await shot(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/acompana/01.webp", caption: "Nurse shift overview" });

  await dclick(page, '[data-patient="mg"]');
  await page.waitForTimeout(600);
  await calm(page);
  await shot(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/acompana/02.webp", caption: "Patient file with hidden clinical data" });

  await dclick(page, '[data-back="enfermero"]');
  await page.waitForTimeout(600);
  await dclick(page, '[data-nav="pendientes"]');
  await page.waitForTimeout(600);
  await calm(page);
  await shot(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/acompana/03.webp", caption: "Pending tasks to confirm" });

  // The old demo menu (data-demo-menu / data-view-as) is gone: roles switch
  // with the role tabs at the top of the phone.
  await dclick(page, '.role-tab[data-role="paciente"]');
  await page.waitForTimeout(800);
  await calm(page);
  await shot(page, path.join(dir, "04.webp"));
  shots.push({ src: "/projects/acompana/04.webp", caption: "Patient simple view of the day" });

  await dclick(page, '.role-tab[data-role="enfermero"]');
  await page.waitForTimeout(600);
  await dclick(page, "[data-fab-register]");
  await page.waitForTimeout(800);
  await calm(page);
  await shot(page, path.join(dir, "05.webp"));
  shots.push({ src: "/projects/acompana/05.webp", caption: "Registering an event with one tap" });
  return shots;
}

async function calmWatch(page) {
  await page.evaluate(() => document.querySelector("[data-guide-skip]")?.click()).catch(() => {});
  await page.waitForTimeout(300);
  // Tips arrive one at a time, 700ms after the previous is closed; drain them all.
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => document.querySelector(".tip__close")?.click()).catch(() => {});
    await page.waitForTimeout(800);
    const quiet = await page.evaluate(() => !document.querySelector("#guideTip")).catch(() => true);
    if (quiet) break;
  }
}

async function captureWatch(page, base, dir) {
  const shots = [];
  await page.goto(`${base}/smartwatch/index.html`, { waitUntil: "load" });
  await page.waitForSelector("#storyPlay", { timeout: 15000 });
  await page.waitForTimeout(1500);
  await calmWatch(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/hand-hygiene-watch/01.webp", caption: "Watch home with day shift panel" });

  await click(page, '[data-act="zona"]');
  await page.waitForTimeout(600);
  await calmWatch(page);
  await shot(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/hand-hygiene-watch/02.webp", caption: "Entering zone reminder on wrist" });

  await click(page, '[data-act="lavado"]');
  await page.waitForTimeout(600);
  await calmWatch(page);
  await shot(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/hand-hygiene-watch/03.webp", caption: "Wash confirmed on the watch" });

  await click(page, '[data-act="salir"]');
  await page.waitForTimeout(600);
  await calmWatch(page);
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
  await page.waitForSelector("#boot", { state: "detached", timeout: 30000 });
  await page.waitForTimeout(1000); // boot clears
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/lumenfall/01.webp", caption: "Title menu starting a new run" });

  // Story cutscene driven with the keyboard, then real gameplay the same way.
  // Boot shows a loading screen for at least ~2.6s, so wait until it is gone.
  await page.goto(`${base}/juego/index.html?cutscene=prologue`, { waitUntil: "load" });
  await page.waitForSelector("#boot", { state: "detached", timeout: 30000 });
  await page.waitForFunction(() => (document.getElementById("type-line")?.textContent || "").length > 0, { timeout: 15000 });
  await page.keyboard.press("Space");
  await page.waitForTimeout(800);
  await shot(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/lumenfall/02.webp", caption: "Opening story cutscene" });

  // Gameplay via direct level param, driven with keyboard
  await page.goto(`${base}/juego/index.html?level=1`, { waitUntil: "load" });
  await page.waitForSelector("#boot", { state: "detached", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(1500);
  await page.keyboard.up("ArrowRight");
  await page.keyboard.press("Space");
  await page.waitForTimeout(800);
  await shot(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/lumenfall/03.webp", caption: "Running through the first level" });

  await page.goto(`${base}/juego/index.html?level=2`, { waitUntil: "load" });
  await page.waitForSelector("#boot", { state: "detached", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(1500);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(500);
  await shot(page, path.join(dir, "04.webp"));
  shots.push({ src: "/projects/lumenfall/04.webp", caption: "Exploring the second zone" });

  await page.goto(`${base}/juego/index.html?level=1&boss=1`, { waitUntil: "load" });
  await page.waitForSelector("#boot", { state: "detached", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(700);
  await page.keyboard.up("ArrowLeft");
  await page.waitForTimeout(500);
  await shot(page, path.join(dir, "05.webp"));
  shots.push({ src: "/projects/lumenfall/05.webp", caption: "Boss fight for the fallen light" });
  return shots;
}

async function shotMobile(page, outWebp) {
  await settle(page, 1200);
  await hideCursor(page);
  await page.waitForTimeout(200);
  const tmp = outWebp + ".tmp.png";
  await page.screenshot({ path: tmp });
  for (const q of [80, 70, 60, 50, 40, 30]) {
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", tmp, "-vf", "scale=780:-2", "-c:v", "libwebp", "-quality", String(q), outWebp]);
    if (fs.statSync(outWebp).size <= 250 * 1024) break;
  }
  fs.rmSync(tmp, { force: true });
}

async function cantrackScrollTo(page, text) {
  await page.evaluate((t) => {
    const all = [...document.querySelectorAll("h1, h2, h3, p, div")];
    const h = all.find((e) => (e.textContent || "").trim().toLowerCase() === t.toLowerCase() && e.children.length <= 3)
      || all.find((e) => (e.textContent || "").toLowerCase().includes(t.toLowerCase()) && e.children.length === 0);
    if (h) h.scrollIntoView({ block: "start" });
  }, text);
  await page.waitForTimeout(900);
}

async function captureCantrack(page, base, dir) {
  const shots = [];
  const app = process.env.CANTRACK_URL || "http://localhost:5173";
  const go = async (preview) => {
    await page.goto(`${app}/?preview=${preview}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2500);
  };
  // 01: owner home
  await go("owner");
  await shotMobile(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/cantrack/01.webp", caption: "Owner home with next walk and weather" });
  // 02: owner timeline further down the same home
  await cantrackScrollTo(page, "Paseos programados");
  await shotMobile(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/cantrack/02.webp", caption: "Owner timeline of booked walks" });
  // 03: walker home with nearby requests
  await go("walker");
  await shotMobile(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/cantrack/03.webp", caption: "Walker online with nearby requests" });
  // 04: route map with the pickup order below it
  await page.getByRole("button", { name: "Rutas" }).first().click({ timeout: 8000 });
  await page.waitForTimeout(2000);
  await cantrackScrollTo(page, "SIGUIENTE PARADA");
  await shotMobile(page, path.join(dir, "04.webp"));
  shots.push({ src: "/projects/cantrack/04.webp", caption: "Walker pickup order with next stop" });
  return shots;
}

async function calmCotizaia(page) {
  await page.evaluate(() => {
    document.querySelectorAll("[data-sonner-toast]").forEach((t) => t.remove());
    if (document.activeElement) document.activeElement.blur();
  }).catch(() => {});
  await page.waitForTimeout(500);
}

async function cotizaiaApi(page, path, body, method = "POST", retries = 3) {
  return await page.evaluate(async ({ path, body, method, retries }) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const xsrf = async () => {
      const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
      let tok = m ? decodeURIComponent(m[1]) : null;
      if (!tok) {
        await fetch("/api/auth/csrf", { credentials: "same-origin" }).catch(() => null);
        const m2 = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
        tok = m2 ? decodeURIComponent(m2[1]) : null;
      }
      return tok;
    };
    let last = null;
    for (let i = 0; i < retries; i++) {
      const h = { "Content-Type": "application/json" };
      const tok = await xsrf();
      if (tok) h["X-XSRF-TOKEN"] = tok;
      const r = await fetch(path, { method, headers: h, credentials: "same-origin", body: body ? JSON.stringify(body) : undefined });
      const t = await r.text();
      last = `${r.status} ${t.slice(0, 200)}`;
      if (r.status === 429) { await sleep(90000); continue; }
      if (!r.ok) throw new Error(`${method} ${path} -> ${last}`);
      return t ? JSON.parse(t) : null;
    }
    throw new Error(`${method} ${path} -> rate limited (${last})`);
  }, { path, body, method, retries });
}

async function cotizaiaGet(page, path) {
  return await page.evaluate(async (path) => {
    const r = await fetch(path, { credentials: "same-origin" });
    if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
    return await r.json();
  }, path);
}

async function captureCotizaia(page, base, dir) {
  const shots = [];
  const live = (process.env.COTIZAIA_URL || "https://frontend-cotizaia-swart.vercel.app/").replace(/\/*$/, "/");
  await page.goto(live, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(2500);
  let briefId, proposalId;
  if (process.env.COTIZAIA_EMAIL && process.env.COTIZAIA_PASSWORD) {
    await cotizaiaApi(page, "/api/auth/login", { email: process.env.COTIZAIA_EMAIL, password: process.env.COTIZAIA_PASSWORD });
    const proposals = await cotizaiaGet(page, "/api/proposals");
    if (!Array.isArray(proposals) || proposals.length === 0) throw new Error("login account has no proposals to capture");
    proposalId = proposals[0].id;
    briefId = proposals[0].briefId;
  } else {
    const email = `screens${Date.now()}@example.com`;
    const pass = "TestPass1234!";
    await cotizaiaApi(page, "/api/auth/register", { agencyName: "Agencia Demo", ownerFullName: "Demo Owner", email, password: pass });
    const role = await cotizaiaApi(page, "/api/roles", { name: "Desarrollador" });
    await cotizaiaApi(page, `/api/roles/${role.id}/rates`, { copPerHour: 120000 });
    const svc = await cotizaiaApi(page, "/api/catalog", { name: "Tienda online", description: "Tienda online con pagos, blog y panel de pedidos" });
    await cotizaiaApi(page, `/api/catalog/${svc.id}/requirement-types`, { name: "Tienda con pagos", description: "Pasarela de pagos y carrito de compras", estimatedHours: 14 });
    await cotizaiaApi(page, `/api/catalog/${svc.id}/requirement-types`, { name: "Blog", description: "Blog administrable con categorias", estimatedHours: 8 });
    await cotizaiaApi(page, `/api/catalog/${svc.id}/requirement-types`, { name: "Panel de pedidos", description: "Panel para ver y gestionar los pedidos", estimatedHours: 12 });
    const client = await cotizaiaApi(page, "/api/clients", { name: "Cafe Origen", email: "hola@cafeorigen.co", company: "Cafe Origen" });
    const brief = await cotizaiaApi(page, "/api/briefs", {
      source: "WHATSAPP",
      clientId: client.id,
      payload: { message: "Hola, necesito una tienda online para mi cafe, con pagos, un blog y un panel para ver los pedidos. Presupuesto aproximado 20 millones, entrega en 2 meses." },
    });
    briefId = brief.id;
    await cotizaiaApi(page, `/api/briefs/${briefId}/process`, undefined);
    proposalId = (await cotizaiaGet(page, "/api/proposals"))[0].id;
  }
  await page.goto(live, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(5000);

  // 01: pricing view with the proposal selected
  await page.goto(`${live}#/precios`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(4000);
  await calmCotizaia(page);
  await page.locator("text=Selecciona una propuesta...").click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.evaluate((id) => {
    const els = [...document.querySelectorAll("*")];
    const o = els.find((e) => e.children.length === 0 && new RegExp(`Propuesta #${id}`).test(e.textContent || ""));
    if (o) o.click();
  }, proposalId);
  await page.waitForTimeout(2500);
  await calmCotizaia(page);
  await page.evaluate(() => {
    const els = [...document.querySelectorAll("*")];
    const t = els.find((e) => e.children.length === 0 && /Ajuste de alcance/.test(e.textContent || ""));
    if (t) t.scrollIntoView({ block: "start" });
    window.scrollBy(0, 130);
  });
  await page.waitForTimeout(800);
  await shot(page, path.join(dir, "01.webp"));
  shots.push({ src: "/projects/cotizaia/01.webp", caption: "Pricing strategy and scope hours" });

  // 02: resumen view
  await page.goto(`${live}#/resumen`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await calmCotizaia(page);
  await shot(page, path.join(dir, "02.webp"));
  shots.push({ src: "/projects/cotizaia/02.webp", caption: "Agency summary with proposal pipeline" });

  // 03: agent run view for the brief (defaults to the latest execution)
  await page.goto(`${live}#/agente`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(4000);
  await calmCotizaia(page);
  const showsBrief = await page.evaluate((id) => (document.body.innerText || "").includes(`Brief #${id}`), briefId);
  if (!showsBrief) {
    await page.evaluate((id) => {
      const search = [...document.querySelectorAll("input")].filter((i) => !/buscar/i.test(i.placeholder || ""));
      const box = search.find((i) => /^\d*$/.test(i.value)) || search[0];
      if (box) {
        box.focus();
        box.value = String(id);
        box.dispatchEvent(new Event("input", { bubbles: true }));
        box.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const btn = [...document.querySelectorAll("button")].find((b) => /^buscar$/i.test((b.textContent || "").trim()));
      if (btn) btn.click();
    }, briefId);
    await page.waitForTimeout(3500);
  }
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await calmCotizaia(page);
  await shot(page, path.join(dir, "03.webp"));
  shots.push({ src: "/projects/cotizaia/03.webp", caption: "Agent seven stage run for one brief" });
  return shots;
}

const CAPTURERS = { retoma: captureRetoma, acompana: captureAcompana, "hand-hygiene-watch": captureWatch, lumenfall: captureLumenfall, cantrack: captureCantrack, cotizaia: captureCotizaia };

const SPECS = {
  cantrack: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
  cotizaia: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const DEFAULT_SPEC = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 };

const wanted = process.argv.slice(2);
const slugs = wanted.length ? wanted : ["retoma", "acompana", "hand-hygiene-watch", "lumenfall"];
for (const s of slugs) if (!CAPTURERS[s]) { console.error(`unknown slug ${s}`); process.exit(1); }

const srv = await startServer(DEMO);
const port = srv.address().port;
const localBase = `http://127.0.0.1:${port}`;
const liveCotizaia = (process.env.COTIZAIA_URL || "https://frontend-cotizaia-swart.vercel.app/").replace(/\/*$/, "/");
const browser = await chromium.launch(process.env.E2E_CHROME ? { executablePath: process.env.E2E_CHROME } : {});
try {
  for (const slug of slugs) {
    const dir = path.join(PUB, slug);
    fs.mkdirSync(dir, { recursive: true });
    const base = slug === "cotizaia" ? liveCotizaia : localBase;
    const spec = SPECS[slug] || DEFAULT_SPEC;
    const ctx = await browser.newContext({ viewport: spec.viewport, deviceScaleFactor: spec.deviceScaleFactor });
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
