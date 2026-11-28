// Gesprächslogik: Claude führt das Telefonat und nimmt die Bestellung auf.
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import { RESTAURANT, SPEISEKARTE, EXTRAS } from "./config.js";

const client = new Anthropic(); // liest ANTHROPIC_API_KEY aus der Umgebung
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
const BESTELLUNGEN_DATEI = process.env.BESTELLUNGEN_DATEI || "bestellungen.json";

const euro = (n) => n.toFixed(2).replace(".", ",") + " €";

const SYSTEM = `Du bist die freundliche Telefonstimme von "${RESTAURANT.name}" und nimmst telefonisch Essensbestellungen an.

WICHTIG – du sprichst am Telefon:
- Antworte kurz: höchstens zwei, drei Sätze pro Antwort. Keine Listen, kein Markdown, keine Emojis, keine Sonderzeichen.
- Schreib Preise so, wie man sie spricht, z. B. "neun Euro neunzig".
- Stell immer nur eine Frage auf einmal.
- Sprich Deutsch und siez die Anrufer, außer sie duzen dich.

Ablauf einer Bestellung:
1. Gerichte aufnehmen (mit Menge und Sonderwünschen). Lies die Karte nicht komplett vor; nenne auf Nachfrage passende Beispiele.
2. Fragen: Lieferung oder Abholung?
3. Namen erfragen, Rückrufnummer erfragen, bei Lieferung die vollständige Adresse.
4. Bestellung mit Gesamtpreis kurz zusammenfassen und bestätigen lassen.
5. Erst nach dem ausdrücklichen Ja das Werkzeug "bestellung_aufgeben" aufrufen. Danach die Bestellnummer und Wartezeit nennen und dich verabschieden.

Regeln:
- Biete nur an, was auf der Karte steht. Rechne Preise exakt aus der Karte.
- Lieferung nur ins Liefergebiet und ab ${euro(RESTAURANT.lieferung.mindestbestellwert)} Warenwert; Liefergebühr ${euro(RESTAURANT.lieferung.liefergebuehr)}.
- Bei Allergie-Fragen, die du nicht sicher aus der Karte beantworten kannst: sag ehrlich, dass du es nicht sicher weißt, und biete an, dass das Restaurant zurückruft.
- Will jemand nichts bestellen (Reservierung, Beschwerde, etwas anderes), notiere es nicht als Bestellung, sondern sag, dass sich das Team meldet, und verabschiede dich.
- Wenn das Gespräch beendet ist (nach Bestellung oder Verabschiedung), rufe "auflegen" auf.

Restaurant-Infos:
Adresse: ${RESTAURANT.adresse}
Öffnungszeiten: ${RESTAURANT.oeffnungszeiten}
Liefergebiet: ${RESTAURANT.lieferung.gebiet}, Lieferzeit ${RESTAURANT.lieferung.dauer}
Abholung: ${RESTAURANT.abholung.dauer}
Zahlung: ${RESTAURANT.zahlung}

Speisekarte (Nr. – Name – Preis – Info):
${SPEISEKARTE.map((g) => `${g.nr} – ${g.kategorie} ${g.name} – ${euro(g.preis)}${g.info ? " – " + g.info : ""}`).join("\n")}

Extras:
${EXTRAS.map((e) => `${e.name} – ${euro(e.preis)}`).join("\n")}`;

const TOOLS = [
  {
    name: "bestellung_aufgeben",
    description:
      "Speichert die fertige Bestellung und schickt sie in die Küche. Nur aufrufen, nachdem der Anrufer die Zusammenfassung ausdrücklich bestätigt hat.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["positionen", "art", "name", "telefon", "adresse", "anmerkung"],
      properties: {
        positionen: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["nr", "name", "menge", "sonderwunsch"],
            properties: {
              nr: { type: "integer", description: "Nummer auf der Speisekarte" },
              name: { type: "string" },
              menge: { type: "integer" },
              sonderwunsch: { type: "string", description: "z. B. 'extra Käse', sonst leer" },
            },
          },
        },
        art: { type: "string", enum: ["lieferung", "abholung"] },
        name: { type: "string" },
        telefon: { type: "string" },
        adresse: { type: "string", description: "Lieferadresse; bei Abholung leer" },
        anmerkung: { type: "string", description: "sonstige Hinweise, sonst leer" },
      },
    },
  },
  {
    name: "auflegen",
    description: "Beendet das Telefonat, nachdem du dich verabschiedet hast.",
    strict: true,
    input_schema: { type: "object", additionalProperties: false, properties: {}, required: [] },
  },
];

