#!/usr/bin/env node
// Verifica che ogni scheda del manifest stia dentro una pagina A5.
//
// .a5-page è `overflow: hidden`: il testo in eccesso sparisce senza lasciare
// traccia, quindi rileggere la scheda a occhio non basta. Qui ogni scheda
// viene renderizzata davvero, con il CSS e i font del sito, e si misura di
// quanto l'ultimo elemento supera il fondo dell'area di contenuto.
//
// Uso:
//   node scripts/check_overflow.mjs             # tutte le schede
//   node scripts/check_overflow.mjs <id> ...    # solo alcune schede
//   node scripts/check_overflow.mjs --pdf <dir> # + PDF delle schede in eccesso
//   node scripts/check_overflow.mjs --png <dir> # + PNG, per guardare cosa taglia
//
// Con --pdf/--png e id espliciti si rendono le schede indicate anche se stanno
// dentro la pagina, per riguardarne una appena riscritta.
//
// Esce con codice 1 se almeno una scheda sfora. Nessuna dipendenza da
// installare: usa il Chrome di sistema in headless.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Altezza di una riga di testo nella scheda: font-size 8pt, line-height 1.4.
const LINE_PX = ((8 * 96) / 72) * 1.4;
const PX_PER_MM = 96 / 25.4;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const HEAD = `<meta charset="UTF-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/css/style.css" />`;

// Pagina di misura: una .a5-page vuota in cui iniettare le schede una a una.
// Il risultato finisce in #result, da dove lo rilegge --dump-dom.
//
// Si guarda il bordo inferiore più basso fra i figli invece di scrollHeight,
// che in Chrome non include il padding inferiore e sottostimerebbe l'eccesso.
const probePage = (files) => `<!DOCTYPE html>
<html lang="it"><head>${HEAD}<style>body{margin:0}</style></head>
<body><div id="probe" class="a5-page"></div><pre id="result"></pre>
<script>
(async () => {
  const files = ${JSON.stringify(files)};
  const probe = document.getElementById("probe");
  // Playpen Sans è largo: misurare col fallback darebbe numeri più piccoli e
  // diversi a ogni esecuzione. Si aspettano i font veri e si verifica che ci
  // siano, invece di produrre una misura silenziosamente sbagliata.
  const faces = ['8pt "Playpen Sans"', '700 8pt "Playpen Sans"', '8pt "Space Mono"'];
  await Promise.all(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  const missing = faces.filter((f) => !document.fonts.check(f));
  if (missing.length > 0) {
    document.getElementById("result").textContent = JSON.stringify({ error: missing });
    return;
  }
  const out = [];
  for (const [id, file] of files) {
    probe.innerHTML = await (await fetch(file)).text();
    const style = getComputedStyle(probe);
    const rect = probe.getBoundingClientRect();
    const top = rect.top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop);
    const bottom = rect.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
    let used = top;
    for (const el of probe.children) used = Math.max(used, el.getBoundingClientRect().bottom);
    out.push({ id, used: used - top, available: bottom - top });
  }
  document.getElementById("result").textContent = JSON.stringify(out);
})();
</script></body></html>`;

// Pagina di stampa di una singola scheda, per il controllo visivo in PDF.
const cardPage = (file) => `<!DOCTYPE html>
<html lang="it"><head>${HEAD}
<style>
  @page { size: 148mm 210mm; margin: 0; }
  body { margin: 0; }
  .a5-page { border: none; box-shadow: none; }
</style></head>
<body><div id="probe" class="a5-page"></div>
<script>
fetch(${JSON.stringify(file)})
  .then((r) => r.text())
  .then((h) => { document.getElementById("probe").innerHTML = h; });
</script></body></html>`;

