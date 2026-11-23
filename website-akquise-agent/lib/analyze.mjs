// Prüft die öffentliche Startseite eines Unternehmens auf typische Schwächen:
// Erreichbarkeit, HTTPS, Mobilfähigkeit, Ladezeit, Aktualität, Rechtliches, SEO, Kontaktwege.
// Es wird nur die Startseite ganz normal abgerufen – wie ein Besucher im Browser.

const UA = "Mozilla/5.0 (compatible; website-akquise-agent/1.0)";
const THIS_YEAR = new Date().getFullYear();

const SOCIAL_ONLY = /(facebook\.com|instagram\.com|linkedin\.com|xing\.com|tiktok\.com|business\.site|g\.page|google\.com\/maps|wa\.me)/i;
const BAUKASTEN = [
  [/jimdo/i, "Jimdo"], [/wix\.com|wixstatic/i, "Wix"], [/squarespace/i, "Squarespace"],
  [/ionos|mywebsite|website-?builder/i, "IONOS-Baukasten"], [/strato/i, "STRATO-Baukasten"],
  [/webnode/i, "Webnode"], [/one\.com/i, "one.com-Baukasten"], [/site123/i, "SITE123"],
];

async function timedFetch(url, opts = {}, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal, headers: { "User-Agent": UA, "Accept-Language": "de", ...(opts.headers || {}) } });
    const ttfb = Date.now() - start;
    const body = opts.method === "HEAD" || opts.redirect === "manual" ? "" : await res.text();
    return { res, body, ttfb, total: Date.now() - start };
  } finally {
    clearTimeout(timer);
  }
}

function meta(html, name) {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  return tag?.match(/content=["']([^"']*)["']/i)?.[1]?.trim() ?? null;
}

function text(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
}

