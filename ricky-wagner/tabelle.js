// Stellen und Bewerberprofile aus einer Google-Tabelle laden.
//
// So funktioniert's:
// 1. Google-Tabelle mit zwei Reitern anlegen: „Stellen“ und „Bewerber“
//    (Spaltennamen siehe Anleitung im README, Reihenfolge egal).
// 2. Tabelle freigeben: „Jeder mit dem Link“ → „Betrachter“.
// 3. Den Link der Tabelle unten bei TABELLE_LINK eintragen.
//
// Danach reicht es, die Tabelle zu bearbeiten – die Website zeigt die Änderungen
// beim nächsten Neuladen. Spalte „Aktiv“ auf „nein“ blendet eine Zeile aus.
//
// Ist kein Link eingetragen oder Google nicht erreichbar, nutzt die Seite die
// Einträge aus profile.js.
window.TABELLE_LINK = "https://docs.google.com/spreadsheets/d/1-UXAy4WqYImnuti6D9bJHEzjnCL9rO40RIPSQFrRwMw/edit";

(() => {
  const link = (window.TABELLE_LINK || "").trim();
  const idMatch = link.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/);
  if (!idMatch) {
    window.PROFILE_READY = Promise.resolve();
    return;
  }
  const id = idMatch[1];
  const csvUrl = (sheet) =>
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}&_=${Date.now()}`;

  // CSV-Parser (Anführungszeichen, Kommas und Zeilenumbrüche in Zellen)
  const parseCSV = (text) => {
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
    return rows;
  };

  const key = (t) =>
    String(t || "").toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z]/g, "");

  // Zeilen als Objekte mit vereinheitlichten Spaltennamen
  const toObjects = (text) => {
    const rows = parseCSV(text).filter((r) => r.some((c) => c.trim()));
    if (rows.length < 1) return [];
    const head = rows[0].map(key);
    return rows.slice(1).map((r) => {
      const o = {};
      head.forEach((h, i) => { if (h) o[h] = (r[i] || "").trim(); });
      return o;
    });
  };

  const pick = (o, ...names) => { for (const n of names) if (o[n]) return o[n]; return ""; };
  const aktiv = (o) => !/^(nein|n|no|0|false|aus|x?inaktiv|besetzt)$/i.test(pick(o, "aktiv", "online", "sichtbar"));
  const bereich = (v) => (/kauf/i.test(v) ? "kaufmaennisch" : "technisch");
  const liste = (v) => String(v || "").split(/\s*(?:;|\n|•)\s*/).map((s) => s.replace(/^[-–]\s*/, "").trim()).filter(Boolean);
  const cleanId = (v, fallback) => (String(v || "").trim().replace(/[^A-Za-z0-9_-]+/g, "-") || fallback);

  const mapStellen = (rows) =>
    rows.filter((o) => pick(o, "titel", "stelle", "beruf") && aktiv(o)).map((o, i) => ({
      id: cleanId(pick(o, "id", "nr", "nummer"), `S-${i + 1}`),
      titel: pick(o, "titel", "stelle", "beruf"),
      bereich: bereich(pick(o, "bereich")),
      kategorie: pick(o, "kategorie"),
      ort: pick(o, "ort"),
      art: pick(o, "art", "arbeitszeit", "anstellung"),
      text: pick(o, "beschreibung", "text"),
      punkte: liste(pick(o, "punkte", "anforderungen", "vorteile", "stichpunkte")),
    }));

  const mapKandidaten = (rows) =>
    rows.filter((o) => pick(o, "beruf") && aktiv(o)).map((o, i) => ({
      id: cleanId(pick(o, "id", "nr", "nummer"), `K-${i + 1}`),
      beruf: pick(o, "beruf"),
      bereich: bereich(pick(o, "bereich")),
      kategorie: pick(o, "kategorie"),
      erfahrung: pick(o, "erfahrung", "berufserfahrung"),
      region: pick(o, "region", "ort"),
      verfuegbar: pick(o, "verfuegbar", "verfuegbarab"),
      staerken: liste(pick(o, "staerken", "kenntnisse", "punkte")),
    }));

  const load = (sheet) => {
    const ctrl = "AbortController" in window ? new AbortController() : null;
    const t = setTimeout(() => ctrl && ctrl.abort(), 6000);
    return fetch(csvUrl(sheet), { signal: ctrl && ctrl.signal, cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then((text) => {
        // Google liefert bei fehlendem Reiter/fehlender Freigabe HTML statt CSV
        if (/^\s*</.test(text)) throw new Error("keine CSV");
        return toObjects(text);
      })
      .finally(() => clearTimeout(t));
  };

  // Ladehinweis, solange die Tabelle abgefragt wird
  document.documentElement.classList.add("tabelle-laedt");

  window.PROFILE_READY = Promise.allSettled([load("Stellen"), load("Bewerber")]).then(([s, k]) => {
    if (s.status === "fulfilled") window.STELLEN = mapStellen(s.value);
    if (k.status === "fulfilled") window.KANDIDATEN = mapKandidaten(k.value);
    if (s.status === "rejected" || k.status === "rejected") console.warn("[Tabelle] Nicht alles geladen:", s.reason || "", k.reason || "");
    document.documentElement.classList.remove("tabelle-laedt");
  });
})();