async function startServer(pages) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(req.url.split("?")[0]);
    if (pages[path]) {
      res.writeHead(200, { "Content-Type": MIME[".html"] });
      res.end(pages[path]);
      return;
    }
    try {
      const body = await readFile(join(ROOT, path));
      res.writeHead(200, { "Content-Type": MIME[extname(path)] || "text/plain" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, port: server.address().port };
}

async function chrome(args) {
  const { stdout } = await execFileAsync(
    CHROME,
    ["--headless", "--disable-gpu", "--no-first-run", ...args],
    { maxBuffer: 64 * 1024 * 1024 }
  );
  return stdout;
}

const args = process.argv.slice(2);
const pdfIndex = args.indexOf("--pdf");
const pdfDir = pdfIndex === -1 ? null : args[pdfIndex + 1];
const pngIndex = args.indexOf("--png");
const pngDir = pngIndex === -1 ? null : args[pngIndex + 1];
// Gli argomenti dei flag non sono id di schede.
const flagValues = new Set([pdfIndex, pngIndex].filter((i) => i !== -1).map((i) => i + 1));
const onlyIds = args.filter((a, i) => !a.startsWith("--") && !flagValues.has(i));

const manifest = JSON.parse(await readFile(join(ROOT, "manifest.json"), "utf8"));
const entries = manifest.filter(
  (e) => e.group !== "Guida" && (onlyIds.length === 0 || onlyIds.includes(e.id))
);
if (entries.length === 0) {
  console.error("Nessuna scheda da controllare.");
  process.exit(2);
}

const pages = { "/__probe.html": probePage(entries.map((e) => [e.id, "/" + e.file])) };
for (const entry of entries) pages[`/__card-${entry.id}.html`] = cardPage("/" + entry.file);

const { server, port } = await startServer(pages);
const base = `http://127.0.0.1:${port}`;

const dom = await chrome([
  `--virtual-time-budget=${Math.max(20000, entries.length * 200)}`,
  "--dump-dom",
  `${base}/__probe.html`,
]);
const match = dom.match(/<pre id="result">(.*?)<\/pre>/s);
if (!match || !match[1]) {
  server.close();
  console.error("Misura non riuscita: la pagina di prova non ha prodotto risultati.");
  process.exit(2);
}

const measured = JSON.parse(match[1]);
if (!Array.isArray(measured)) {
  console.error(`Font non caricati (${measured.error.join(", ")}): misura non attendibile.`);
  process.exit(2);
}
const byId = Object.fromEntries(measured.map((r) => [r.id, r]));
const rows = entries
  .map((entry) => ({ ...entry, ...byId[entry.id], over: byId[entry.id].used - byId[entry.id].available }))
  .sort((a, b) => b.over - a.over);
const over = rows.filter((r) => r.over > 0);
// Con id espliciti si rendono quelli chiesti, anche se stanno dentro: serve a
// guardare una scheda appena riscritta.
const toRender = onlyIds.length > 0 ? rows : over;

if (pdfDir) {
  if (!existsSync(pdfDir)) mkdirSync(pdfDir, { recursive: true });
  for (const row of toRender) {
    await chrome([
      "--virtual-time-budget=5000",
      "--no-pdf-header-footer",
      `--print-to-pdf=${join(pdfDir, `${row.id}.pdf`)}`,
      `${base}/__card-${row.id}.html`,
    ]);
  }
  console.log(`PDF in ${pdfDir}/\n`);
}

if (pngDir) {
  if (!existsSync(pngDir)) mkdirSync(pngDir, { recursive: true });
  for (const row of toRender) {
    await chrome([
      "--virtual-time-budget=5000",
      // 148x210mm a 96dpi: la scheda inquadrata esattamente come viene stampata.
      "--window-size=559,794",
      `--screenshot=${join(pngDir, `${row.id}.png`)}`,
      `${base}/__card-${row.id}.html`,
    ]);
  }
  console.log(`PNG in ${pngDir}/\n`);
}

server.close();

const pad = (s, n) => String(s).padEnd(n);
const mm = (px) => `${(px / PX_PER_MM).toFixed(0)}mm`;
console.log(pad("scheda", 48) + pad("usato", 8) + pad("capienza", 10) + "eccesso");
// Oltre alle schede in eccesso si mostrano quelle che ci arrivano vicino:
// bastano poche righe aggiunte per farle sparire dal fondo.
for (const row of rows.filter((r) => r.over > -LINE_PX * 3)) {
  const excess = row.over > 0 ? `+${row.over.toFixed(0)}px (~${(row.over / LINE_PX).toFixed(1)} righe)` : "-";
  console.log(pad(row.id, 48) + pad(mm(row.used), 8) + pad(mm(row.available), 10) + excess);
}
console.log(`\n${over.length}/${rows.length} schede oltre il fondo pagina.`);
process.exit(over.length === 0 ? 0 : 1);