// Preis serverseitig nachrechnen, damit die Küche einen verlässlichen Betrag sieht.
function preisBerechnen(bestellung) {
  let summe = 0;
  for (const p of bestellung.positionen) {
    const gericht = SPEISEKARTE.find((g) => g.nr === p.nr);
    if (!gericht) return { fehler: `Nr. ${p.nr} steht nicht auf der Karte.` };
    let preis = gericht.preis;
    const wunsch = p.sonderwunsch.toLowerCase();
    if (wunsch.includes("käse")) preis += 1.5;
    if (wunsch.includes("groß") || wunsch.includes("40")) preis += 4.0;
    summe += preis * p.menge;
  }
  const lieferung = bestellung.art === "lieferung";
  if (lieferung && summe < RESTAURANT.lieferung.mindestbestellwert) {
    return { fehler: `Mindestbestellwert für Lieferung ist ${euro(RESTAURANT.lieferung.mindestbestellwert)}, aktuell ${euro(summe)}.` };
  }
  if (lieferung && !bestellung.adresse.trim()) return { fehler: "Für die Lieferung fehlt die Adresse." };
  const gesamt = summe + (lieferung ? RESTAURANT.lieferung.liefergebuehr : 0);
  return { warenwert: summe, gesamt };
}

function bestellungSpeichern(bestellung, anrufer) {
  const preis = preisBerechnen(bestellung);
  if (preis.fehler) return { ok: false, text: preis.fehler };

  let alle = [];
  try {
    alle = JSON.parse(fs.readFileSync(BESTELLUNGEN_DATEI, "utf8"));
  } catch {}
  const nummer = 100 + alle.length + 1;
  const eintrag = {
    nummer,
    zeit: new Date().toISOString(),
    anrufer,
    ...bestellung,
    gesamtpreis: Math.round(preis.gesamt * 100) / 100,
  };
  alle.push(eintrag);
  fs.writeFileSync(BESTELLUNGEN_DATEI, JSON.stringify(alle, null, 2));
  console.log(`\n🍕 NEUE BESTELLUNG #${nummer} – ${euro(eintrag.gesamtpreis)} – ${bestellung.name}\n`);

  const dauer = bestellung.art === "lieferung" ? RESTAURANT.lieferung.dauer : RESTAURANT.abholung.dauer;
  return { ok: true, text: `Gespeichert. Bestellnummer ${nummer}, Gesamtpreis ${euro(eintrag.gesamtpreis)}, Dauer ${dauer}.` };
}

// Ein Gespräch pro Anruf (Schlüssel: Twilio-CallSid oder eine beliebige ID).
const gespraeche = new Map();

export const BEGRUESSUNG = `Hallo und willkommen bei ${RESTAURANT.name}! Was darf ich für Sie bestellen?`;

/**
 * Nimmt das Gesagte des Anrufers entgegen und liefert die nächste gesprochene Antwort.
 * @returns {Promise<{ text: string, beenden: boolean }>}
 */
export async function antworten(anrufId, gesagt, anrufer = "") {
  if (!gespraeche.has(anrufId)) {
    // Die Begrüßung wurde schon gesprochen; die API verlangt eine User-Nachricht am Anfang.
    gespraeche.set(anrufId, [
      { role: "user", content: "(Anruf angenommen)" },
      { role: "assistant", content: BEGRUESSUNG },
    ]);
  }
  const messages = gespraeche.get(anrufId);
  messages.push({ role: "user", content: gesagt });

  let beenden = false;
  const gesprochen = [];

  for (let runde = 0; runde < 5; runde++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" }, // am Telefon zählt Geschwindigkeit
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      tools: TOOLS,
      messages,
    });

    // Gesamten Inhalt zurückgeben (inkl. Thinking-Blöcke), nicht nur den Text.
    messages.push({ role: "assistant", content: response.content });

    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) gesprochen.push(block.text.trim());
    }

    if (response.stop_reason === "refusal") {
      gesprochen.push("Entschuldigung, dabei kann ich leider nicht helfen.");
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const ergebnisse = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      if (block.name === "auflegen") {
        beenden = true;
        ergebnisse.push({ type: "tool_result", tool_use_id: block.id, content: "Aufgelegt." });
      } else if (block.name === "bestellung_aufgeben") {
        const r = bestellungSpeichern(block.input, anrufer);
        ergebnisse.push({ type: "tool_result", tool_use_id: block.id, content: r.text, is_error: !r.ok });
      }
    }
    messages.push({ role: "user", content: ergebnisse });
    if (beenden) break;
  }

  if (beenden) gespraeche.delete(anrufId);
  return { text: gesprochen.join(" ") || "Einen Moment bitte.", beenden };
}

export function gespraechBeenden(anrufId) {
  gespraeche.delete(anrufId);
}
