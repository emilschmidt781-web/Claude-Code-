document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const io = "IntersectionObserver" in window;

// Beobachtet Elemente und ruft fn einmal auf, sobald sie sichtbar werden
function onVisible(els, fn, options = { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }) {
  if (!io) return els.forEach(fn);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      fn(entry.target);
      obs.unobserve(entry.target);
    });
  }, options);
  els.forEach((el) => obs.observe(el));
}

// Zusatzschriften (Beispiel-Namen, Bildunterschrift) erst laden, wenn man in die Nähe scrollt
(() => {
  const load = () => {
    if (document.getElementById("extra-fonts")) return;
    const link = document.createElement("link");
    link.id = "extra-fonts";
    link.rel = "stylesheet";
    link.href = "fonts/extra.css";
    document.head.appendChild(link);
  };
  const targets = [document.getElementById("konzepte"), document.getElementById("ueber-mich")].filter(Boolean);
  if (!io || !targets.length) return load();
  const obs = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        load();
        obs.disconnect();
      }
    },
    { rootMargin: "800px 0px" }
  );
  targets.forEach((t) => obs.observe(t));
})();

// Jahreszahl im Footer
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Kurzer Hinweis unten am Bildschirm
const toast = document.querySelector(".toast");
let toastTimer;
function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ===== Überschriften in Wörter zerlegen (fahren einzeln hoch) =====
function splitWords(el) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.textContent = part;
          inner.style.setProperty("--i", i++);
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
        walk(child);
      }
    });
  };
  walk(el);
}
document.querySelectorAll(".head .h2, .footer-cta .h2").forEach(splitWords);
document.querySelectorAll(".hero-title .w > span").forEach((el, i) => el.style.setProperty("--i", i));

// Hero startet nach dem Laden
requestAnimationFrame(() => document.body.classList.add("ready"));

// ===== Einblenden beim Scrollen (mit Staffelung) =====
const reveals = [...document.querySelectorAll(".reveal")];
reveals.forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  const index = siblings.indexOf(el);
  if (index > 0) el.style.setProperty("--d", `${Math.min(index, 5) * 0.08}s`);
});
onVisible(reveals, (el) => el.classList.add("in"));
document.querySelectorAll(".chips li").forEach((li, i) => li.style.setProperty("--i", i));
document.querySelectorAll(".compare .cmp-row").forEach((row, i) => row.style.setProperty("--row", i));
document.querySelectorAll(".menu-links a").forEach((a, i) => a.style.setProperty("--i", i));

// ===== Header: Fortschrittsbalken, Nach-oben-Knopf, Handy-Leiste =====
const progress = document.querySelector(".progress");
const toTop = document.querySelector(".to-top");
const mobileCta = document.querySelector(".mobile-cta");
const hero = document.querySelector(".hero");
const contact = document.getElementById("kontakt");

function onScroll() {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (toTop) toTop.classList.toggle("show", y > 700);
  if (mobileCta && hero && contact) {
    const pastHero = hero.getBoundingClientRect().bottom < 80;
    const c = contact.getBoundingClientRect();
    mobileCta.classList.toggle("show", pastHero && !(c.top < innerHeight * 0.85 && c.bottom > 0));
  }
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ===== Nach oben (Pfeil und Logo) =====
// Die Kopfleiste läuft immer mit, daher ausdrücklich an den Seitenanfang scrollen
document.querySelectorAll('a[href="#top"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  })
);

// ===== Menü =====
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");
if (menuToggle && menu) {
  let closeTimer;
  const isOpen = () => menuToggle.getAttribute("aria-expanded") === "true";
  const setMenu = (open) => {
    clearTimeout(closeTimer);
    if (open) menu.hidden = false;
    requestAnimationFrame(() => document.documentElement.classList.toggle("menu-open", open));
    document.documentElement.style.overflow = open ? "hidden" : "";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    if (!open) closeTimer = setTimeout(() => (menu.hidden = true), 450);
  };
  menuToggle.addEventListener("click", () => setMenu(!isOpen()));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      setMenu(false);
      menuToggle.focus();
    }
  });
}

