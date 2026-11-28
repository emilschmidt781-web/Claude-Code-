// Gesprächslogik: Claude nimmt Anrufe für Ricky an, beantwortet Fragen und schreibt Rückrufnotizen.
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import { FIRMA, FAQ } from "./config.js";
import { offeneStellen } from "./stellen.js";
import { rickyBenachrichtigen } from "./benachrichtigung.js";

const client = new Anthropic(); // liest ANTHROPIC_API_KEY aus der Umgebung
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
const NOTIZEN_DATEI = process.env.NOTIZEN_DATEI || "rueckrufe.json";

export const BEGRUESSUNG = `Guten Tag, hier ist der digitale Assistent von ${FIRMA.name}. Herr Wagner ist gerade nicht erreichbar. Ich bin eine KI und nehme gern Ihr Anliegen auf, damit er Sie zurückruft. Suchen Sie Personal oder einen neuen Job?`;

const SYSTEM = `Du bist der telefonische Assistent von ${FIRMA.name}, einer Personalvermittlung von ${FIRMA.inhaber} in Kitzingen. Du gehst ans Telefon, wenn Herr Wagner nicht abnehmen kann. Der Anrufer weiß bereits aus der Begrüßung, dass du eine KI bist.

Deine Aufgabe: Anliegen verstehen, einfache Fragen beantworten und eine vollständige Rückrufnotiz für Herrn Wagner aufnehmen.

WICHTIG – du sprichst am Telefon:
- Antworte kurz: höchstens zwei, drei Sätze. Keine Listen, kein Markdown, keine Emojis, keine Abkürzungen wie "z. B." oder "&".
- Stell immer nur eine Frage auf einmal. Sieze die Anrufer.
- Telefonnummern liest du zur Kontrolle in Zweiergruppen vor.

Was du je nach Anrufer erfragst (nur so viel, wie der Anrufer gern sagt):
- Unternehmen mit Personalbedarf: Firmenname, Ansprechpartner, gesuchte Position(en), Anzahl, Standort, ab wann, Rückrufnummer und beste Zeit für den Rückruf. Auf der Website gibt es außerdem das Formular "Personal anfragen".
- Bewerber: Name, aktueller oder gewünschter Beruf, Region, ab wann verfügbar, ob es um eine bestimmte Stelle geht, Rückrufnummer und beste Zeit. Lebenslauf kann per E-Mail oder WhatsApp kommen.
- Alle anderen (Rückfragen, Kooperationen, Werbung, Privates): Name, kurzes Anliegen, Rückrufnummer.
Die Nummer, von der angerufen wird, steht unten. Frag, ob das die beste Rückrufnummer ist, statt sie neu zu erfragen.

Regeln – sehr wichtig:
- Du bewertest oder sortierst keine Bewerber und sagst nie, ob jemand für eine Stelle geeignet ist oder Chancen hat. Das entscheidet nur Herr Wagner.
- Du versprichst keine Stellen, keine Gehälter, keine Honorare und keine festen Termine. Zu Gehalt und Konditionen: "Das bespricht Herr Wagner gern persönlich mit Ihnen."
- Du nennst keine Namen von Kundenunternehmen oder Kandidaten. Die Stellen sind anonymisiert.
- Frag nicht nach Gesundheit, Religion, Herkunft, Familienplanung oder anderen sensiblen Daten. Erzählt jemand so etwas, notiere es nicht.
- Weißt du etwas nicht, sag das ehrlich und nimm die Frage in die Notiz auf.
- Wenn du genug weißt, fasse die Notiz kurz zusammen und frag, ob alles stimmt. Erst nach dem Ja rufst du "rueckruf_notiz" auf, sagst, dass sich Herr Wagner ${FIRMA.rueckrufZeit} meldet, verabschiedest dich und rufst "auflegen" auf.
- Will jemand keine Notiz hinterlassen, verabschiede dich freundlich und rufe "auflegen" auf.

Firmeninfos:
Adresse: ${FIRMA.adresse}
E-Mail: ${FIRMA.email}
Website: ${FIRMA.website}
Region: ${FIRMA.region}
Bereiche: ${FIRMA.bereiche}

Häufige Fragen:
${FAQ.map(([f, a]) => `F: ${f}\nA: ${a}`).join("\n")}`;

