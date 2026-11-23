// Claude macht aus den technischen Befunden konkrete, ehrliche Verkaufsargumente.
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM = `Du bist ein erfahrener Vertriebscoach für eine kleine Webagentur in Deutschland.
Der Nutzer verkauft Websites an lokale Betriebe (Handwerk, Gastronomie, Praxen, Einzelhandel).
Du bekommst ein Unternehmen und automatisch ermittelte Befunde zu dessen Online-Auftritt.

Regeln:
- Stütze dich ausschließlich auf die gelieferten Befunde und Firmendaten. Erfinde keine Zahlen über das Unternehmen, keine Bewertungen, keine Konkurrenten mit Namen.
- Allgemeine Branchenfakten (z. B. "die meisten lokalen Suchen laufen über das Smartphone") sind erlaubt, aber vorsichtig formuliert.
- Übersetze Technik in Nutzen für den Inhaber: mehr Anrufe, mehr Anfragen, weniger Telefonstress, besseres Image, weniger Abmahnrisiko.
- Rechtliche Punkte als Risiko benennen, nicht als Rechtsberatung, und ohne Panikmache.
- Ton: wertschätzend, auf Augenhöhe, nie herablassend über die bestehende Seite – der Inhaber hat sie vielleicht selbst gebaut.
- Schreibe auf Deutsch, kurz und gesprächstauglich.
- Die E-Mail ist als Nachfass-E-Mail nach einem Gespräch oder auf ausdrücklichen Wunsch gedacht (kein unaufgeforderter Werbe-Versand).`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["kurzfazit", "top_schwachstellen", "verkaufsargumente", "gespraechseinstieg", "einwaende", "angebot", "email_betreff", "email_text"],
  properties: {
    kurzfazit: { type: "string", description: "1-2 Sätze: Lage des Online-Auftritts und warum sich ein Gespräch lohnt" },
    top_schwachstellen: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["problem", "folge_fuer_kunden"],
        properties: { problem: { type: "string" }, folge_fuer_kunden: { type: "string" } },
      },
    },
    verkaufsargumente: { type: "array", items: { type: "string" } },
    gespraechseinstieg: { type: "string", description: "Erste 2-3 Sätze für Telefonat oder Besuch vor Ort" },
    einwaende: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["einwand", "antwort"],
        properties: { einwand: { type: "string" }, antwort: { type: "string" } },
      },
    },
    angebot: { type: "string", description: "Passende Paket-Empfehlung (Umfang, Funktionen) für diesen Betrieb" },
    email_betreff: { type: "string" },
    email_text: { type: "string" },
  },
};

export function createClient() {
  return new Anthropic();
}

export async function salesPitch(client, company, analyse, { model, absender }) {
  const input = {
    unternehmen: {
      name: company.name, kategorie: company.kategorie, adresse: company.adresse,
      website: company.website || null, hat_facebook: !!company.facebook, hat_instagram: !!company.instagram,
    },
    chance: analyse.chance,
    score: analyse.score,
    befunde: analyse.schwachstellen.map(({ schwere, problem, detail }) => ({ schwere, problem, detail })),
  };

  const response = await client.beta.messages.create({
    model,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    system: SYSTEM,
    messages: [{
      role: "user",
      content: `Absender der E-Mail: ${absender || "[Dein Name], [Deine Agentur]"}\n\nErstelle die Verkaufsunterlage für dieses Unternehmen (3-5 Schwachstellen, 3-5 Argumente, 3 typische Einwände):\n\n${JSON.stringify(input, null, 2)}`,
    }],
  });

  if (response.stop_reason === "refusal") throw new Error("Anfrage wurde vom Modell abgelehnt");
  if (response.stop_reason === "max_tokens") throw new Error("Antwort abgeschnitten (max_tokens)");
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("Keine Textantwort erhalten");
  return JSON.parse(textBlock.text);
}
