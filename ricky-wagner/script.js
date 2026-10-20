// Mobiles Menü
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("nav-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  });

  menu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

// Jahreszahl im Footer
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Hero-Überschrift in Wörter zerlegen, damit sie nacheinander einfliegen
document.querySelectorAll(".split-words").forEach((el) => {
  let i = 0;
  const wrap = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(" ");
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.textContent = part;
          inner.style.setProperty("--i", i++);
          w.append(inner);
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
        wrap(child);
      }
    });
  };
  wrap(el);
});

// ---------- Stellen- und Bewerberprofile (Daten in profile.js) ----------
const PHONE_WA = "491776880175";
const MAIL = "wskarrierepartner@icloud.com";
const BEREICHE = { technisch: "Gewerblich-technisch", kaufmaennisch: "Kaufmännisch" };
const ICONS = {
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.5l8 5 8-5V6H4Zm16 2.85-7.47 4.67a1 1 0 0 1-1.06 0L4 8.85V18h16V8.85Z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0ZM8 21a5 5 0 0 1-3.5-8.5l2.1-2.1a1 1 0 1 1 1.4 1.4l-2.1 2.1a3 3 0 0 0 4.2 4.2l2.1-2.1a1 1 0 1 1 1.4 1.4l-2.1 2.1A5 5 0 0 1 8 21Zm9.4-7.6a1 1 0 0 1-.7-1.7l2.1-2.1a3 3 0 0 0-4.2-4.2l-2.1 2.1a1 1 0 1 1-1.4-1.4l2.1-2.1a5 5 0 0 1 7 7l-2.1 2.1a1 1 0 0 1-.7.3Z"/></svg>',
};

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
};

const toast = document.getElementById("toast");
let toastTimer;
const showToast = (msg) => {
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 2600);
};

const actionLink = (href, icon, label, external) => {
  const a = el("a");
  a.href = href;
  a.innerHTML = ICONS[icon];
  a.append(el("span", null, label));
  if (external) {
    a.target = "_blank";
    a.rel = "noopener";
  }
  return a;
};

const copyLinkButton = (anchor) => {
  const btn = el("button", "link-btn");
  btn.type = "button";
  btn.innerHTML = ICONS.link;
  btn.title = "Link kopieren";
  btn.setAttribute("aria-label", "Direktlink zu diesem Profil kopieren");
  btn.addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#${anchor}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link kopiert – jetzt einfach weiterschicken.");
    } catch {
      history.replaceState(null, "", `#${anchor}`);
      showToast("Link steht jetzt in der Adresszeile.");
    }
  });
  return btn;
};

// Für die Suche: Kleinschreibung, Umlaute und Akzente vereinheitlichen
const norm = (t) =>
  String(t || "")
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const card = (item, anchor, ort, fields) => {
  const { bereich, id, beispiel, kategorie } = item;
  const art = el("article", "profile reveal");
  art.id = anchor;
  art.dataset.bereich = bereich;
  art.dataset.kategorie = kategorie || "";
  art.dataset.ort = ort || "";
  art.dataset.search = norm([...fields, kategorie, BEREICHE[bereich], ort, id].flat().join(" "));
  const top = el("div", "profile-top");
  const label = el("span", null, `${kategorie || BEREICHE[bereich] || ""} · `);
  label.append(el("span", "nowrap", id));
  top.append(label);
  if (beispiel) top.append(el("span", "badge", "Beispiel"));
  art.append(top);
  return art;
};

