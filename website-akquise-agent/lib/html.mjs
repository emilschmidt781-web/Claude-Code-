// Lesbarer HTML-Bericht (öffnet im Browser, druckbar als PDF).

const e = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const nl = (s) => e(s).replace(/\n/g, "<br>");
const CHANCE = { "sehr hoch": "c4", hoch: "c3", mittel: "c2", gering: "c1" };

function lead(l, i) {
  const { company: c, analyse: a, pitch: p } = l;
  const kontakt = [
    c.adresse && e(c.adresse),
    c.telefon && `<a href="tel:${e(c.telefon.replace(/[^\d+]/g, ""))}">${e(c.telefon)}</a>`,
    c.email && `<a href="mailto:${e(c.email)}">${e(c.email)}</a>`,
    c.website ? `<a href="${e(c.website)}" target="_blank" rel="noopener">${e(c.website.replace(/^https?:\/\//, ""))}</a>` : "<b>keine Website</b>",
    `<a href="${e(c.osm)}" target="_blank" rel="noopener">Karte</a>`,
  ].filter(Boolean).join(" · ");

  const befunde = a.schwachstellen.map((s) => `<li><span class="tag ${s.schwere}">${s.schwere}</span> <b>${e(s.problem)}</b> – ${e(s.detail)}</li>`).join("");

  let pitch = "";
  if (p) {
    pitch = `
      <p class="fazit">${e(p.kurzfazit)}</p>
      <div class="grid">
        <section><h4>Schwachstellen</h4><ul>${p.top_schwachstellen.map((s) => `<li><b>${e(s.problem)}</b><br><span class="muted">${e(s.folge_fuer_kunden)}</span></li>`).join("")}</ul></section>
        <section><h4>Verkaufsargumente</h4><ul>${p.verkaufsargumente.map((s) => `<li>${e(s)}</li>`).join("")}</ul></section>
      </div>
      <section class="einstieg"><h4>Gesprächseinstieg</h4><p>„${e(p.gespraechseinstieg)}“</p></section>
      <section><h4>Einwände &amp; Antworten</h4><dl>${p.einwaende.map((x) => `<dt>„${e(x.einwand)}“</dt><dd>${e(x.antwort)}</dd>`).join("")}</dl></section>
      <section><h4>Angebotsempfehlung</h4><p>${nl(p.angebot)}</p></section>
      <details><summary>E-Mail-Entwurf (zum Nachfassen nach einem Gespräch)</summary>
        <p><b>Betreff:</b> ${e(p.email_betreff)}</p><p>${nl(p.email_text)}</p></details>`;
  }
  return `
  <article id="l${i + 1}">
    <header><span class="rank">${i + 1}</span><div><h3>${e(c.name)}</h3><div class="muted small">${e(c.kategorie)}</div></div>
      <span class="chance ${CHANCE[a.chance]}">${e(a.chance)} · ${a.score}</span></header>
    <div class="kontakt small">${kontakt}</div>
    ${pitch}
    ${l.fehler ? `<p class="warn">KI-Auswertung fehlgeschlagen: ${e(l.fehler)}</p>` : ""}
    <details ${p ? "" : "open"}><summary>Alle technischen Befunde (${a.schwachstellen.length})</summary><ul class="befunde">${befunde || "<li>Keine auffälligen Schwächen.</li>"}</ul></details>
  </article>`;
}

export function renderHtml(leads, { region, branche, geo }) {
  const ohne = leads.filter((l) => !l.company.website).length;
  const hoch = leads.filter((l) => l.analyse.score >= 35).length;
  const rows = leads.map((l, i) => `<tr><td>${i + 1}</td><td><a href="#l${i + 1}">${e(l.company.name)}</a></td><td><span class="chance ${CHANCE[l.analyse.chance]}">${l.analyse.score}</span></td><td>${e(l.analyse.schwachstellen[0]?.problem || "–")}</td><td>${e(l.company.telefon)}</td></tr>`).join("");
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Akquise ${e(region)}</title>
<style>
:root{--bg:#f6f5f2;--card:#fff;--ink:#1c1b19;--muted:#6b6760;--line:#e4e1da;--acc:#2f5d50}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--card:#201f1d;--ink:#ecebe7;--muted:#a19d95;--line:#34322e;--acc:#7fc1ad}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{max-width:920px;margin:0 auto;padding:32px 16px 80px}h1{font-size:28px;margin:0 0 4px}h3{margin:0;font-size:19px}h4{margin:18px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
a{color:var(--acc)}.muted{color:var(--muted)}.small{font-size:13px}
.stats{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}.stats div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 16px}.stats b{display:block;font-size:24px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:14px}td,th{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{color:var(--muted);font-weight:600}
.tablewrap{overflow-x:auto}
article{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;margin-top:20px}
article header{display:flex;gap:12px;align-items:center}article header>div{flex:1}.rank{width:32px;height:32px;border-radius:50%;background:var(--bg);display:grid;place-items:center;font-weight:700}
.kontakt{margin:10px 0 0}.chance{display:inline-block;border-radius:999px;padding:3px 10px;font-size:13px;font-weight:600;white-space:nowrap}
.c4{background:#c8462e;color:#fff}.c3{background:#e39b2d;color:#1c1b19}.c2{background:#e6dcb8;color:#1c1b19}.c1{background:var(--line);color:var(--ink)}
.fazit{font-size:16px;border-left:3px solid var(--acc);padding-left:12px;margin:16px 0 0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}@media(max-width:640px){.grid{grid-template-columns:1fr}}
ul{padding-left:18px;margin:0}li{margin:4px 0}.einstieg p{background:var(--bg);border-radius:10px;padding:12px;margin:0;font-style:italic}
dt{font-weight:600;margin-top:8px}dd{margin:2px 0 0}details{margin-top:14px}summary{cursor:pointer;color:var(--acc);font-weight:600}
.tag{font-size:11px;border-radius:4px;padding:1px 6px;background:var(--line)}.tag.hoch{background:#c8462e;color:#fff}.tag.mittel{background:#e39b2d;color:#1c1b19}
.befunde{margin-top:8px}.warn{color:#c8462e}
@media print{details{display:block}details>*{display:block}article{break-inside:avoid}}
</style></head><body><main>
<h1>${e(branche && branche !== "alle" ? branche[0].toUpperCase() + branche.slice(1) : "Alle Branchen")} in ${e(region)}</h1>
<div class="muted small">Erstellt am ${new Date().toLocaleString("de-DE")} · ${e(geo?.name || "")} · Daten © OpenStreetMap-Mitwirkende</div>
<div class="stats"><div><b>${leads.length}</b>Leads</div><div><b>${ohne}</b>ohne Website</div><div><b>${hoch}</b>hohe Chance</div></div>
<div class="tablewrap"><table><thead><tr><th>#</th><th>Unternehmen</th><th>Score</th><th>Größte Schwachstelle</th><th>Telefon</th></tr></thead><tbody>${rows}</tbody></table></div>
${leads.map(lead).join("")}
<p class="muted small" style="margin-top:32px">Hinweis: Unaufgeforderte Werbe-E-Mails sind auch an Firmen unzulässig (§ 7 UWG). Leads ohne Website vor der Kontaktaufnahme kurz per Google prüfen. Rechtliche Hinweise sind Risikohinweise, keine Rechtsberatung.</p>
</main></body></html>`;
}
