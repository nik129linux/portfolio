// Judge for the clean screen capture. Run: node tools/screens/check.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const slugs = ["retoma", "acompana", "hand-hygiene-watch", "lumenfall"];
let fail = 0;
const bad = (m) => { console.log("FAIL", m); fail++; };
const gray = (f) => execFileSync("ffmpeg", ["-v", "error", "-i", f, "-vf", "scale=64:40,format=gray", "-f", "rawvideo", "-"]);

for (const s of slugs) {
  const man = `public/projects/${s}/screens.json`;
  if (!fs.existsSync(man)) { bad(`${man} missing`); continue; }
  const screens = JSON.parse(fs.readFileSync(man, "utf8"));
  if (!Array.isArray(screens) || screens.length < 4 || screens.length > 6) bad(`${s} has ${screens.length} screens, want 4-6`);
  const sigs = [];
  for (const sc of screens) {
    if (typeof sc.caption !== "string" || sc.caption.length < 3 || sc.caption.length > 60) bad(`${s} caption "${sc.caption}" must be 3-60 chars`);
    const f = `public${sc.src}`;
    if (!sc.src?.startsWith(`/projects/${s}/`) || !f.endsWith(".webp") || !fs.existsSync(f)) { bad(`${s} ${sc.src} missing or not webp`); continue; }
    const p = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "json", f]).toString()).streams[0];
    if (p.width !== 1280 || p.height !== 800) bad(`${f} is ${p.width}x${p.height}, want 1280x800`);
    const kb = fs.statSync(f).size / 1024;
    if (kb > 250) bad(`${f} ${kb.toFixed(0)}KB > 250KB`);
    const g = gray(f); const mean = g.reduce((a, b) => a + b, 0) / g.length;
    const sd = Math.sqrt(g.reduce((a, b) => a + (b - mean) ** 2, 0) / g.length);
    if (sd < 8) bad(`${f} looks blank (stddev ${sd.toFixed(1)})`);
    sigs.push([f, g]);
  }
  for (let i = 1; i < sigs.length; i++) {
    let d = 0; const [fa, a] = sigs[i - 1], [fb, b] = sigs[i];
    for (let k = 0; k < a.length; k++) d += Math.abs(a[k] - b[k]);
    if (d / a.length < 3) bad(`${fb} is almost identical to ${fa} (diff ${(d / a.length).toFixed(1)}): show a different state`);
  }
}
console.log(fail ? `${fail} FAIL` : "ALL PASS");
process.exit(fail ? 1 : 0);
