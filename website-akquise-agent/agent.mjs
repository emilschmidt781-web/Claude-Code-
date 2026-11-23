#!/usr/bin/env node
// Website-Akquise-Agent
// Findet Unternehmen in einer Region, prüft ihre Website auf Schwachstellen
// und erstellt mit Claude Verkaufsargumente, Gesprächseinstieg und Einwandbehandlung.
//
//   node agent.mjs --region "Bamberg" --branche friseur
//   node agent.mjs --region "Würzburg" --branche alle --radius 3 --limit 40
//   node agent.mjs --region "Erlangen" --tag craft=plumber --no-ai

import { parseArgs } from "node:util";
import { findCompanies, BRANCHEN } from "./lib/search.mjs";
import { analyzeCompany, scoreFindings } from "./lib/analyze.mjs";
import { createClient, salesPitch } from "./lib/ai.mjs";
import { writeReports } from "./lib/report.mjs";

const { values: o } = parseArgs({
  options: {
    region: { type: "string", short: "r" },
    branche: { type: "string", short: "b", default: "alle" },
    tag: { type: "string" },
    radius: { type: "string", default: "5" },
    limit: { type: "string", short: "n", default: "30" },
    "min-score": { type: "string", default: "15" },
    "ai-top": { type: "string", default: "15" },
    "no-ai": { type: "boolean", default: false },
    model: { type: "string", default: process.env.AKQUISE_MODEL || "claude-opus-5-5" },
    absender: { type: "string", default: process.env.AKQUISE_ABSENDER || "" },
    out: { type: "string", default: "berichte" },
    help: { type: "boolean", short: "h" },
  },
});

if (o.help || !o.region) {
  console.log(`
Website-Akquise-Agent – findet Betriebe mit schwacher oder fehlender Website.

  node agent.mjs --region "<Ort>" [Optionen]

Optionen:
  -r, --region     Ort/Stadtteil, z. B. "Bamberg" oder "Nürnberg Gostenhof"  (Pflicht)
  -b, --branche    Branche (Standard: alle). Bekannt:
                   ${Object.keys(BRANCHEN).join(", ")}
      --tag        Eigener OSM-Filter statt Branche, z. B. craft=plumber
      --radius     Suchradius in km (Standard: 5)
  -n, --limit      Max. Anzahl Unternehmen, die geprüft werden (Standard: 30)
      --min-score  Nur Leads ab diesem Score in den Bericht (Standard: 15)
      --ai-top     Nur für die besten N Leads Verkaufsargumente erzeugen (Standard: 15)
      --no-ai      Ohne Claude – nur technische Befunde
      --model      Claude-Modell (Standard: claude-opus-5-5)
      --absender   Name/Agentur für den E-Mail-Entwurf
      --out        Ausgabeordner (Standard: berichte)
`);
  process.exit(o.help ? 0 : 1);
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }));
  return results;
}

const log = (...a) => console.error(...a);

log(`🔎 Suche ${o.tag || o.branche} im Umkreis von ${o.radius} km um „${o.region}“ …`);
const { geo, companies, total } = await findCompanies({
  region: o.region, branche: o.branche, tag: o.tag, radiusKm: Number(o.radius), limit: Number(o.limit),
});
log(`   ${total} Betriebe gefunden, prüfe ${companies.length} (${geo.name})`);
if (!companies.length) process.exit(0);

log("🌐 Prüfe Websites …");
let done = 0;
let leads = await pool(companies, 6, async (company) => {
  const facts = await analyzeCompany(company).catch((e) => ({ status: "nicht_erreichbar", fehler: e.message }));
  const analyse = scoreFindings(facts);
  log(`   [${++done}/${companies.length}] ${company.name.padEnd(40).slice(0, 40)} ${String(analyse.score).padStart(3)} · ${analyse.schwachstellen[0]?.problem || "ok"}`);
  return { company, fakten: facts, analyse };
});

leads = leads.filter((l) => l.analyse.score >= Number(o["min-score"])).sort((a, b) => b.analyse.score - a.analyse.score);
log(`   ${leads.length} Leads mit Score ≥ ${o["min-score"]}`);

if (!o["no-ai"] && leads.length) {
  const top = leads.slice(0, Number(o["ai-top"]));
  log(`🤖 Erstelle Verkaufsargumente für ${top.length} Leads mit ${o.model} …`);
  const client = createClient();
  done = 0;
  await pool(top, 3, async (lead) => {
    try {
      lead.pitch = await salesPitch(client, lead.company, lead.analyse, { model: o.model, absender: o.absender });
    } catch (e) {
      lead.fehler = e.message;
      log(`   ⚠️  ${lead.company.name}: ${e.message}`);
    }
    log(`   [${++done}/${top.length}] ${lead.company.name}`);
  });
}

const files = writeReports(leads, { region: o.region, branche: o.tag || o.branche, outDir: o.out, geo });
log(`\n✅ Fertig:\n   Bericht: ${files.html}\n   Markdown: ${files.md}\n   Tabelle: ${files.csv}\n   Rohdaten: ${files.json}`);
console.log(files.html); // letzte Zeile auf stdout: Pfad zum Bericht (für die Mac-App)
