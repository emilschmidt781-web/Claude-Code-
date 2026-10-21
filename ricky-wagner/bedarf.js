// Formular „Personalbedarf melden“ für Unternehmen: drei Schritte, mehrere Stellen,
// Zusammenfassung und Versand per E-Mail oder WhatsApp.
// Optional: FORM_ENDPOINT auf eine Formspree-/Formular-URL setzen, dann wird die
// Anfrage direkt verschickt (POST, JSON) und landet ohne Mailprogramm im Postfach.
(() => {
  const FORM_ENDPOINT = ""; // z. B. "https://formspree.io/f/xxxxxxx"
  const MAIL = "wskarrierepartner@icloud.com";
  const WA = "491776880175";
  const KATEGORIEN = {
    "Gewerblich-technisch": ["Handwerk", "Elektro & Technik", "Industrie & Produktion", "Logistik & Lager"],
    Kaufmännisch: ["Büro & Verwaltung", "Buchhaltung & Finanzen", "Vertrieb & Kundenservice"],
  };

  const form = document.getElementById("bedarf-form");
  if (!form) return;
  const steps = [...form.querySelectorAll(".step")];
  const bar = [...form.querySelectorAll(".steps-bar li")];
  const back = form.querySelector(".step-back");
  const next = form.querySelector(".step-next");
  const send = form.querySelector(".step-send");
  const note = document.getElementById("bedarf-note");
  const positions = form.querySelector(".positions");
  const summary = form.querySelector(".summary");
  const done = document.getElementById("bedarf-done");
  let current = 1;
  let count = 0;

  // ---------- Stellen-Block (mehrfach) ----------
  const katOptions = Object.entries(KATEGORIEN)
    .map(([g, ks]) => `<optgroup label="${g}">${ks.map((k) => `<option>${k}</option>`).join("")}</optgroup>`)
    .join("");

  const addPosition = () => {
    count++;
    const n = count;
    const box = document.createElement("div");
    box.className = "position";
    box.innerHTML = `
      <div class="position-head"><b>Stelle ${n}</b>${n > 1 ? '<button type="button" class="position-remove" aria-label="Stelle entfernen">Entfernen</button>' : ""}</div>
      <div class="form-row">
        <label>Gesuchter Beruf / Position<input type="text" name="beruf" placeholder="z. B. Elektroniker (m/w/d)" required /></label>
        <label>Bereich<select name="kategorie" required><option value="">Bitte wählen</option>${katOptions}</select></label>
      </div>
      <div class="form-row form-row-3">
        <label>Anzahl<input type="number" name="anzahl" min="1" value="1" inputmode="numeric" required /></label>
        <label>Arbeitszeit<select name="zeit"><option>Vollzeit</option><option>Teilzeit</option><option>Schicht</option><option>Minijob</option></select></label>
        <label>Start<select name="start"><option>Sofort</option><option>In 1–3 Monaten</option><option>Später / flexibel</option></select></label>
      </div>
      <label>Anforderungen &amp; Aufgaben <small>(optional)</small><textarea name="anforderungen" rows="2" placeholder="z. B. Ausbildung, Führerschein, Erfahrung, Software …"></textarea></label>
      <label>Gehaltsrahmen <small>(optional, wird nicht veröffentlicht)</small><input type="text" name="gehalt" placeholder="z. B. 18–22 €/h oder 45.000 € p. a." /></label>`;
    const remove = box.querySelector(".position-remove");
    if (remove) remove.addEventListener("click", () => box.remove());
    positions.append(box);
    return box;
  };
  addPosition();
  form.querySelector(".add-position").addEventListener("click", () => {
    const box = addPosition();
    box.querySelector("input").focus();
  });

  // ---------- Schritte ----------
  const fieldsOf = (step) => [...steps[step - 1].querySelectorAll("input[required], select[required], textarea[required]")];
  const validate = (step) => {
    let first = null;
    fieldsOf(step).forEach((f) => {
      const ok = f.type === "checkbox" ? f.checked : f.checkValidity() && String(f.value).trim() !== "";
      f.classList.toggle("invalid", !ok);
      if (!ok && !first) first = f;
    });
    if (first) {
      note.textContent = first.type === "checkbox" ? "Bitte stimmen Sie der Datenschutzerklärung zu." : "Bitte füllen Sie die markierten Felder aus.";
      note.classList.add("error");
      first.focus();
      return false;
    }
    note.textContent = "";
    note.classList.remove("error");
    return true;
  };

  const collect = () => {
    const v = (name) => (form.querySelector(`[name="${name}"]:checked`) || form.querySelector(`[name="${name}"]`))?.value.trim() || "";
    const pos = [...positions.querySelectorAll(".position")].map((p) => {
      const g = (name) => p.querySelector(`[name="${name}"]`).value.trim();
      return { beruf: g("beruf"), kategorie: g("kategorie"), anzahl: g("anzahl"), zeit: g("zeit"), start: g("start"), anforderungen: g("anforderungen"), gehalt: g("gehalt") };
    });
    return {
      firma: v("firma"), branche: v("branche"), ort: v("ort"), groesse: v("groesse"),
      name: v("name"), funktion: v("funktion"), telefon: v("telefon"), email: v("email"),
      rueckruf: v("rueckruf"), nachricht: v("nachricht"), stellen: pos,
    };
  };

  const asText = (d) =>
    [
      `PERSONALBEDARF – ${d.firma}`,
      "",
      `Unternehmen: ${d.firma}`,
      `Branche: ${d.branche}`,
      `Einsatzort: ${d.ort}`,
      d.groesse && `Mitarbeiter: ${d.groesse}`,
      "",
      ...d.stellen.flatMap((s, i) => [
        `Stelle ${i + 1}: ${s.anzahl}× ${s.beruf} (${s.kategorie})`,
        `  ${s.zeit} · Start: ${s.start}`,
        s.anforderungen && `  Anforderungen: ${s.anforderungen}`,
        s.gehalt && `  Gehalt: ${s.gehalt}`,
      ]),
      "",
      `Ansprechpartner: ${d.name}${d.funktion ? ` (${d.funktion})` : ""}`,
      `Telefon: ${d.telefon}`,
      `E-Mail: ${d.email}`,
      `Kontakt gewünscht per: ${d.rueckruf}`,
      d.nachricht && `Nachricht: ${d.nachricht}`,
    ]
      .filter((line) => typeof line === "string")
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");

  const renderSummary = () => {
    const d = collect();
    summary.innerHTML = "";
    const h = document.createElement("p");
    h.className = "summary-title";
    h.textContent = "Ihre Angaben im Überblick";
    const firm = document.createElement("p");
    firm.textContent = `${d.firma} · ${d.branche} · ${d.ort}`;
    const ul = document.createElement("ul");
    d.stellen.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = `${s.anzahl}× ${s.beruf} – ${s.kategorie}, ${s.zeit}, Start: ${s.start}`;
      ul.append(li);
    });
    summary.append(h, firm, ul);
  };

  const show = (step) => {
    current = step;
    steps.forEach((s, i) => (s.hidden = i !== step - 1));
    bar.forEach((li, i) => {
      li.classList.toggle("active", i === step - 1);
      li.classList.toggle("done", i < step - 1);
    });
    back.hidden = step === 1;
    next.hidden = step === steps.length;
    send.hidden = step !== steps.length;
    if (step === steps.length) renderSummary();
    steps[step - 1].classList.remove("enter");
    void steps[step - 1].offsetWidth;
    steps[step - 1].classList.add("enter");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  next.addEventListener("click", () => validate(current) && show(current + 1));
  back.addEventListener("click", () => show(current - 1));
  bar.forEach((li, i) =>
    li.addEventListener("click", () => {
      if (i + 1 < current) show(i + 1);
    })
  );

  // ---------- Absenden ----------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate(current)) return;
    const d = collect();
    const text = asText(d);
    const subject = `Personalbedarf: ${d.stellen.map((s) => s.beruf).join(", ")} – ${d.firma}`;

    if (FORM_ENDPOINT) {
      send.disabled = true;
      note.textContent = "Wird gesendet …";
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ _subject: subject, ...d, text }),
        });
        if (!res.ok) throw new Error(res.status);
        form.hidden = true;
        done.hidden = false;
        done.querySelector("h2").textContent = "Vielen Dank!";
        done.querySelector("p").textContent = "Ihre Anfrage ist eingegangen. Ich melde mich innerhalb von 24 Stunden.";
        done.querySelector(".quick-links").hidden = true;
        return;
      } catch {
        note.textContent = "Senden hat nicht geklappt – bitte nutzen Sie E-Mail oder WhatsApp.";
        note.classList.add("error");
      } finally {
        send.disabled = false;
      }
    }

    done.querySelector(".done-mail").href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    done.querySelector(".done-wa").href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  done.querySelector(".done-edit").addEventListener("click", () => {
    done.hidden = true;
    form.hidden = false;
    show(current);
  });
})();
