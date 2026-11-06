// Live-Editor für die Brandner-Studios-Website:
// Texte direkt anklicken und ändern, Bereiche per Drag & Drop verschieben, Bilder per Drag & Drop tauschen.
// Gespeichert wird im Speicher dieser Seite (db), Bilder als Dateien (assets). Claude übernimmt den Stand danach in die echte Website.
(function () {
  const main = document.querySelector("main");
  if (!main) return;

  // ---------- Texte finden und fest nummerieren (vor jeder Umsortierung) ----------
  const INLINE = new Set(["B", "STRONG", "EM", "BR"]);
  const CANDIDATES = "h1,h2,h3,p,li,summary,figcaption,span,b,small,a";
  const texts = [];
  main.querySelectorAll(CANDIDATES).forEach((el) => {
    if (el.closest("svg,script,style,label,button,select,form,[hidden],[aria-hidden='true'],.devices,.giant")) return;
    const kids = [...el.children];
    // Fragen: Plus-Symbol in der Zusammenfassung ignorieren
    const own = kids.filter((k) => !(el.tagName === "SUMMARY" && k.classList.contains("plus")));
    if (own.some((k) => !INLINE.has(k.tagName))) return;
    if ((el.textContent || "").trim().length < 2) return;
    // Nur das innerste Element nehmen: <b> in einem Absatz bleibt Teil des Absatzes
    if (INLINE.has(el.tagName) && el.parentElement && el.parentElement.closest(CANDIDATES) && texts.some((t) => t.el === el.parentElement)) return;
    texts.push({ el, id: "e" + String(texts.length + 1).padStart(3, "0") });
  });
  texts.forEach((t) => {
    t.el.dataset.eid = t.id;
    t.original = clean(t.el);
  });

  // Inhalt eines Textfelds sauber lesen: nur fett, kursiv und Zeilenumbruch bleiben
  function clean(el) {
    let out = "";
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) out += n.textContent;
      else if (n.nodeType === 1) {
        if (n.classList && n.classList.contains("plus")) return;
        if (n.tagName === "BR") out += "<br>";
        else if (n.tagName === "B" || n.tagName === "STRONG") out += "<b>" + esc(n.textContent) + "</b>";
        else if (n.tagName === "EM" || n.tagName === "I") out += "<em>" + esc(n.textContent) + "</em>";
        else out += esc(n.textContent);
      }
    });
    return out.replace(/\s+/g, " ").trim();
  }
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function setHtml(el, html) {
    const plus = el.tagName === "SUMMARY" ? el.querySelector(".plus") : null;
    el.innerHTML = html;
    if (plus) el.appendChild(plus);
  }

  // ---------- Bereiche ----------
  const sectionKey = (s) => s.id || s.classList[0];
  const sections = () => [...main.querySelectorAll(":scope > section:not([hidden])")];
  const originalOrder = sections().map(sectionKey);
  const NAMES = { hero: "Startbild", perks: "Vorteile", "ueber-mich": "Über mich", leistungen: "Leistungen", ablauf: "Ablauf", fragen: "Fragen", kontakt: "Kontakt" };

  // ---------- Bilder, die man tauschen kann ----------
  const images = [...main.querySelectorAll("img")].filter((img) => !img.closest(".devices,[hidden],.voices"));
  images.forEach((img, i) => {
    img.dataset.iid = "i" + String(i + 1).padStart(2, "0");
    img.dataset.origSrc = img.getAttribute("src");
  });

  // ---------- Zustand ----------
  let state = { texts: {}, order: null, images: {} };
  let db = null, assets = null, docRef = null, editing = false, saveTimer = null, saving = false, saveAgain = false;

  function apply(s) {
    texts.forEach((t) => {
      const v = s.texts && s.texts[t.id];
      if (document.activeElement === t.el) return;
      setHtml(t.el, v ? v.html : t.original);
    });
    const order = (s.order && s.order.length ? s.order : originalOrder).filter((k) => sections().some((x) => sectionKey(x) === k));
    const hiddenOnes = [...main.querySelectorAll(":scope > section[hidden]")];
    order.forEach((k) => {
      const sec = sections().find((x) => sectionKey(x) === k);
      if (sec) main.appendChild(sec);
    });
    hiddenOnes.forEach((h) => main.appendChild(h));
    images.forEach((img) => {
      const v = s.images && s.images[img.dataset.iid];
      const src = v ? v.url : img.dataset.origSrc;
      if (img.getAttribute("src") !== src) { img.removeAttribute("srcset"); img.setAttribute("src", src); }
    });
    refreshCount();
  }

  function collect() {
    const out = { texts: {}, order: null, images: state.images || {} };
    texts.forEach((t) => {
      const now = clean(t.el);
      if (now !== t.original) out.texts[t.id] = { html: now, original: t.original };
    });
    const order = sections().map(sectionKey);
    out.order = order.join() === originalOrder.join() ? null : order;
    return out;
  }

  function changeCount(s) {
    return Object.keys(s.texts || {}).length + (s.order ? 1 : 0) + Object.keys(s.images || {}).length;
  }

  // ---------- Speichern: eine Pause abwarten, dann genau ein Schreibvorgang ----------
  function scheduleSave() {
    status("Speichert …");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 900);
  }
  async function save() {
    if (!docRef) { status("Nicht gespeichert – Speicher nicht verbunden", "err"); return; }
    if (saving) { saveAgain = true; return; }
    saving = true;
    const next = collect();
    try {
      await docRef.set({ texts: next.texts, order: next.order, images: next.images, updated: new Date().toISOString() });
      state = next;
      status("Gespeichert ✓", "ok");
    } catch (e) {
      status(e && e.code === "invalid_argument" ? "Keine Berechtigung zum Speichern" : "Speichern fehlgeschlagen – nochmal ändern", "err");
    }
    saving = false;
    refreshCount();
    if (saveAgain) { saveAgain = false; save(); }
  }

  // ---------- Werkzeugleiste ----------
  const bar = document.createElement("div");
  bar.className = "ed-bar";
  bar.innerHTML =
    '<button type="button" class="ed-toggle" aria-pressed="false"><span class="ed-dot"></span><span class="ed-label">Bearbeiten</span></button>' +
    '<span class="ed-status" role="status" aria-live="polite">Wird geladen …</span>' +
    '<span class="ed-count"></span>' +
    '<button type="button" class="ed-reset" hidden>Alles zurücksetzen</button>';
  document.body.appendChild(bar);
  const toggle = bar.querySelector(".ed-toggle");
  const statusEl = bar.querySelector(".ed-status");
  const countEl = bar.querySelector(".ed-count");
  const resetBtn = bar.querySelector(".ed-reset");
  let confirmReset = false;

  function status(text, kind) {
    statusEl.textContent = text;
    statusEl.className = "ed-status" + (kind ? " " + kind : "");
  }
  function refreshCount() {
    const n = changeCount(collect());
    countEl.textContent = n === 0 ? "" : n === 1 ? "1 Änderung" : n + " Änderungen";
    resetBtn.hidden = n === 0;
  }

  const help = document.createElement("div");
  help.className = "ed-help";
  help.innerHTML =
    "<b>Bearbeiten ist an.</b> Klick auf einen Text und schreib los. Bereiche ziehst du am Griff <span>⠿</span> oben links. Ein Bild tauschst du, indem du ein Foto vom Computer darauf ziehst." +
    "<br><small>Fertig? Schreib im Chat <code>Änderungen übernehmen</code>.</small>" +
    '<button type="button" class="ed-help-close" aria-label="Hinweis schließen">×</button>';
  document.body.appendChild(help);
  let helpClosed = false;
  help.querySelector(".ed-help-close").addEventListener("click", () => { helpClosed = true; help.classList.remove("show"); });

  function setEditing(on) {
    editing = on;
    document.documentElement.classList.toggle("ed-on", on);
    toggle.setAttribute("aria-pressed", on);
    toggle.querySelector(".ed-label").textContent = on ? "Fertig" : "Bearbeiten";
    texts.forEach((t) => {
      if (on) t.el.setAttribute("contenteditable", "true");
      else t.el.removeAttribute("contenteditable");
    });
    sections().forEach((s) => (s.draggable = false));
    help.classList.toggle("show", on && !helpClosed);
  }
  toggle.addEventListener("click", () => setEditing(!editing));

  resetBtn.addEventListener("click", async () => {
    if (!confirmReset) {
      confirmReset = true;
      resetBtn.textContent = "Wirklich alles zurücksetzen?";
      setTimeout(() => { confirmReset = false; resetBtn.textContent = "Alles zurücksetzen"; }, 4000);
      return;
    }
    confirmReset = false;
    resetBtn.textContent = "Alles zurücksetzen";
    state = { texts: {}, order: null, images: {} };
    apply(state);
    if (docRef) {
      try { await docRef.set({ texts: {}, order: null, images: {}, updated: new Date().toISOString() }); status("Zurückgesetzt ✓", "ok"); }
      catch (e) { status("Zurücksetzen fehlgeschlagen", "err"); }
    }
    refreshCount();
  });

  // ---------- Texte bearbeiten ----------
  document.addEventListener("click", (e) => {
    if (!editing) return;
    if (e.target.closest(".ed-bar,.ed-help,.ed-handle")) return;
    // Links, Knöpfe und aufklappbare Fragen im Bearbeiten-Modus nicht auslösen
    if (e.target.closest("a,summary,button,[contenteditable]")) e.preventDefault();
  }, true);
  document.addEventListener("keydown", (e) => {
    if (!editing || !e.target.isContentEditable) return;
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.target.blur(); }
    if (e.key === " " && e.target.closest("summary")) { e.preventDefault(); document.execCommand("insertText", false, " "); }
    if (e.key === "Escape") e.target.blur();
  });
  document.addEventListener("paste", (e) => {
    if (!editing || !e.target.closest("[contenteditable]")) return;
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text.replace(/\s+/g, " "));
  });
  document.addEventListener("input", (e) => {
    if (editing && e.target.closest && e.target.closest("[data-eid]")) { refreshCount(); scheduleSave(); }
  });

  // ---------- Bereiche verschieben (Drag & Drop am Griff, dazu Pfeile für Touch) ----------
  let dragged = null;
  function addHandles() {
    sections().forEach((sec) => {
      if (sec.querySelector(":scope > .ed-handle")) return;
      const h = document.createElement("div");
      h.className = "ed-handle";
      h.innerHTML =
        '<span class="ed-grip" draggable="true" title="Ziehen zum Verschieben">⠿</span>' +
        '<span class="ed-name"></span>' +
        '<button type="button" class="ed-up" aria-label="Bereich nach oben">↑</button>' +
        '<button type="button" class="ed-down" aria-label="Bereich nach unten">↓</button>';
      h.querySelector(".ed-name").textContent = NAMES[sectionKey(sec)] || sectionKey(sec);
      sec.prepend(h);
      const grip = h.querySelector(".ed-grip");
      grip.addEventListener("dragstart", (e) => {
        dragged = sec;
        sec.classList.add("ed-dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", sectionKey(sec));
        try { e.dataTransfer.setDragImage(h, 20, 20); } catch (_) {}
      });
      grip.addEventListener("dragend", () => {
        sec.classList.remove("ed-dragging");
        sections().forEach((s) => s.classList.remove("ed-over-top", "ed-over-bottom"));
        dragged = null;
      });
      h.querySelector(".ed-up").addEventListener("click", () => move(sec, -1));
      h.querySelector(".ed-down").addEventListener("click", () => move(sec, 1));
      sec.addEventListener("dragover", (e) => {
        if (!dragged || dragged === sec || isFileDrag(e)) return;
        e.preventDefault();
        const r = sec.getBoundingClientRect();
        const top = e.clientY < r.top + r.height / 2;
        sec.classList.toggle("ed-over-top", top);
        sec.classList.toggle("ed-over-bottom", !top);
      });
      sec.addEventListener("dragleave", () => sec.classList.remove("ed-over-top", "ed-over-bottom"));
      sec.addEventListener("drop", (e) => {
        if (!dragged || dragged === sec || isFileDrag(e)) return;
        e.preventDefault();
        const top = sec.classList.contains("ed-over-top");
        sec.classList.remove("ed-over-top", "ed-over-bottom");
        main.insertBefore(dragged, top ? sec : sec.nextSibling);
        afterMove(dragged);
      });
    });
  }
  function move(sec, dir) {
    const list = sections();
    const i = list.indexOf(sec);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    main.insertBefore(sec, dir < 0 ? list[j] : list[j].nextSibling);
    afterMove(sec);
  }
  function afterMove(sec) {
    sec.classList.add("ed-moved");
    setTimeout(() => sec.classList.remove("ed-moved"), 700);
    sec.scrollIntoView({ block: "nearest", behavior: "smooth" });
    refreshCount();
    scheduleSave();
  }

  // ---------- Bilder per Drag & Drop tauschen ----------
  const isFileDrag = (e) => e.dataTransfer && [...(e.dataTransfer.types || [])].includes("Files");
  images.forEach((img) => {
    const box = img.closest("figure,.frame,footer") || img.parentElement;
    box.classList.add("ed-imgbox");
    box.addEventListener("dragover", (e) => {
      if (!editing || !isFileDrag(e)) return;
      e.preventDefault();
      box.classList.add("ed-imgover");
    });
    box.addEventListener("dragleave", () => box.classList.remove("ed-imgover"));
    box.addEventListener("drop", async (e) => {
      if (!editing || !isFileDrag(e)) return;
      e.preventDefault();
      box.classList.remove("ed-imgover");
      const file = [...e.dataTransfer.files].find((f) => /^image\//.test(f.type));
      if (!file) { status("Bitte ein Bild ziehen (JPG, PNG oder WebP)", "err"); return; }
      if (!assets) { status("Bilder hochladen geht hier gerade nicht", "err"); return; }
      status("Bild wird hochgeladen …");
      try {
        const r = await assets.upload(file);
        img.removeAttribute("srcset");
        img.src = r.url;
        state.images = Object.assign({}, state.images, { [img.dataset.iid]: { url: r.url, assetId: r.id, original: img.dataset.origSrc } });
        refreshCount();
        scheduleSave();
      } catch (err) {
        status("Bild konnte nicht hochgeladen werden", "err");
      }
    });
  });
  // Ein Bild, das außerhalb eines Bildes losgelassen wird, öffnet sonst den Browser-Tab mit dem Bild
  window.addEventListener("dragover", (e) => { if (isFileDrag(e)) e.preventDefault(); });
  window.addEventListener("drop", (e) => { if (isFileDrag(e)) e.preventDefault(); });

  addHandles();

  // ---------- Speicher verbinden und live halten ----------
  async function connect() {
    if (!window.claude || !window.claude.use) { status("Nur Vorschau – Speichern geht auf claude.ai", "err"); return; }
    db = await window.claude.use("db");
    assets = await window.claude.use("assets");
    if (!db) { status("Nur ansehen – Speicher nicht verfügbar", "err"); return; }
    docRef = db.doc("editor/zustand");
    const slow = setTimeout(() => status("Gespeicherte Änderungen laden noch …", "err"), 10000);
    docRef.onSnapshot(
      (snap) => {
        if (!snap.metadata.fromCache) clearTimeout(slow);
        if (snap.metadata.hasPendingWrites) return;
        const d = snap.exists ? snap.data() : null;
        state = { texts: (d && d.texts) || {}, order: (d && d.order) || null, images: (d && d.images) || {} };
        apply(state);
        if (!snap.metadata.fromCache && statusEl.textContent.indexOf("Speichert") !== 0) status(changeCount(state) ? "Gespeichert ✓" : "Bereit", "ok");
      },
      () => { clearTimeout(slow); status("Verbindung zum Speicher unterbrochen – Seite neu laden", "err"); }
    );
  }
  refreshCount();
  connect();
})();