// ===== Hero: wechselndes Wort =====
const rot = document.querySelector(".rot");
if (rot) {
  const words = [...rot.querySelectorAll("em")];
  let current = 0;
  const fit = () => (rot.style.width = `${words[current].offsetWidth}px`);
  if (document.fonts) {
    document.fonts.ready.then(fit);
    // Breite neu messen, sobald die Hero-Schrift wirklich geladen ist
    document.fonts.addEventListener("loadingdone", fit);
    document.fonts.load('800 1em "Archivo Wide"').then(fit, fit);
  }
  fit();
  addEventListener("resize", fit);
  if (!reduceMotion) {
    setInterval(() => {
      const leaving = words[current];
      leaving.classList.remove("on");
      leaving.classList.add("out");
      setTimeout(() => leaving.classList.remove("out"), 800);
      current = (current + 1) % words.length;
      words[current].classList.add("on");
      fit();
    }, 2800);
  }
}

// Hero: Lichtkegel folgt der Maus
if (hero && finePointer && !reduceMotion) {
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--hx", `${e.clientX - r.left}px`);
    hero.style.setProperty("--hy", `${e.clientY - r.top}px`);
  });
}

// ===== Lichtkegel auf Karten =====
if (finePointer) {
  document.querySelectorAll(".feature, .tools li").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

// ===== Zahlen zählen hoch =====
onVisible([...document.querySelectorAll("[data-count]")], (el) => {
  const target = Number(el.dataset.count);
  if (reduceMotion || target === 0) return (el.textContent = target);
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / 1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

// ===== SEO-Karte: dein Betrieb klettert nach oben =====
document.querySelectorAll(".serp").forEach((list) => {
  const items = [...list.children];
  const me = list.querySelector(".me");
  // Rang von [dein Betrieb, A, B] – von Platz 3 bis Platz 1, dann kurz halten
  const order = [
    [2, 0, 1],
    [1, 0, 2],
    [0, 1, 2],
    [0, 1, 2],
  ];
  let step = 0;
  const place = () => {
    const ranks = order[step];
    [me, ...items.filter((li) => li !== me)].forEach((li, k) => (li.style.top = `${ranks[k] * 58}px`));
  };
  place();
  if (!reduceMotion) {
    setInterval(() => {
      step = (step + 1) % order.length;
      place();
    }, 1800);
  }
});

// ===== Terminal: Zeilen tippen sich, sobald sie sichtbar sind =====
function typeTerminal(term) {
  const lines = [...term.querySelectorAll(".tl")];
  if (reduceMotion) return lines.forEach((l) => (l.textContent = l.dataset.type));
  let li = 0;
  const next = () => {
    if (li >= lines.length) return;
    const line = lines[li++];
    const text = line.dataset.type;
    const isCmd = line.classList.contains("cmd");
    let ci = 0;
    line.classList.add("typing");
    const step = () => {
      line.textContent = text.slice(0, ++ci);
      if (ci < text.length) setTimeout(step, isCmd ? 45 : 14);
      else {
        if (li < lines.length) line.classList.remove("typing");
        setTimeout(next, isCmd ? 350 : 180);
      }
    };
    step();
  };
  next();
}
onVisible([...document.querySelectorAll(".term-body")], typeTerminal, { threshold: 0.6 });

// ===== Kopieren =====
document.querySelectorAll(".copy").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = text;
      tmp.style.position = "absolute";
      tmp.style.left = "-9999px";
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    showToast(`${text} kopiert`);
    if (btn.classList.contains("mini")) {
      btn.classList.add("done");
      btn.textContent = "Kopiert ✓";
      setTimeout(() => {
        btn.classList.remove("done");
        btn.textContent = "Kopieren";
      }, 2000);
    }
  });
});

// ===== Beispiele: Liste steuert die große Vorschau =====
const showcase = document.querySelector(".showcase");
if (showcase) {
  const items = [...showcase.querySelectorAll(".sc-item")];
  const imgs = [...showcase.querySelectorAll(".sc-imgs img")];
  const preview = showcase.querySelector(".sc-preview");
  const url = showcase.querySelector(".sc-url");
  let active = 0;
  let timer;
  let touched = false;
  const show = (i) => {
    active = i;
    items.forEach((b, k) => {
      b.classList.toggle("on", k === i);
      b.setAttribute("aria-pressed", String(k === i));
    });
    imgs.forEach((img, k) => img.classList.toggle("on", k === i));
    preview.href = items[i].dataset.href;
    url.textContent = items[i].dataset.href.split("/").pop();
    preview.setAttribute("aria-label", `Demo ansehen: ${items[i].querySelector(".sc-name").textContent}`);
  };
  const stopAuto = () => {
    touched = true;
    clearInterval(timer);
  };
  items.forEach((b, i) => {
    b.addEventListener("click", () => {
      stopAuto();
      show(i);
      if (preview.getBoundingClientRect().top < 80) preview.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
    if (finePointer)
      b.addEventListener("pointerenter", () => {
        stopAuto();
        show(i);
      });
  });
  if (!reduceMotion && io) {
    new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting && !touched) timer = setInterval(() => show((active + 1) % items.length), 3800);
    }).observe(showcase);
  }
  show(0);
}

