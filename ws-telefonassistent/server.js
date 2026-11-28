// Telefon-Server für Twilio: nimmt Anrufe an, wandelt Sprache in Text und antwortet per Sprachausgabe.
import http from "node:http";
import { antworten, gespraechBeenden, BEGRUESSUNG } from "./assistant.js";

const PORT = process.env.PORT || 3000;
const STIMME = process.env.TWILIO_STIMME || "Polly.Vicki-Neural"; // deutsche Stimme

const xml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const sag = (text) => `<Say language="de-DE" voice="${STIMME}">${xml(text)}</Say>`;

// Spricht den Text und hört danach wieder zu.
const sprechenUndZuhoeren = (text) => `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" language="de-DE" speechModel="phone_call" speechTimeout="auto" action="/antwort" method="POST">
    ${sag(text)}
  </Gather>
  ${sag("Sind Sie noch dran?")}
  <Redirect method="POST">/nochmal</Redirect>
</Response>`;

const sprechenUndAuflegen = (text) => `<?xml version="1.0" encoding="UTF-8"?>
<Response>${sag(text)}<Hangup/></Response>`;

async function formularLesen(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return Object.fromEntries(new URLSearchParams(body));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const antwortSenden = (twiml) => {
    res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8" });
    res.end(twiml);
  };

  try {
    if (url.pathname === "/voice") {
      // Neuer Anruf
      antwortSenden(sprechenUndZuhoeren(BEGRUESSUNG));
    } else if (url.pathname === "/antwort") {
      const daten = await formularLesen(req);
      const gesagt = (daten.SpeechResult || "").trim();
      if (!gesagt) return antwortSenden(sprechenUndZuhoeren("Entschuldigung, das habe ich nicht verstanden. Können Sie das bitte wiederholen?"));
      console.log(`📞 ${daten.From || "?"}: ${gesagt}`);
      const { text, beenden } = await antworten(daten.CallSid, gesagt, daten.From || "");
      console.log(`🤖 ${text}`);
      antwortSenden(beenden ? sprechenUndAuflegen(text) : sprechenUndZuhoeren(text));
    } else if (url.pathname === "/nochmal") {
      antwortSenden(sprechenUndZuhoeren("Wie kann ich Ihnen helfen?"));
    } else if (url.pathname === "/status") {
      // Optional als Status-Callback in Twilio eintragen, um Gespräche nach dem Auflegen zu löschen.
      const daten = await formularLesen(req);
      if (daten.CallStatus === "completed") gespraechBeenden(daten.CallSid);
      res.writeHead(204).end();
    } else {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("KI-Telefonassistent läuft. Twilio-Webhook: POST /voice");
    }
  } catch (err) {
    console.error(err);
    antwortSenden(sprechenUndAuflegen("Entschuldigung, gerade gibt es eine technische Störung. Bitte rufen Sie in ein paar Minuten noch einmal an."));
  }
});

server.listen(PORT, () => console.log(`☎️  Telefonassistent läuft auf http://localhost:${PORT} (Webhook: /voice)`));
