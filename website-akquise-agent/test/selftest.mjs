// Offline-Selbsttest: simuliert Nominatim, Overpass und zwei Firmen-Websites lokal.
import http from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

const ALT = `<html><head><title>Home</title><link href="https://fonts.googleapis.com/css?family=Arial" rel="stylesheet">
<script src="/js/jquery-1.8.3.min.js"></script><script>gtag('config','UA-1')</script></head>
<body><table width="800" bgcolor="#fff"><tr><td><font size=3>Willkommen bei Friseur Alt</font>
<img src="a.jpg"><img src="b.jpg"><img src="c.jpg"><img src="d.jpg">
<p>© 2015 Friseur Alt</p></td></tr></table></body></html>`;

const MODERN = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Salon Modern – Friseur in Bamberg</title><meta name="description" content="Ihr Friseur in Bamberg.">
<meta property="og:image" content="/og.jpg"><link rel="icon" href="/f.ico">
<script type="application/ld+json">{"@type":"HairSalon"}</script></head><body>
<h1>Salon Modern</h1><a href="tel:+49951123">Anrufen</a><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a>
<a href="https://shore.com/book">Termin online buchen</a><form><input name="email"><textarea></textarea></form>
<p>${"Schnitt Farbe Pflege Beratung ".repeat(60)}</p><p>© ${new Date().getFullYear()} Salon Modern</p></body></html>`;

const server = http.createServer((req, res) => {
  const port = server.address().port;
  if (req.url.startsWith("/search")) {
    res.setHeader("content-type", "application/json");
    return res.end(JSON.stringify([{ lat: "49.89", lon: "10.89", display_name: "Bamberg, Bayern" }]));
  }
  if (req.url.startsWith("/interpreter")) {
    res.setHeader("content-type", "application/json");
    return res.end(JSON.stringify({ elements: [
      { type: "node", id: 1, tags: { name: "Friseur Alt", shop: "hairdresser", website: `http://127.0.0.1:${port}/alt`, phone: "0951 1", "addr:street": "Hauptstr.", "addr:housenumber": "1", "addr:postcode": "96047", "addr:city": "Bamberg" } },
      { type: "node", id: 2, tags: { name: "Salon Modern", shop: "hairdresser", website: `http://127.0.0.1:${port}/modern` } },
      { type: "node", id: 3, tags: { name: "Haarstudio Ohne", shop: "hairdresser", phone: "0951 3" } },
      { type: "node", id: 4, tags: { name: "Cut & Style", shop: "hairdresser", website: "https://www.facebook.com/cutstyle" } },
      { type: "node", id: 5, tags: { name: "Tot GmbH", shop: "hairdresser", website: "http://127.0.0.1:1/" } },
    ] }));
  }
  res.setHeader("content-type", "text/html");
  res.end(req.url === "/alt" ? ALT : MODERN);
});

server.listen(0, "127.0.0.1", async () => {
  const port = server.address().port;
  const out = fs.mkdtempSync(path.join(here, "out-"));
  try {
    const { stderr } = await run(process.execPath, [path.join(here, "..", "agent.mjs"), "--region", "Bamberg", "--branche", "friseur", "--no-ai", "--min-score", "0", "--out", out], {
      env: { ...process.env, NOMINATIM_URL: `http://127.0.0.1:${port}/search`, OVERPASS_URL: `http://127.0.0.1:${port}/interpreter` },
      timeout: 60000,
    });
    console.log(stderr);
    const json = JSON.parse(fs.readFileSync(path.join(out, fs.readdirSync(out).find((f) => f.endsWith(".json"))), "utf8"));
    const by = Object.fromEntries(json.map((l) => [l.company.name, l.analyse]));
    const check = (cond, msg) => { if (!cond) { console.error("❌", msg); process.exitCode = 1; } else console.log("✔", msg); };
    check(by["Haarstudio Ohne"].score === 100, "Firma ohne Website = Score 100");
    check(by["Cut & Style"].schwachstellen[0].problem.includes("Social"), "Nur-Facebook erkannt");
    check(by["Tot GmbH"].schwachstellen[0].problem.includes("nicht erreichbar"), "Nicht erreichbare Seite erkannt");
    const altProbleme = by["Friseur Alt"].schwachstellen.map((s) => s.problem).join(" | ");
    for (const k of ["HTTPS", "Smartphones", "Impressum", "Google Fonts", "Cookie-Banner", "Copyright 2015", "Veraltete Technik", "jQuery"])
      check(altProbleme.includes(k), `Alte Seite: ${k}`);
    const modern = by["Salon Modern"].schwachstellen.map((s) => s.problem);
    check(modern.length === 1 && modern[0].includes("HTTPS"), `Moderne Seite: nur HTTPS bemängelt (Testserver ist http) – ${modern.join(", ")}`);
    check(json[0].analyse.score >= json[json.length - 1].analyse.score, "Sortierung nach Score");
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    server.close();
  }
});