const renderStellen = (list, root) => {
  list.forEach((s) => {
    const anchor = `stelle-${s.id}`;
    const art = card(s, anchor, s.ort, [s.titel, s.text, s.art, s.punkte || []]);
    art.append(el("h3", null, s.titel));
    const meta = el("div", "meta");
    [s.ort, s.art].filter(Boolean).forEach((m) => meta.append(el("span", null, m)));
    art.append(meta);
    if (s.text) art.append(el("p", null, s.text));
    if (s.punkte?.length) {
      const ul = el("ul");
      s.punkte.forEach((p) => ul.append(el("li", null, p)));
      art.append(ul);
    }
    const subject = `Bewerbung: ${s.titel} (${s.id})`;
    const body = `Guten Tag Herr Wagner,\n\nich interessiere mich für die Stelle „${s.titel}“ (${s.id}) in ${s.ort}.\n\nMein Name:\nTelefon:\n\nViele Grüße`;
    const wa = `Hallo Herr Wagner, ich interessiere mich für die Stelle „${s.titel}“ (${s.id}).`;
    const actions = el("div", "profile-actions");
    actions.append(
      actionLink(`mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "mail", "Jetzt bewerben"),
      actionLink(`https://wa.me/${PHONE_WA}?text=${encodeURIComponent(wa)}`, "wa", "WhatsApp", true),
      copyLinkButton(anchor)
    );
    art.append(actions);
    root.append(art);
  });
};

const renderKandidaten = (list, root) => {
  list.forEach((k) => {
    const anchor = `kandidat-${k.id}`;
    const art = card(k, anchor, k.region, [k.beruf, k.erfahrung, k.verfuegbar, k.staerken || []]);
    art.append(el("h3", null, k.beruf));
    const meta = el("div", "meta");
    [k.erfahrung, k.region, k.verfuegbar && `Verfügbar ${k.verfuegbar}`].filter(Boolean).forEach((m) => meta.append(el("span", null, m)));
    art.append(meta);
    if (k.staerken?.length) {
      const ul = el("ul");
      k.staerken.forEach((p) => ul.append(el("li", null, p)));
      art.append(ul);
    }
    const subject = `Anfrage Bewerberprofil ${k.id} (${k.beruf})`;
    const body = `Guten Tag Herr Wagner,\n\nwir interessieren uns für das Bewerberprofil ${k.id} (${k.beruf}).\n\nUnternehmen:\nAnsprechpartner:\nTelefon:\n\nViele Grüße`;
    const wa = `Hallo Herr Wagner, wir interessieren uns für das Bewerberprofil ${k.id} (${k.beruf}).`;
    const actions = el("div", "profile-actions");
    actions.append(
      actionLink(`mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "mail", "Profil anfragen"),
      actionLink(`https://wa.me/${PHONE_WA}?text=${encodeURIComponent(wa)}`, "wa", "WhatsApp", true),
      copyLinkButton(anchor)
    );
    art.append(actions);
    root.append(art);
  });
};

const stellenRoot = document.getElementById("stellen-liste");
const kandidatenRoot = document.getElementById("kandidaten-liste");
if (stellenRoot) renderStellen(window.STELLEN || [], stellenRoot);
if (kandidatenRoot) renderKandidaten(window.KANDIDATEN || [], kandidatenRoot);

// ---------- Suchsystem: Freitext + Kategorie + Ort ----------
const setupSearch = (form, items) => {
  const root = document.getElementById(form.dataset.target);
  if (!root) return;
  const cards = [...root.querySelectorAll(".profile")];
  const input = form.querySelector('input[type="search"]');
  const select = form.querySelector("select");
  const reset = form.querySelector(".search-reset");
  const count = form.querySelector(".search-count");
  const cats = form.querySelector(".cats");
  const state = { q: "", bereich: "", kategorie: "", ort: "" };

  // Orte/Regionen aus den Daten
  [...new Set(cards.map((c) => c.dataset.ort).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "de"))
    .forEach((o) => select.append(new Option(o, o)));

  // Kategorien nach Bereich gruppiert: [Alle] | Gewerblich-technisch: Handwerk … | Kaufmännisch: Büro …
  const chip = (label, bereich, kategorie, n) => {
    const b = el("button", "chip");
    b.type = "button";
    b.dataset.bereich = bereich;
    b.dataset.kategorie = kategorie;
    b.append(document.createTextNode(label));
    if (n != null) b.append(el("span", "chip-n", String(n)));
    return b;
  };
  const allChip = chip("Alle", "", "", items.length);
  const allGroup = el("div", "cat-group");
  allGroup.append(allChip);
  cats.append(allGroup);
  Object.entries(BEREICHE).forEach(([key, name]) => {
    const inBereich = items.filter((i) => i.bereich === key);
    if (!inBereich.length) return;
    const group = el("div", "cat-group");
    group.append(chip(name, key, "", inBereich.length));
    const kats = [...new Set(inBereich.map((i) => i.kategorie).filter(Boolean))];
    kats.forEach((k) => group.append(chip(k, key, k, inBereich.filter((i) => i.kategorie === k).length)));
    group.firstChild.classList.add("chip-head");
    cats.append(group);
  });

  const empty = el("div", "profiles-empty");
  empty.append(el("p", null, "Keine passenden Profile gefunden."));
  const emptyBtn = el("button", "chip", "Suche zurücksetzen");
  emptyBtn.type = "button";
  empty.append(emptyBtn);

  const apply = () => {
    const words = norm(state.q).split(/\s+/).filter(Boolean);
    let shown = 0;
    cards.forEach((c) => {
      const ok =
        (!state.bereich || c.dataset.bereich === state.bereich) &&
        (!state.kategorie || c.dataset.kategorie === state.kategorie) &&
        (!state.ort || c.dataset.ort === state.ort) &&
        words.every((w) => c.dataset.search.includes(w));
      c.hidden = !ok;
      if (ok) {
        shown++;
        c.classList.add("visible");
      }
    });
    cats.querySelectorAll(".chip").forEach((b) => {
      const on = b.dataset.bereich === state.bereich && b.dataset.kategorie === state.kategorie;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    const filtered = state.q || state.bereich || state.ort;
    reset.hidden = !filtered;
    count.textContent = filtered ? `${shown} von ${cards.length} Profilen` : `${cards.length} Profile`;
    if (shown === 0) root.append(empty);
    else empty.remove();
  };

  const clear = () => {
    Object.assign(state, { q: "", bereich: "", kategorie: "", ort: "" });
    input.value = "";
    select.value = "";
    apply();
  };

  input.addEventListener("input", () => {
    state.q = input.value;
    apply();
  });
  select.addEventListener("change", () => {
    state.ort = select.value;
    apply();
  });
  cats.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    state.bereich = b.dataset.bereich;
    state.kategorie = b.dataset.kategorie;
    apply();
  });
  reset.addEventListener("click", clear);
  emptyBtn.addEventListener("click", clear);
  apply();
};

document.querySelectorAll("form.search").forEach((form) => {
  const items = form.dataset.target === "stellen-liste" ? window.STELLEN || [] : window.KANDIDATEN || [];
  setupSearch(form, items);
});

// Startseite: Anzahl auf den Kacheln; alte Direktlinks auf die Unterseiten umleiten
document.querySelectorAll(".portal-count").forEach((n) => {
  const list = n.dataset.count === "stellen" ? window.STELLEN || [] : window.KANDIDATEN || [];
  n.textContent = n.dataset.count === "stellen" ? `${list.length} offene Stellen` : `${list.length} verfügbare Profile`;
});
if (/^#stelle-/.test(location.hash) && !stellenRoot) location.replace(`stellen.html${location.hash}`);
if (/^#kandidat-/.test(location.hash) && !kandidatenRoot) location.replace(`bewerberprofile.html${location.hash}`);

// Direktlink (#stelle-… / #kandidat-…) hervorheben
const highlightFromHash = () => {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (!target || !target.classList.contains("profile")) return;
  target.hidden = false;
  target.classList.add("visible", "highlight");
  setTimeout(() => target.scrollIntoView({ block: "center" }), 50);
  setTimeout(() => target.classList.remove("highlight"), 3000);
};
window.addEventListener("hashchange", highlightFromHash);
highlightFromHash();

// Schwebende Kontakt-Buttons erst nach dem Hero einblenden
const fab = document.querySelector(".fab");
const heroSection = document.querySelector(".hero");
if (fab && heroSection && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => fab.classList.toggle("show", !entry.isIntersecting)).observe(heroSection);
} else if (fab) {
  fab.classList.add("show");
}

// Einblend-Animationen beim Scrollen, Geschwister nacheinander
const revealItems = document.querySelectorAll(".reveal");
revealItems.forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--d", `${siblings.indexOf(el) * 0.1}s`);
});

if ("IntersectionObserver" in window && !reducedMotion) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("visible"));
}