// ===== FAQ: weich auf- und zuklappen =====
document.querySelectorAll(".faq-item").forEach((item) => {
  const summary = item.querySelector("summary");
  const answer = item.querySelector(".faq-a");
  summary.addEventListener("click", (e) => {
    if (reduceMotion || !answer.animate) return;
    e.preventDefault();
    const opts = { duration: 400, easing: "cubic-bezier(.22,1,.36,1)" };
    if (item.open) {
      answer.animate([{ height: `${answer.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }], opts).onfinish = () => (item.open = false);
    } else {
      item.open = true;
      answer.animate([{ height: "0px", opacity: 0 }, { height: `${answer.offsetHeight}px`, opacity: 1 }], opts);
    }
  });
});

// ===== Magnetische Knöpfe =====
if (finePointer && !reduceMotion) {
  document.querySelectorAll(".btn-primary, .btn-white, .to-top").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });
}

// ===== Angebot anklicken wählt die passende Anfrage vor =====
const form = document.getElementById("contact-form");
document.querySelectorAll("[data-need]").forEach((el) => {
  el.addEventListener("click", () => {
    if (form) form.elements.need.value = el.dataset.need;
  });
});

// ===== Kontaktformular: öffnet das E-Mail-Programm =====
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { name, email, need, website, message } = form.elements;
    let ok = true;
    [name, email].forEach((field) => {
      const valid = field.value.trim() !== "" && field.checkValidity();
      field.classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      showToast("Bitte Name und eine gültige E-Mail angeben.");
      (name.classList.contains("invalid") ? name : email).focus();
      return;
    }
    const subject = `Anfrage: ${need.value} – ${name.value.trim()}`;
    const body = [
      `Name: ${name.value.trim()}`,
      `E-Mail: ${email.value.trim()}`,
      `Anliegen: ${need.value}`,
      `Aktuelle Website: ${website.value.trim() || "–"}`,
      "",
      message.value.trim() || "(keine Nachricht)",
    ].join("\n");
    location.href = `mailto:brandnerstudios@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast("Dein E-Mail-Programm öffnet sich …");
  });
  form.querySelectorAll("input").forEach((f) => f.addEventListener("input", () => f.classList.remove("invalid")));
}

// ===== Website-Check: Adresse ins Kontaktformular übernehmen =====
const checkForm = document.getElementById("check-form");
if (checkForm && form) {
  const input = checkForm.elements.url;
  const log = checkForm.querySelector(".check-log");
  const box = checkForm.querySelector(".check-input");
  input.addEventListener("input", () => {
    box.classList.remove("invalid");
    // „https://“ steht schon davor – mitkopiertes Präfix entfernen
    if (/^https?:\/\//i.test(input.value)) input.value = input.value.replace(/^https?:\/\//i, "");
  });
  checkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = input.value.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
    if (!/^[^\s/]+\.[a-z]{2,}(\/\S*)?$/i.test(url)) {
      box.classList.add("invalid");
      showToast("Bitte eine Adresse wie dein-betrieb.de eingeben.");
      input.focus();
      return;
    }
    const lines = [
      ["cmd", `$ brandner check ${url}`],
      ["out", "▸ adresse ......... ✓ übernommen"],
      ["ok", "✓ noch Name und E-Mail eintragen"],
    ];
    log.innerHTML = "";
    lines.forEach(([cls, text], i) => {
      const span = document.createElement("span");
      span.className = `tl ${cls === "ok" ? "out ok" : cls}`;
      span.textContent = text;
      span.style.opacity = "0";
      log.appendChild(span);
      setTimeout(() => (span.style.opacity = "1"), reduceMotion ? 0 : 250 * i);
    });
    form.elements.need.value = "Kostenloser Website-Check";
    form.elements.website.value = url;
    if (!form.elements.message.value.trim()) {
      form.elements.message.value = "Hallo Edgar, ich hätte gerne den kostenlosen Website-Check für meine Seite.";
    }
    setTimeout(() => {
      document.getElementById("kontakt").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(() => form.elements.name.focus({ preventScroll: true }), reduceMotion ? 0 : 700);
    }, reduceMotion ? 0 : 900);
  });
}
