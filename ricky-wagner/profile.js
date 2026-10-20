// Stellen- und Bewerberprofile für die Website.
//
// Pflege: Einträge einfach hinzufügen, ändern oder löschen.
// - id:        eindeutige Kennung, wird für Direktlinks verwendet (z. B. #stelle-S-101)
// - bereich:   "technisch" (gewerblich-technisch) oder "kaufmaennisch"
// - kategorie: Unterbereich für die Suche, z. B. "Handwerk", "Logistik & Lager",
//              "Büro & Verwaltung" – neue Kategorien erscheinen automatisch als Filter
// - beispiel:  true zeigt das Label „Beispiel“ – vor dem Livegang durch echte Profile ersetzen
//              oder die Zeile entfernen.
//
// Bewerberprofile bitte nur anonymisiert und mit Einverständnis der Person veröffentlichen.

window.STELLEN = [
  {
    id: "S-101",
    kategorie: "Elektro & Technik",
    titel: "Elektroniker (m/w/d) für Betriebstechnik",
    bereich: "technisch",
    ort: "Kitzingen",
    art: "Vollzeit",
    text: "Wartung und Instandhaltung von Produktionsanlagen in einem mittelständischen Industriebetrieb.",
    punkte: ["Abgeschlossene Ausbildung als Elektroniker", "Schichtbereitschaft", "Unbefristete Festanstellung"],
    beispiel: true,
  },
  {
    id: "S-102",
    kategorie: "Industrie & Produktion",
    titel: "Industriemechaniker (m/w/d)",
    bereich: "technisch",
    ort: "Würzburg",
    art: "Vollzeit",
    text: "Montage, Inbetriebnahme und Reparatur von Maschinen im Sondermaschinenbau.",
    punkte: ["Ausbildung im Metallbereich", "Technisches Verständnis", "Übertarifliche Bezahlung"],
    beispiel: true,
  },
  {
    id: "S-103",
    kategorie: "Logistik & Lager",
    titel: "Fachkraft für Lagerlogistik (m/w/d)",
    bereich: "technisch",
    ort: "Dettelbach",
    art: "Vollzeit",
    text: "Warenannahme, Kommissionierung und Versand in einem modernen Logistikzentrum.",
    punkte: ["Staplerschein von Vorteil", "Zuverlässige Arbeitsweise", "Frühschicht / Spätschicht"],
    beispiel: true,
  },
  {
    id: "S-104",
    kategorie: "Handwerk",
    titel: "Anlagenmechaniker SHK (m/w/d)",
    bereich: "technisch",
    ort: "Kitzingen",
    art: "Vollzeit",
    text: "Installation und Wartung von Heizungs-, Sanitär- und Klimaanlagen bei Privat- und Gewerbekunden.",
    punkte: ["Ausbildung im SHK-Handwerk", "Führerschein Klasse B", "Firmenfahrzeug"],
    beispiel: true,
  },
  {
    id: "S-201",
    kategorie: "Büro & Verwaltung",
    titel: "Kaufmännischer Sachbearbeiter (m/w/d)",
    bereich: "kaufmaennisch",
    ort: "Kitzingen",
    art: "Vollzeit",
    text: "Auftragsabwicklung, Kundenkommunikation und Angebotserstellung im Innendienst.",
    punkte: ["Kaufmännische Ausbildung", "Sicherer Umgang mit MS Office", "Gleitzeit möglich"],
    beispiel: true,
  },
  {
    id: "S-202",
    kategorie: "Buchhaltung & Finanzen",
    titel: "Buchhalter (m/w/d)",
    bereich: "kaufmaennisch",
    ort: "Würzburg",
    art: "Teilzeit / Vollzeit",
    text: "Kreditoren- und Debitorenbuchhaltung sowie Vorbereitung der Monatsabschlüsse.",
    punkte: ["Erfahrung in DATEV", "Genaue Arbeitsweise", "Homeoffice anteilig"],
    beispiel: true,
  },
  {
    id: "S-203",
    kategorie: "Vertrieb & Kundenservice",
    titel: "Vertriebsmitarbeiter Innendienst (m/w/d)",
    bereich: "kaufmaennisch",
    ort: "Kitzingen",
    art: "Vollzeit",
    text: "Betreuung von Bestandskunden, Angebotsverfolgung und Pflege des CRM-Systems.",
    punkte: ["Kaufmännische Ausbildung", "Freude am Kundenkontakt", "Attraktive Provision"],
    beispiel: true,
  },
];

window.KANDIDATEN = [
  {
    id: "K-301",
    kategorie: "Elektro & Technik",
    beruf: "Mechatroniker",
    bereich: "technisch",
    erfahrung: "8 Jahre Berufserfahrung",
    region: "Raum Kitzingen",
    verfuegbar: "ab sofort",
    staerken: ["SPS-Programmierung", "Instandhaltung", "Führerschein B"],
    beispiel: true,
  },
  {
    id: "K-302",
    kategorie: "Handwerk",
    beruf: "Schweißer (MAG/WIG)",
    bereich: "technisch",
    erfahrung: "5 Jahre Berufserfahrung",
    region: "Raum Würzburg",
    verfuegbar: "Kündigungsfrist 1 Monat",
    staerken: ["Schweißzertifikate", "Zeichnungslesen", "Schichtbereit"],
    beispiel: true,
  },
  {
    id: "K-401",
    kategorie: "Büro & Verwaltung",
    beruf: "Industriekauffrau",
    bereich: "kaufmaennisch",
    erfahrung: "6 Jahre Berufserfahrung",
    region: "Raum Kitzingen",
    verfuegbar: "ab 01.01.",
    staerken: ["Einkauf", "SAP", "Englisch fließend"],
    beispiel: true,
  },
  {
    id: "K-402",
    kategorie: "Büro & Verwaltung",
    beruf: "Bürokaufmann",
    bereich: "kaufmaennisch",
    erfahrung: "3 Jahre Berufserfahrung",
    region: "Mainfranken",
    verfuegbar: "ab sofort",
    staerken: ["Auftragsabwicklung", "Kundenservice", "MS Office"],
    beispiel: true,
  },
];
