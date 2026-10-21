// Berufs-Assistent: kleiner Chat, der in vier Fragen passende Berufe vorschlägt
// und die passenden Stellen aus profile.js zeigt. Läuft komplett im Browser,
// es werden keine Eingaben an einen Server gesendet.
(() => {
  const WA = "491776880175";

  // Wissensbasis. kategorie muss zu den Kategorien in profile.js passen,
  // damit passende offene Stellen angezeigt werden.
  const BERUFE = [
    { name: "Elektroniker/in", kategorie: "Elektro & Technik", ort: "hand", ausb: ["technik"], tags: ["technik", "elektrik"], text: "Installiert, wartet und repariert elektrische Anlagen – in Betrieben, Gebäuden oder Maschinen.", worte: ["elektr", "strom", "kabel", "schaltschrank", "elektronik", "sps"] },
    { name: "Mechatroniker/in", kategorie: "Elektro & Technik", ort: "hand", ausb: ["technik"], tags: ["technik", "elektrik", "maschinen"], text: "Verbindet Mechanik, Elektronik und Steuerungstechnik – ideal für Tüftler an modernen Anlagen.", worte: ["mechatron", "automat", "roboter", "steuerung", "anlage"] },
    { name: "Industriemechaniker/in", kategorie: "Industrie & Produktion", ort: "hand", ausb: ["technik"], tags: ["maschinen", "technik"], text: "Baut, wartet und repariert Maschinen und Produktionsanlagen.", worte: ["maschin", "mechan", "metall", "schrauben", "montage"] },
    { name: "Zerspanungsmechaniker/in (CNC)", kategorie: "Industrie & Produktion", ort: "hand", ausb: ["technik"], tags: ["maschinen", "praezision"], text: "Stellt präzise Bauteile an CNC-Dreh- und Fräsmaschinen her.", worte: ["cnc", "dreh", "fräs", "fraes", "zerspan", "präzis", "praezis"] },
    { name: "Produktionshelfer/in", kategorie: "Industrie & Produktion", ort: "hand", ausb: ["keine", "technik"], tags: ["maschinen", "organisieren"], text: "Unterstützt in der Fertigung, bedient Maschinen und prüft Qualität – guter Einstieg ohne Ausbildung.", worte: ["produktion", "fertigung", "fabrik", "helfer", "band"] },
    { name: "Schweißer/in", kategorie: "Handwerk", ort: "hand", ausb: ["technik", "keine"], tags: ["metall", "bauen"], text: "Verbindet Metallteile mit MAG-, MIG- oder WIG-Verfahren – sehr gefragt in Metallbau und Industrie.", worte: ["schweiß", "schweiss", "metall", "stahl"] },
    { name: "Metallbauer/in", kategorie: "Handwerk", ort: "hand", ausb: ["technik"], tags: ["metall", "bauen"], text: "Fertigt und montiert Konstruktionen aus Metall – von Treppen bis Stahlbau.", worte: ["metallbau", "schlosser", "stahlbau", "geländer", "gelaender"] },
    { name: "Anlagenmechaniker/in SHK", kategorie: "Handwerk", ort: "hand", ausb: ["technik"], tags: ["bauen", "kunden", "technik"], text: "Installiert Heizungen, Bäder und Klimaanlagen – abwechslungsreich und krisensicher.", worte: ["heizung", "sanitär", "sanitaer", "klima", "wärmepumpe", "waermepumpe", "installateur", "shk"] },
    { name: "Kfz-Mechatroniker/in", kategorie: "Handwerk", ort: "hand", ausb: ["technik"], tags: ["technik", "maschinen", "reparieren"], text: "Wartet und repariert Fahrzeuge – von Motor bis Elektronik.", worte: ["auto", "kfz", "fahrzeug", "motor", "werkstatt", "lkw"] },
    { name: "Elektrohelfer/in / Monteur/in", kategorie: "Elektro & Technik", ort: "hand", ausb: ["keine", "technik"], tags: ["elektrik", "bauen"], text: "Unterstützt bei Montage und Verkabelung – Einstieg mit Weiterbildungsmöglichkeit.", worte: ["monteur", "montage", "verkabel"] },
    { name: "Fachkraft für Lagerlogistik", kategorie: "Logistik & Lager", ort: "hand", ausb: ["keine", "technik", "kaufm"], tags: ["organisieren", "lager"], text: "Nimmt Waren an, lagert sie ein und organisiert den Versand.", worte: ["lager", "logistik", "versand", "kommission", "waren"] },
    { name: "Staplerfahrer/in", kategorie: "Logistik & Lager", ort: "hand", ausb: ["keine"], tags: ["lager", "maschinen"], text: "Bewegt Waren sicher mit dem Gabelstapler – mit Staplerschein schnell einsetzbar.", worte: ["stapler", "gabelstapler", "fahren", "fahrer"] },
    { name: "Berufskraftfahrer/in", kategorie: "Logistik & Lager", ort: "hand", ausb: ["keine", "technik"], tags: ["lager", "unterwegs"], text: "Transportiert Waren im Nah- oder Fernverkehr.", worte: ["lkw", "fahrer", "führerschein ce", "transport", "unterwegs"] },
    { name: "Kaufmännische/r Sachbearbeiter/in", kategorie: "Büro & Verwaltung", ort: "buero", ausb: ["kaufm", "studium"], tags: ["verwalten", "kunden"], text: "Bearbeitet Aufträge, Angebote und Kundenanfragen im Innendienst.", worte: ["büro", "buero", "sachbearbeit", "auftrag", "angebot", "verwaltung"] },
    { name: "Industriekaufmann/-frau", kategorie: "Büro & Verwaltung", ort: "buero", ausb: ["kaufm", "studium"], tags: ["verwalten", "zahlen", "organisieren"], text: "Kümmert sich um Einkauf, Vertrieb, Personal und Rechnungswesen in Industriebetrieben.", worte: ["industriekauf", "einkauf", "beschaffung", "sap"] },
    { name: "Bürokaufmann/-frau / Assistenz", kategorie: "Büro & Verwaltung", ort: "buero", ausb: ["kaufm", "keine"], tags: ["verwalten", "organisieren"], text: "Organisiert Termine, Korrespondenz und Abläufe im Büro.", worte: ["assistenz", "sekretär", "sekretaer", "empfang", "office", "termin"] },
    { name: "Buchhalter/in", kategorie: "Buchhaltung & Finanzen", ort: "buero", ausb: ["kaufm", "studium"], tags: ["zahlen"], text: "Bucht Belege, betreut Kreditoren und Debitoren und unterstützt bei Abschlüssen.", worte: ["buchhalt", "datev", "finanz", "zahlen", "rechnung", "steuer", "lohn"] },
    { name: "Lohn- und Gehaltsbuchhalter/in", kategorie: "Buchhaltung & Finanzen", ort: "buero", ausb: ["kaufm"], tags: ["zahlen", "verwalten"], text: "Rechnet Löhne und Gehälter ab – sehr gefragt und gut planbar.", worte: ["lohn", "gehalt", "personalabrechnung", "abrechnung"] },
    { name: "Vertriebsmitarbeiter/in Innendienst", kategorie: "Vertrieb & Kundenservice", ort: "buero", ausb: ["kaufm", "keine", "studium"], tags: ["kunden", "verkauf"], text: "Betreut Kunden am Telefon und per E-Mail und erstellt Angebote.", worte: ["vertrieb", "verkauf", "kunden", "innendienst", "crm"] },
    { name: "Kundenservice-Mitarbeiter/in", kategorie: "Vertrieb & Kundenservice", ort: "buero", ausb: ["keine", "kaufm"], tags: ["kunden"], text: "Erste Ansprechperson für Kundenfragen – ideal für kommunikative Menschen, auch Quereinstieg.", worte: ["kundenservice", "service", "telefon", "callcenter", "beratung", "helfen"] },
    { name: "Außendienstmitarbeiter/in", kategorie: "Vertrieb & Kundenservice", ort: "beides", ausb: ["kaufm", "technik", "studium"], tags: ["kunden", "verkauf", "unterwegs"], text: "Besucht Kunden vor Ort und berät zu Produkten – oft mit Firmenwagen.", worte: ["außendienst", "aussendienst", "vor ort", "reisen", "firmenwagen"] },
    { name: "Technische/r Zeichner/in / Produktdesign", kategorie: "Elektro & Technik", ort: "buero", ausb: ["technik", "studium"], tags: ["technik", "planen"], text: "Erstellt technische Zeichnungen und 3D-Modelle am Computer.", worte: ["zeichn", "cad", "konstruk", "3d", "design"] },
  ];

  const INTERESSEN = [
    { key: "technik", label: "Technik & Elektrik" },
    { key: "maschinen", label: "Maschinen & Metall" },
    { key: "bauen", label: "Bauen & Reparieren" },
    { key: "organisieren", label: "Organisieren & Lager" },
    { key: "zahlen", label: "Zahlen & Finanzen" },
    { key: "kunden", label: "Kundenkontakt & Verkauf" },
    { key: "verwalten", label: "Planen & Verwalten" },
  ];
  // Interessen-Schlüssel, die auf Berufs-Tags verweisen
  const TAG_MAP = {
    technik: ["technik", "elektrik", "planen"],
    maschinen: ["maschinen", "metall", "praezision"],
    bauen: ["bauen", "reparieren", "metall"],
    organisieren: ["organisieren", "lager"],
    zahlen: ["zahlen"],
    kunden: ["kunden", "verkauf"],
    verwalten: ["verwalten", "organisieren", "planen"],
  };

  const norm = (t) =>
    String(t || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");

  // ---------- Oberfläche ----------
  const root = document.createElement("div");
  root.className = "bot";
  root.innerHTML = `
    <section class="bot-panel" id="bot-panel" role="dialog" aria-modal="false" aria-labelledby="bot-title" hidden>
      <header class="bot-head">
        <img src="img/ricky-small.png" alt="" width="40" height="40" />
        <div><b id="bot-title">Berufs-Assistent</b><small>W&amp;S Karrierepartner · antwortet sofort</small></div>
        <button type="button" class="bot-restart" aria-label="Neu starten" title="Neu starten">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z"/></svg>
        </button>
        <button type="button" class="bot-close" aria-label="Schließen">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6Z"/></svg>
        </button>
      </header>
      <div class="bot-log" aria-live="polite"></div>
      <div class="bot-choices"></div>
      <form class="bot-input">
        <label class="sr-only" for="bot-text">Eigene Antwort</label>
        <input id="bot-text" type="text" placeholder="Oder einfach schreiben, z. B. „Ich schraube gern“" autocomplete="off" />
        <button type="submit" aria-label="Senden"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 20.5 21 12 3 3.5V10l12 2-12 2Z"/></svg></button>
      </form>
      <p class="bot-note">Automatischer Berufs-Check – Ihre Eingaben bleiben auf Ihrem Gerät.</p>
    </section>`;
  document.body.append(root);

  const triggers = [...document.querySelectorAll("[data-open-bot]")];
  let opener = null;
  const panel = root.querySelector(".bot-panel");
  const log = root.querySelector(".bot-log");
  const choices = root.querySelector(".bot-choices");
  const form = root.querySelector(".bot-input");
  const input = form.querySelector("input");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const scroll = () => (log.scrollTop = log.scrollHeight);

  const say = (content, delay = 550) =>
    new Promise((resolve) => {
      const typing = el("div", "msg bot-msg typing");
      typing.innerHTML = "<span></span><span></span><span></span>";
      log.append(typing);
      scroll();
      setTimeout(() => {
        typing.remove();
        const m = el("div", "msg bot-msg");
        if (typeof content === "string") m.textContent = content;
        else m.append(content);
        log.append(m);
        scroll();
        resolve();
      }, reduced ? 0 : delay);
    });

  const me = (text) => {
    log.append(el("div", "msg me-msg", text));
    scroll();
  };

  // Antwortmöglichkeiten als Buttons (einfach oder mehrfach)
  const ask = (options, { multi = false } = {}) =>
    new Promise((resolve) => {
      choices.innerHTML = "";
      const picked = new Set();
      options.forEach((o) => {
        const b = el("button", "bot-chip", o.label);
        b.type = "button";
        b.addEventListener("click", () => {
          if (!multi) {
            choices.innerHTML = "";
            me(o.label);
            resolve({ keys: [o.key], text: "" });
            return;
          }
          picked.has(o.key) ? picked.delete(o.key) : picked.add(o.key);
          b.classList.toggle("on", picked.has(o.key));
          b.setAttribute("aria-pressed", String(picked.has(o.key)));
          done.disabled = picked.size === 0;
        });
        if (multi) b.setAttribute("aria-pressed", "false");
        choices.append(b);
      });
      const done = el("button", "bot-chip bot-done", "Weiter →");
      done.type = "button";
      if (multi) {
        done.disabled = true;
        done.addEventListener("click", () => {
          const labels = options.filter((o) => picked.has(o.key)).map((o) => o.label);
          choices.innerHTML = "";
          me(labels.join(", "));
          resolve({ keys: [...picked], text: "" });
        });
        choices.append(done);
      }
      pending = (text) => {
        choices.innerHTML = "";
        me(text);
        resolve({ keys: [], text });
      };
      scroll();
    });

  let pending = null;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const t = input.value.trim();
    if (!t) return;
    input.value = "";
    if (pending) {
      const p = pending;
      pending = null;
      p(t);
    }
  });

  // Freitext in Interessen und Berufe übersetzen
  const fromText = (text) => {
    const t = norm(text);
    const hits = BERUFE.filter((b) => b.worte.some((w) => t.includes(norm(w))));
    const interests = new Set();
    hits.forEach((b) => b.tags.forEach((tag) => Object.entries(TAG_MAP).forEach(([k, v]) => v.includes(tag) && interests.add(k))));
    if (/hand|werkstatt|draußen|draussen|bau|körper|koerper|praktisch/.test(t)) interests.add("bauen");
    if (/computer|pc|schreibtisch|büro|buero/.test(t)) interests.add("verwalten");
    if (/menschen|reden|kommunik|kontakt/.test(t)) interests.add("kunden");
    return { hits, interests: [...interests] };
  };

  const score = (a) =>
    BERUFE.map((b) => {
      let s = 0;
      if (a.ort === "beides" || b.ort === "beides" || b.ort === a.ort) s += 3;
      else s -= 3;
      a.interessen.forEach((k) => (TAG_MAP[k] || []).forEach((tag) => b.tags.includes(tag) && (s += 2)));
      if (b.ausb.includes(a.ausb)) s += 3;
      else if (a.ausb === "keine") s -= 4;
      else s -= 1;
      if (a.direkt.includes(b)) s += 5;
      return { b, s };
    })
      .sort((x, y) => y.s - x.s)
      .slice(0, 3)
      .map((x) => x.b);

  const resultCard = (beruf, seen = new Set()) => {
    const c = el("div", "bot-result");
    c.append(el("b", null, beruf.name), el("span", "bot-cat", beruf.kategorie), el("p", null, beruf.text));
    const jobs = (window.STELLEN || []).filter((s) => s.kategorie === beruf.kategorie && !seen.has(s.id)).slice(0, 2);
    jobs.forEach((s) => seen.add(s.id));
    if (jobs.length) {
      const list = el("div", "bot-jobs");
      list.append(el("small", null, "Passende offene Stellen:"));
      jobs.forEach((s) => {
        const a = el("a", null, `${s.titel} · ${s.ort}`);
        a.href = `stellen.html#stelle-${s.id}`;
        list.append(a);
      });
      c.append(list);
    }
    return c;
  };

  // ---------- Gesprächsablauf ----------
  let running = false;
  const start = async () => {
    if (running) return;
    running = true;
    log.innerHTML = "";
    choices.innerHTML = "";
    const a = { ort: "beides", interessen: [], ausb: "keine", zeit: "", direkt: [] };

    await say("Hallo! 👋 Ich helfe Ihnen in vier kurzen Fragen, Berufe zu finden, die zu Ihnen passen.", 300);
    await say("Wo arbeiten Sie lieber?");
    let r = await ask([
      { key: "hand", label: "🔧 Mit den Händen / Werkstatt" },
      { key: "buero", label: "💻 Am Schreibtisch / Büro" },
      { key: "beides", label: "🤷 Beides / weiß nicht" },
    ]);
    if (r.text) {
      const f = fromText(r.text);
      a.direkt.push(...f.hits);
      a.interessen.push(...f.interests);
      a.ort = /buero|büro|computer|schreibtisch/.test(norm(r.text)) ? "buero" : f.hits.length ? f.hits[0].ort : "beides";
    } else a.ort = r.keys[0];

    await say("Was macht Ihnen Spaß? Sie können mehrere auswählen.");
    r = await ask(INTERESSEN, { multi: true });
    if (r.text) {
      const f = fromText(r.text);
      a.direkt.push(...f.hits);
      a.interessen.push(...f.interests);
    } else a.interessen.push(...r.keys);

    await say("Welche Ausbildung oder Erfahrung bringen Sie mit?");
    r = await ask([
      { key: "technik", label: "Ausbildung Handwerk / Technik" },
      { key: "kaufm", label: "Kaufmännische Ausbildung" },
      { key: "studium", label: "Studium" },
      { key: "keine", label: "Keine / Quereinstieg" },
    ]);
    if (r.text) {
      const t = norm(r.text);
      a.ausb = /kaufm|buero|büro|bank|handel/.test(t) ? "kaufm" : /studi|bachelor|master/.test(t) ? "studium" : /keine|ohne|quer/.test(t) ? "keine" : "technik";
    } else a.ausb = r.keys[0];

    await say("Und wie möchten Sie arbeiten?");
    r = await ask([
      { key: "voll", label: "Vollzeit" },
      { key: "teil", label: "Teilzeit" },
      { key: "schicht", label: "Schicht ist okay" },
      { key: "egal", label: "Egal" },
    ]);
    a.zeit = r.text || { voll: "Vollzeit", teil: "Teilzeit", schicht: "Schicht möglich", egal: "flexibel" }[r.keys[0]];

    const top = score(a);
    await say("Danke! Diese Berufe passen gut zu Ihnen:", 900);
    const wrap = el("div", "bot-results");
    const seen = new Set();
    top.forEach((b) => wrap.append(resultCard(b, seen)));
    await say(wrap, 300);

    const summary = `Hallo Herr Wagner, ich habe den Berufs-Check gemacht. Vorschläge: ${top.map((b) => b.name).join(", ")}. Arbeitszeit: ${a.zeit}. Können Sie mich beraten?`;
    const cta = el("div", "bot-cta");
    const wa = el("a", "bot-cta-wa", "Ergebnis per WhatsApp an Ricky");
    wa.href = `https://wa.me/${WA}?text=${encodeURIComponent(summary)}`;
    wa.target = "_blank";
    wa.rel = "noopener";
    const jobs = el("a", "bot-cta-jobs", "Alle Stellen ansehen");
    jobs.href = "stellen.html";
    cta.append(wa, jobs);
    await say("Nicht das Passende dabei? Ich berate Sie gern persönlich – kostenlos:");
    await say(cta, 250);
    choices.innerHTML = "";
    const again = el("button", "bot-chip", "↺ Nochmal starten");
    again.type = "button";
    again.addEventListener("click", () => {
      running = false;
      start();
    });
    choices.append(again);
    pending = async (text) => {
      // Freie Frage nach dem Check: passende Berufe zum Stichwort
      me(text);
      const f = fromText(text);
      if (f.hits.length) {
        await say(`Dazu passen zum Beispiel:`);
        const w = el("div", "bot-results");
        const seen = new Set();
        f.hits.slice(0, 3).forEach((b) => w.append(resultCard(b, seen)));
        await say(w, 200);
      } else {
        await say("Dazu habe ich leider keinen passenden Beruf gefunden. Schreiben Sie Ricky direkt – er kennt den Markt in Mainfranken genau.");
      }
    };
    running = false;
  };

  // ---------- Öffnen / Schließen ----------
  // iPhone: Chat an den sichtbaren Bereich anpassen (Tastatur) und Seite dahinter sperren
  const small = window.matchMedia("(max-width: 560px)");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const vv = window.visualViewport;
  const fitViewport = () => {
    if (!vv || panel.hidden || !small.matches) {
      panel.style.removeProperty("height");
      panel.style.removeProperty("transform");
      return;
    }
    panel.style.height = `${vv.height}px`;
    panel.style.transform = `translateY(${vv.offsetTop}px)`;
    scroll();
  };
  if (vv) {
    vv.addEventListener("resize", fitViewport);
    vv.addEventListener("scroll", fitViewport);
  }

  const open = () => {
    panel.hidden = false;
    root.classList.add("open");
    if (small.matches) document.documentElement.classList.add("bot-lock");
    fitViewport();
    triggers.forEach((t) => t.setAttribute("aria-expanded", "true"));
    if (!log.childElementCount) start();
    // Auf Touch-Geräten nicht automatisch fokussieren, sonst öffnet die Tastatur und verdeckt die Antworten
    if (finePointer) setTimeout(() => input.focus({ preventScroll: true }), 50);
  };
  const close = () => {
    panel.hidden = true;
    root.classList.remove("open");
    document.documentElement.classList.remove("bot-lock");
    fitViewport();
    triggers.forEach((t) => t.setAttribute("aria-expanded", "false"));
    if (opener) opener.focus({ preventScroll: true });
  };
  root.querySelector(".bot-close").addEventListener("click", close);
  root.querySelector(".bot-restart").addEventListener("click", () => {
    running = false;
    start();
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && !panel.hidden && close());
  triggers.forEach((t) => {
    t.setAttribute("aria-controls", "bot-panel");
    t.setAttribute("aria-expanded", "false");
    t.addEventListener("click", (e) => {
      e.preventDefault();
      opener = t;
      panel.hidden ? open() : close();
    });
  });
  if (location.hash === "#berufs-check") open();
})();
