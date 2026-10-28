document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

// Jahreszahl in der Fußzeile
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
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// ===== Erster Bildschirm: der Name steigt hervor, sobald die Schrift da ist =====
const start = () => requestAnimationFrame(() => document.documentElement.classList.add("ready"));
if (document.fonts && document.fonts.ready) {
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]).then(start);
} else {
  start();
}

// ===== Abschnitte: Überschrift, dann Text, dann Bild – jeweils leicht versetzt =====
const groups = [
  ".work h2, .piece, .remark",
  ".services h2, .group, .desc",
  ".numbers h2, .figures dl > div, .phone-shot",
  ".about-grid .portrait, .about-text > *",
  ".faq h2, .q",
  ".contact-top > *, .composer, .mail, .contact-foot",
];
groups.forEach((sel) => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add("rise");
    el.style.setProperty("--d", `${Math.min(i, 6) * 0.075}s`);
  });
});
onVisible([...document.querySelectorAll(".rise")], (el) => el.classList.add("in"));

// Ablauf: jede Stufe zeichnet ihre Linien, sobald sie im Bild ist
onVisible([...document.querySelectorAll(".stage")], (el) => el.classList.add("in"), { threshold: 0.4 });

// ===== Nach oben =====
document.querySelectorAll('a[href="#top"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  })
);

// ===== Leistungen: ein Punkt zeigt seine Beschreibung =====
const desc = document.querySelector(".services .desc");
const serviceButtons = [...document.querySelectorAll(".group button")];
if (desc) {
  const fallback = desc.textContent;
  const show = (btn) => {
    serviceButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    desc.textContent = btn ? `${btn.textContent}: ${btn.dataset.desc}` : fallback;
  };
  serviceButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("mouseenter", () => show(btn));
    btn.addEventListener("focus", () => show(btn));
    btn.addEventListener("click", () => show(btn));
  });
  document.querySelector(".index")?.addEventListener("mouseleave", () => show(null));
}

// ===== Kontakt: Auswahl und Website landen fertig in der E-Mail =====
const composer = document.getElementById("composer");
const mailLink = document.getElementById("mail-link");
if (composer && mailLink) {
  const site = composer.elements.site;
  const msg = composer.elements.msg;
  const note = composer.querySelector(".form-note");
  const need = () => composer.querySelector('input[name="need"]:checked').value;
  const isCheck = () => need() === "Kostenloser Website-Check";
  const cleanUrl = (v) => v.trim().replace(/\/$/, "");

  const buildMail = () => {
    const lines = ["Hallo Edgar,", ""];
    if (isCheck()) lines.push("ich hätte gerne den kostenlosen Website-Check für meine Seite.");
    else lines.push(`es geht um: ${need()}.`);
    if (site.value.trim()) lines.push(`Meine Website: ${cleanUrl(site.value)}`);
    if (msg.value.trim()) lines.push("", msg.value.trim());
    lines.push("", "Viele Grüße");
    return `mailto:brandnerstudios@gmail.com?subject=${encodeURIComponent(`Anfrage: ${need()}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const update = () => {
    mailLink.href = buildMail();
    site.placeholder = isCheck() ? "Deine Website-Adresse, z. B. meinbetrieb.de" : "z. B. meinbetrieb.de";
  };
  composer.addEventListener("input", update);
  composer.addEventListener("change", update);
  update();

  // Prüfung: Beim Website-Check braucht es eine Adresse, sonst nur ein gültiges Format
  const valid = () => {
    const v = site.value.trim();
    if (!v) return isCheck() ? "Für den Website-Check brauche ich deine Website-Adresse." : "";
    return /^(https?:\/\/)?[^\s/]+\.[a-z]{2,}(\/\S*)?$/i.test(v) ? "" : "Bitte eine Adresse wie meinbetrieb.de eingeben.";
  };
  const send = (e) => {
    const problem = valid();
    site.classList.toggle("invalid", !!problem);
    site.setAttribute("aria-invalid", String(!!problem));
    if (problem) {
      e.preventDefault();
      showToast(problem);
      site.focus();
      return;
    }
    if (e.type === "submit") {
      e.preventDefault();
      location.href = buildMail();
    }
    note.textContent = "Dein E-Mail-Programm öffnet sich …";
  };
  composer.addEventListener("submit", send);
  mailLink.addEventListener("click", send);
  site.addEventListener("input", () => {
    site.classList.remove("invalid");
    site.removeAttribute("aria-invalid");
  });
}

// ===== Fragen: weich auf- und zuklappen =====
document.querySelectorAll(".q").forEach((item) => {
  const summary = item.querySelector("summary");
  const answer = item.querySelector("p");
  summary.addEventListener("click", (e) => {
    if (reduceMotion || !answer.animate) return;
    e.preventDefault();
    const opts = { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" };
    if (item.open) {
      answer.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-8px)" }], opts).onfinish = () => (item.open = false);
    } else {
      item.open = true;
      answer.animate([{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }], opts);
    }
  });
});

// ===== Arbeiten: Bilder bewegen sich beim Scrollen ganz leicht =====
const pieces = [...document.querySelectorAll(".piece-img img")];
if (pieces.length && !reduceMotion) {
  let ticking = false;
  const drift = () => {
    ticking = false;
    const vh = innerHeight;
    pieces.forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
      img.style.transform = `scale(1.06) translateY(${(p * -2.5).toFixed(2)}%)`;
    });
  };
  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(drift);
      }
    },
    { passive: true }
  );
  drift();
}
