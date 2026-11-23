// Schreibt die Ergebnisse als Markdown-Bericht, CSV (für Excel/CRM) und JSON.
import fs from "node:fs";
import path from "node:path";

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function leadMarkdown(lead, i) {
  const { company: c, analyse: a, pitch: p } = lead;
  const out = [];
  out.push(`## ${i + 1}. ${c.name} — Chance: ${a.chance} (${a.score}/100)`);
  out.push("");
  out.push([
    c.kategorie && `**Kategorie:** ${c.kategorie}`,
    c.adresse && `**Adresse:** ${c.adresse}`,
    c.telefon && `**Telefon:** ${c.telefon}`,
    c.email && `**E-Mail:** ${c.email}`,
    `**Website:** ${c.website ? c.website : "keine"}`,
    `**Quelle:** [OpenStreetMap](${c.osm})`,
  ].filter(Boolean).join("  \n"));
  out.push("");

  if (p) {
    out.push(`> ${p.kurzfazit}`, "");
    out.push("### Schwachstellen", "");
    for (const s of p.top_schwachstellen) out.push(`- **${s.problem}** – ${s.folge_fuer_kunden}`);
    out.push("", "### Verkaufsargumente", "");
    for (const s of p.verkaufsargumente) out.push(`- ${s}`);
    out.push("", "### Gesprächseinstieg", "", `„${p.gespraechseinstieg}“`, "");
    out.push("### Einwände & Antworten", "");
    for (const e of p.einwaende) out.push(`- *„${e.einwand}“* → ${e.antwort}`);
    out.push("", "### Angebotsempfehlung", "", p.angebot, "");
    out.push("<details><summary>E-Mail-Entwurf (Nachfass nach Gespräch)</summary>", "");
    out.push(`**Betreff:** ${p.email_betreff}`, "", p.email_text, "", "</details>", "");
  }

  out.push(p ? "<details><summary>Alle technischen Befunde</summary>\n" : "### Befunde\n");
  if (!a.schwachstellen.length) out.push("- Keine auffälligen Schwächen gefunden.");
  for (const s of a.schwachstellen) out.push(`- [${s.schwere}] **${s.problem}** – ${s.detail}`);
  if (p) out.push("", "</details>");
  if (lead.fehler) out.push("", `_KI-Auswertung fehlgeschlagen: ${lead.fehler}_`);
  out.push("", "---", "");
  return out.join("\n");
}

function csv(leads) {
  const cols = ["Rang", "Name", "Chance", "Score", "Kategorie", "Adresse", "Telefon", "E-Mail", "Website", "Top-Schwachstellen", "Gesprächseinstieg", "OSM"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = leads.map((l, i) => [
    i + 1, l.company.name, l.analyse.chance, l.analyse.score, l.company.kategorie, l.company.adresse,
    l.company.telefon, l.company.email, l.company.website || "keine",
    l.analyse.schwachstellen.slice(0, 4).map((s) => s.problem).join("; "),
    l.pitch?.gespraechseinstieg || "", l.company.osm,
  ].map(q).join(";"));
  return "﻿" + [cols.map(q).join(";"), ...rows].join("\r\n"); // BOM + ; für deutsches Excel
}

export function writeReports(leads, { region, branche, outDir, geo }) {
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  const slug = `${region}-${branche || "alle"}`.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/^-|-$/g, "");
  const base = path.join(outDir, `${slug}-${stamp}`);

  const ohne = leads.filter((l) => !l.company.website).length;
  const head = [
    `# Akquise-Liste: ${branche || "alle Branchen"} in ${region}`,
    "",
    `Erstellt am ${new Date().toLocaleString("de-DE")} · Mittelpunkt: ${geo?.name || region}`,
    "",
    `**${leads.length} Unternehmen** geprüft · **${ohne} ohne Website** · **${leads.filter((l) => l.analyse.score >= 35).length} mit hoher Chance**`,
    "",
    "| # | Unternehmen | Chance | Score | Größte Schwachstelle | Telefon |",
    "|---|---|---|---|---|---|",
    ...leads.map((l, i) => `| ${i + 1} | ${esc(l.company.name)} | ${l.analyse.chance} | ${l.analyse.score} | ${esc(l.analyse.schwachstellen[0]?.problem || "–")} | ${esc(l.company.telefon)} |`),
    "",
    "---",
    "",
  ].join("\n");

  fs.writeFileSync(`${base}.md`, head + leads.map(leadMarkdown).join("\n"));
  fs.writeFileSync(`${base}.csv`, csv(leads));
  fs.writeFileSync(`${base}.json`, JSON.stringify(leads, null, 2));
  return { md: `${base}.md`, csv: `${base}.csv`, json: `${base}.json` };
}