// Laufband: Liste so oft kopieren, dass es nahtlos durchläuft
document.querySelectorAll(".marquee").forEach((marquee) => {
  const list = marquee.querySelector(".tags");
  const copies = Math.max(1, Math.ceil(window.innerWidth / Math.max(list.offsetWidth, 1)));
  for (let n = 0; n < copies; n++) {
    const clone = list.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    marquee.append(clone);
  }
});

// Header: Scroll-Fortschritt und kompakte Höhe
const header = document.querySelector(".site-header");
const progress = document.querySelector(".progress");
const onScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.setProperty("--p", max > 0 ? window.scrollY / max : 0);
  if (header) header.classList.toggle("scrolled", window.scrollY > 40);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Hero: Netzwerk aus Punkten, die sich verbinden – Menschen und Unternehmen
const canvas = document.querySelector(".hero-net");
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;
  const mouse = { x: -9999, y: -9999 };
  let points = [];
  let width = 0;
  let height = 0;
  let running = false;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (width * height) / 14000));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.8,
    }));
  };

  const LINK = 140;
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }
    for (let a = 0; a < points.length; a++) {
      const p = points[a];
      for (let b = a + 1; b < points.length; b++) {
        const q = points[b];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < LINK * 1.4) {
        ctx.strokeStyle = `rgba(255,255,255,${(1 - dm / (LINK * 1.4)) * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (running) requestAnimationFrame(draw);
  };

  const start = () => {
    if (running || reducedMotion) return;
    running = true;
    requestAnimationFrame(draw);
  };

  resize();
  if (reducedMotion) draw();
  window.addEventListener("resize", () => {
    resize();
    if (!running) draw();
  });
  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener("pointerleave", () => {
    mouse.x = mouse.y = -9999;
  });

  // Nur animieren, solange der Hero sichtbar ist
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else running = false;
    }).observe(hero);
  } else {
    start();
  }
}

// Kontaktformular: Die Seite ist statisch, deshalb wird die Nachricht
// als vorausgefüllte E-Mail im Mailprogramm des Besuchers geöffnet.
const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");
const RECIPIENT = "wskarrierepartner@icloud.com";

if (form && note) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    note.classList.remove("error");

    const { name, email, nachricht, consent } = form.elements;
    const fields = [name, email, nachricht];
    fields.forEach((f) => f.classList.toggle("invalid", !f.checkValidity()));
    const firstInvalid = fields.find((f) => !f.checkValidity());

    if (firstInvalid) {
      note.textContent = "Bitte füllen Sie Name, eine gültige E-Mail und Ihre Nachricht aus.";
      note.classList.add("error");
      firstInvalid.focus();
      return;
    }
    if (!consent.checked) {
      note.textContent = "Bitte stimmen Sie der Datenschutzerklärung zu.";
      note.classList.add("error");
      return;
    }

    const data = new FormData(form);
    const subject = `Anfrage über die Website (${data.get("rolle")})`;
    const body = [
      `Name: ${data.get("name")}`,
      `E-Mail: ${data.get("email")}`,
      data.get("telefon") ? `Telefon: ${data.get("telefon")}` : null,
      `Ich bin: ${data.get("rolle")}`,
      "",
      data.get("nachricht"),
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Ihr E-Mail-Programm wird geöffnet – bitte senden Sie die Nachricht dort ab.";
  });
}