const TOOLS = [
  {
    name: "rueckruf_notiz",
    description:
      "Speichert die Rückrufnotiz und schickt sie Herrn Wagner aufs Handy. Erst aufrufen, nachdem der Anrufer die Zusammenfassung bestätigt hat. Unbekannte Felder als leeren Text übergeben.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["typ", "name", "firma", "telefon", "rueckrufzeit", "anliegen", "position_oder_beruf", "region", "verfuegbar_ab", "stelle_id", "dringend"],
      properties: {
        typ: { type: "string", enum: ["unternehmen", "bewerber", "sonstiges"] },
        name: { type: "string" },
        firma: { type: "string", description: "nur bei Unternehmen" },
        telefon: { type: "string" },
        rueckrufzeit: { type: "string", description: "wann der Rückruf am besten passt" },
        anliegen: { type: "string", description: "kurze Zusammenfassung in 1–3 Sätzen, inklusive offener Fragen" },
        position_oder_beruf: { type: "string", description: "gesuchte Position (Unternehmen) bzw. Beruf (Bewerber)" },
        region: { type: "string" },
        verfuegbar_ab: { type: "string", description: "Startdatum oder Verfügbarkeit" },
        stelle_id: { type: "string", description: "ID einer konkreten Stelle aus der Liste, sonst leer" },
        dringend: { type: "boolean" },
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

async function notizSpeichern(notiz, anrufer) {
  let alle = [];
  try {
    alle = JSON.parse(fs.readFileSync(NOTIZEN_DATEI, "utf8"));
  } catch {}
  const eintrag = { nr: alle.length + 1, zeit: new Date().toISOString(), anrufnummer: anrufer, ...notiz };
  alle.push(eintrag);
  fs.writeFileSync(NOTIZEN_DATEI, JSON.stringify(alle, null, 2));
  console.log(`\n📝 RÜCKRUF #${eintrag.nr} (${notiz.typ}) – ${notiz.name} – ${notiz.telefon}\n`);
  await rickyBenachrichtigen(eintrag);
  return "Notiz gespeichert und an Herrn Wagner geschickt.";
}

const gespraeche = new Map(); // ein Gespräch pro Anruf

/**
 * Nimmt das Gesagte des Anrufers entgegen und liefert die nächste gesprochene Antwort.
 * @returns {Promise<{ text: string, beenden: boolean }>}
 */
export async function antworten(anrufId, gesagt, anrufer = "") {
  if (!gespraeche.has(anrufId)) {
    const stellen = await offeneStellen();
    gespraeche.set(anrufId, {
      kontext: `Offene Stellen (ID | Titel | Ort | Art | Beschreibung):\n${stellen}\n\nAnruf von Nummer: ${anrufer || "unbekannt"}\nHeute: ${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`,
      messages: [
        { role: "user", content: "(Anruf angenommen)" },
        { role: "assistant", content: BEGRUESSUNG },
      ],
    });
  }
  const { kontext, messages } = gespraeche.get(anrufId);
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
      system: [
        { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: kontext },
      ],
      tools: TOOLS,
      messages,
    });

    // Gesamten Inhalt zurückgeben (inkl. Thinking-Blöcke), nicht nur den Text.
    messages.push({ role: "assistant", content: response.content });
    for (const block of response.content) {
      if (block.type === "text" && block.text.trim()) gesprochen.push(block.text.trim());
    }

    if (response.stop_reason === "refusal") {
      gesprochen.push("Entschuldigung, dabei kann ich leider nicht helfen. Herr Wagner meldet sich gern bei Ihnen.");
      break;
    }
    if (response.stop_reason !== "tool_use") break;

    const ergebnisse = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      if (block.name === "auflegen") {
        beenden = true;
        ergebnisse.push({ type: "tool_result", tool_use_id: block.id, content: "Aufgelegt." });
      } else if (block.name === "rueckruf_notiz") {
        try {
          const text = await notizSpeichern(block.input, anrufer);
          ergebnisse.push({ type: "tool_result", tool_use_id: block.id, content: text });
        } catch (err) {
          console.error(err);
          ergebnisse.push({ type: "tool_result", tool_use_id: block.id, content: "Speichern fehlgeschlagen.", is_error: true });
        }
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
