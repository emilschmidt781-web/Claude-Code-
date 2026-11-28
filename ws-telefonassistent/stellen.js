// Lädt die offenen Stellen aus Rickys Google-Tabelle (Reiter „Stellen“), damit der
// Assistent am Telefon sagen kann, was gerade offen ist. Zwischenspeicher: 10 Minuten.
import { TABELLE_LINK } from "./config.js";

let cache = { zeit: 0, text: "" };

function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const key = (t) =>
  String(t || "").toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z]/g, "");

export async function offeneStellen() {
  if (Date.now() - cache.zeit < 10 * 60 * 1000 && cache.text) return cache.text;

  const id = (TABELLE_LINK.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/) || [])[1];
  if (!id) return "Keine Stellenliste hinterlegt.";
  try {
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=Stellen`;
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const text = await r.text();
    if (!r.ok || /^\s*</.test(text)) throw new Error("keine CSV");

    const [kopf, ...zeilen] = parseCSV(text);
    const spalten = kopf.map(key);
    const wert = (z, ...namen) => {
      for (const n of namen) {
        const i = spalten.indexOf(n);
        if (i >= 0 && z[i]?.trim()) return z[i].trim();
      }
      return "";
    };
    const liste = zeilen
      .filter((z) => wert(z, "titel", "stelle", "beruf"))
      .filter((z) => !/^(nein|n|no|0|false|aus|inaktiv|besetzt)$/i.test(wert(z, "aktiv")))
      .map((z) =>
        [wert(z, "id", "nr"), wert(z, "titel", "stelle", "beruf"), wert(z, "ort"), wert(z, "art"), wert(z, "beschreibung")]
          .filter(Boolean)
          .join(" | "),
      );
    cache = { zeit: Date.now(), text: liste.length ? liste.join("\n") : "Aktuell sind keine Stellen eingetragen." };
  } catch (err) {
    console.warn("[Stellen] Tabelle nicht geladen:", err.message);
    cache = { zeit: Date.now() - 9 * 60 * 1000, text: "Die Stellenliste ist gerade nicht abrufbar. Verweise auf die Website oder den Rückruf." };
  }
  return cache.text;
}
