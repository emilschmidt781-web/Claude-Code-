// Schickt Ricky jede Rückrufnotiz per SMS (über dasselbe Twilio-Konto).
// Ohne Twilio-Zugangsdaten in .env wird die Notiz nur gespeichert und im Terminal angezeigt.

const TYP = { unternehmen: "🏢 Unternehmen", bewerber: "👤 Bewerber", sonstiges: "📞 Sonstiges" };

export function smsText(n) {
  return [
    `${n.dringend ? "‼️ DRINGEND – " : ""}${TYP[n.typ] || n.typ}: ${n.name || "ohne Name"}${n.firma ? ` (${n.firma})` : ""}`,
    `Tel: ${n.telefon || n.anrufnummer}${n.rueckrufzeit ? ` – am besten ${n.rueckrufzeit}` : ""}`,
    n.position_oder_beruf && `Beruf/Position: ${n.position_oder_beruf}`,
    n.region && `Region: ${n.region}`,
    n.verfuegbar_ab && `Ab: ${n.verfuegbar_ab}`,
    n.stelle_id && `Stelle: ${n.stelle_id}`,
    `Anliegen: ${n.anliegen}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function rickyBenachrichtigen(notiz) {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_NUMMER: von, RICKY_HANDY: an } = process.env;
  const text = smsText(notiz);
  if (!sid || !token || !von || !an) {
    console.log("(SMS nicht eingerichtet – Text wäre:)\n" + text);
    return;
  }
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64") },
    body: new URLSearchParams({ From: von, To: an, Body: text }),
  });
  if (!r.ok) console.error("SMS an Ricky fehlgeschlagen:", r.status, await r.text());
}