export function analyzeHtml(html, { finalUrl = "", ttfb = null, total = null } = {}) {
  const f = {}; // Fakten
  const lower = html.toLowerCase();
  const plain = text(html);

  f.titel = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || null;
  f.metaBeschreibung = meta(html, "description");
  f.viewport = !!meta(html, "viewport");
  f.h1 = (html.match(/<h1[\s>]/gi) || []).length;
  f.groesseKB = Math.round(Buffer.byteLength(html) / 1024);
  f.ladezeitMs = total;
  f.antwortzeitMs = ttfb;
  f.https = finalUrl.startsWith("https://");

  const years = [...plain.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map((m) => Number(m[1]))
    .filter((y) => y > 1995 && y <= THIS_YEAR);
  f.copyrightJahr = years.length ? Math.max(...years) : null;

  f.impressum = /impressum|imprint/i.test(lower);
  f.datenschutz = /datenschutz|privacy/i.test(lower);
  f.telefonLink = /href=["']tel:/i.test(html);
  f.emailLink = /href=["']mailto:/i.test(html);
  f.kontaktformular = /<form[\s\S]*?(?:email|nachricht|message|textarea)/i.test(html);
  f.onlineBuchung = /(termin\s*(?:online\s*)?buchen|online[- ]?termin|reservier|jetzt buchen|booking|doctolib|treatwell|calendly|shore\.com|planity|opentable|quandoo)/i.test(lower);
  f.strukturierteDaten = /application\/ld\+json/i.test(html) && /localbusiness|organization|restaurant|store|dentist|physician|hairsalon/i.test(lower);
  f.openGraphBild = !!meta(html, "og:image");
  f.favicon = /rel=["'][^"']*icon/i.test(html);

  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  f.bilder = imgs.length;
  f.bilderOhneAlt = imgs.filter((t) => !/\balt=["'][^"']+["']/i.test(t)).length;

  f.googleFontsExtern = /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html);
  f.tracking = /(googletagmanager\.com|google-analytics\.com|gtag\(|fbq\(|connect\.facebook\.net|hotjar)/i.test(html);
  f.consentTool = /(cookiebot|usercentrics|borlabs|consentmanager|onetrust|cookieyes|complianz|klaro|ccm19|cookie-?consent|cookie-?banner|real-cookie-banner)/i.test(lower);
  f.mapsEmbed = /google\.[a-z.]+\/maps\/embed|maps\.google\./i.test(html);

  const gen = meta(html, "generator");
  f.generator = gen;
  f.baukasten = BAUKASTEN.find(([re]) => re.test(html))?.[1] || null;
  const wp = gen?.match(/wordpress\s*([\d.]+)/i)?.[1] || html.match(/ver=(\d\.\d+(?:\.\d+)?)['"&][^>]*wp-/i)?.[1];
  f.wordpressVersion = wp || (/wp-content|wp-includes/i.test(html) ? "unbekannt" : null);
  f.jqueryVersion = html.match(/jquery[.-]?(\d\.\d+(?:\.\d+)?)(?:\.min)?\.js/i)?.[1] || null;
  f.veralteteTechnik = [
    /<frameset|<frame\s/i.test(html) && "Frames",
    /<marquee/i.test(html) && "Lauftext (<marquee>)",
    /<font\s/i.test(html) && "<font>-Tags",
    /\.swf|shockwave-flash/i.test(html) && "Flash",
    /<table[^>]*(width=["']?\d{3,}|bgcolor)/i.test(html) && "Tabellen-Layout",
    /<center>/i.test(html) && "<center>-Tags",
  ].filter(Boolean);
  f.socialLinks = [...new Set((html.match(/https?:\/\/(?:www\.)?(facebook|instagram|tiktok|linkedin|youtube)\.com/gi) || [])
    .map((s) => s.replace(/https?:\/\/(www\.)?/i, "").replace(".com", "")))];
  f.woerter = plain.split(" ").filter((w) => w.length > 2).length;

  return f;
}

// Bewertet die Fakten: je höher die Punktzahl, desto größer die Verkaufschance.
export function scoreFindings(f) {
  const s = []; // { punkte, schwere, problem, detail }
  const add = (punkte, schwere, problem, detail) => s.push({ punkte, schwere, problem, detail });

  if (f.status === "keine_website") {
    add(100, "hoch", "Keine eigene Website", "In OpenStreetMap ist keine Website hinterlegt – Kunden, die online suchen, finden nur Verzeichnisse oder die Konkurrenz.");
    return finish(s);
  }
  if (f.status === "nur_social") {
    add(85, "hoch", "Nur Social-Media-Profil statt Website", `Als „Website“ ist nur ${f.url} hinterlegt. Ohne eigene Seite: kein Google-Ranking für eigene Inhalte, abhängig von der Plattform, kein eigenes Impressum.`);
    return finish(s);
  }
  if (f.status === "nicht_erreichbar") {
    add(90, "hoch", "Website nicht erreichbar", `Beim Aufruf kam: ${f.fehler}. Interessenten landen im Nichts.`);
    return finish(s);
  }
  if (f.status === "fehler") {
    add(70, "hoch", `Website liefert Fehler (HTTP ${f.httpStatus})`, "Die Startseite lädt nicht korrekt.");
  }

  if (!f.https) add(20, "hoch", "Keine verschlüsselte Verbindung (HTTPS)", "Browser zeigen „Nicht sicher“ an – das schreckt Besucher ab und kostet Google-Ranking. Kontaktformulare ohne HTTPS sind datenschutzrechtlich heikel.");
  else if (f.httpLeitetNichtUm) add(5, "mittel", "HTTP wird nicht auf HTTPS umgeleitet", "Wer die Adresse ohne https eintippt, landet auf der unsicheren Version.");
  if (!f.viewport) add(20, "hoch", "Nicht für Smartphones optimiert", "Kein Viewport-Tag – die Seite wird auf dem Handy winzig dargestellt. Über 60 % der lokalen Suchen kommen vom Smartphone.");
  if (f.ladezeitMs > 4000) add(12, "hoch", `Langsame Ladezeit (${(f.ladezeitMs / 1000).toFixed(1)} s nur für das HTML)`, "Ab 3 Sekunden springt ein großer Teil der mobilen Besucher ab.");
  else if (f.ladezeitMs > 2000) add(5, "mittel", `Träge Ladezeit (${(f.ladezeitMs / 1000).toFixed(1)} s für das HTML)`, "Spürbar langsamer als moderne Seiten.");
  if (f.copyrightJahr && f.copyrightJahr <= THIS_YEAR - 3) add(12, "mittel", `Veraltet wirkend (Copyright ${f.copyrightJahr})`, "Besucher schließen daraus, dass die Seite – oder der Betrieb – nicht mehr gepflegt wird.");
  if (f.veralteteTechnik?.length) add(15, "hoch", "Veraltete Technik", `Gefunden: ${f.veralteteTechnik.join(", ")} – Technik aus den 2000ern.`);
  if (f.baukasten) add(6, "niedrig", `Baukasten-Website (${f.baukasten})`, "Oft generisches Design, eingeschränkte SEO und laufende Abo-Kosten.");
  if (f.wordpressVersion && /^[1-5]\./.test(f.wordpressVersion)) add(12, "hoch", `Veraltetes WordPress (${f.wordpressVersion})`, "Alte WordPress-Versionen bekommen keine Sicherheitsupdates mehr und sind ein häufiges Ziel für Angriffe.");
  if (f.jqueryVersion && /^1\./.test(f.jqueryVersion)) add(6, "mittel", `Sehr alte Script-Bibliothek (jQuery ${f.jqueryVersion})`, "Hinweis darauf, dass die Seite seit vielen Jahren technisch nicht erneuert wurde.");

  if (!f.impressum) add(15, "hoch", "Kein Impressum gefunden", "Geschäftliche Websites in Deutschland brauchen ein leicht erreichbares Impressum (§ 5 DDG) – fehlt es, drohen Abmahnungen.");
  if (!f.datenschutz) add(12, "hoch", "Keine Datenschutzerklärung gefunden", "Nach DSGVO Pflicht, sobald personenbezogene Daten verarbeitet werden (schon Server-Logs zählen).");
  if (f.googleFontsExtern) add(10, "mittel", "Google Fonts werden extern geladen", "Überträgt die IP-Adresse der Besucher an Google. Das LG München (Az. 3 O 17493/20) sah darin einen Datenschutzverstoß – danach gab es Abmahnwellen.");
  if (f.tracking && !f.consentTool) add(12, "hoch", "Tracking ohne erkennbares Cookie-Banner", "Analyse-/Werbe-Skripte ohne Einwilligung verstoßen gegen § 25 TDDDG und DSGVO.");
  if (f.mapsEmbed && !f.consentTool) add(4, "niedrig", "Google-Maps-Karte ohne Einwilligungsabfrage", "Auch eingebettete Karten übertragen Daten an Google.");

  if (!f.titel || f.titel.length < 10) add(8, "mittel", "Fehlender/nichtssagender Seitentitel", `Titel: „${f.titel || "—"}“. Der Titel ist der wichtigste Text in den Google-Ergebnissen.`);
  if (!f.metaBeschreibung) add(6, "mittel", "Keine Meta-Beschreibung", "Google zeigt dann zufällige Textschnipsel statt einer überzeugenden Beschreibung.");
  if (!f.h1) add(4, "niedrig", "Keine Hauptüberschrift (H1)", "Erschwert Google das Verständnis, worum es auf der Seite geht.");
  if (!f.strukturierteDaten) add(5, "niedrig", "Keine strukturierten Daten für lokale Suche", "Öffnungszeiten, Adresse, Bewertungen erscheinen seltener direkt in Google.");
  if (f.woerter < 150) add(8, "mittel", `Sehr wenig Inhalt (~${f.woerter} Wörter)`, "Zu wenig Text, um bei Google für Leistungen und Ort gefunden zu werden.");
  if (f.bilder > 3 && f.bilderOhneAlt / f.bilder > 0.5) add(3, "niedrig", `${f.bilderOhneAlt} von ${f.bilder} Bildern ohne Alternativtext`, "Schlecht für Barrierefreiheit und Bildersuche.");
  if (!f.openGraphBild) add(2, "niedrig", "Kein Vorschaubild für WhatsApp/Facebook", "Geteilte Links sehen unprofessionell aus.");

  if (!f.telefonLink) add(6, "mittel", "Telefonnummer nicht antippbar", "Auf dem Handy kann man nicht mit einem Tipp anrufen – verlorene Anrufe.");
  if (!f.kontaktformular && !f.emailLink) add(6, "mittel", "Kein einfacher Kontaktweg", "Weder Kontaktformular noch klickbare E-Mail gefunden.");
  if (!f.onlineBuchung) add(4, "niedrig", "Keine Online-Terminbuchung/Anfrage", "Viele Kunden buchen lieber abends online, statt zu Öffnungszeiten anzurufen.");

  return finish(s);
}

function finish(s) {
  s.sort((a, b) => b.punkte - a.punkte);
  const score = Math.min(100, s.reduce((n, x) => n + x.punkte, 0));
  const chance = score >= 60 ? "sehr hoch" : score >= 35 ? "hoch" : score >= 15 ? "mittel" : "gering";
  return { score, chance, schwachstellen: s };
}

export async function analyzeCompany(company) {
  const url = company.website;
  if (!url) return { status: "keine_website" };
  if (SOCIAL_ONLY.test(url)) return { status: "nur_social", url };

  let r;
  try {
    r = await timedFetch(url, { redirect: "follow" });
  } catch (e) {
    // zweiter Versuch mit https, falls http-Adresse hinterlegt war
    if (url.startsWith("http://")) {
      try { r = await timedFetch(url.replace("http://", "https://"), { redirect: "follow" }); } catch {}
    }
    if (!r) return { status: "nicht_erreichbar", url, fehler: e.name === "AbortError" ? "Zeitüberschreitung (15 s)" : (e.cause?.code || e.message) };
  }

  const finalUrl = r.res.url || url;
  const f = analyzeHtml(r.body, { finalUrl, ttfb: r.ttfb, total: r.total });
  f.url = url;
  f.finalUrl = finalUrl;
  f.httpStatus = r.res.status;
  f.status = r.res.ok ? "ok" : "fehler";

  if (f.https) {
    try {
      const host = new URL(finalUrl).host;
      const h = await timedFetch(`http://${host}/`, { redirect: "manual" }, 8000);
      const loc = h.res.headers.get("location") || "";
      f.httpLeitetNichtUm = !(h.res.status >= 300 && h.res.status < 400 && loc.startsWith("https://"));
    } catch { f.httpLeitetNichtUm = false; }
  }
  return f;
}
