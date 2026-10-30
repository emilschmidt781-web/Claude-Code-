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

// ===== Erster Bildschirm: alles fährt herein, sobald die Schrift geladen ist =====
const start = () => requestAnimationFrame(() => document.documentElement.classList.add("ready"));
if (document.fonts && document.fonts.ready) {
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]).then(start);
} else {
  start();
}

// Laptop und Handy zeigen nacheinander die fünf Beispiele – live, mit ihren eigenen Animationen
// (zuerst steht das schnelle Bild, die lebendige Seite legt sich nach dem Laden darüber)
const laptop = document.querySelector(".laptop-screen");
const phoneScreen = document.querySelector(".phone-screen");
if (laptop && phoneScreen && !reduceMotion) {
  const pages = ["kubus", "kaffee", "wein", "yoga", "tattoo"];
  const laptopImgs = [...laptop.querySelectorAll("img")];
  const phoneImgs = [...phoneScreen.querySelectorAll("img")];
  const screens = [
    { box: laptop, imgs: laptopImgs, w: 1280, h: 800 },
    { box: phoneScreen, imgs: phoneImgs, w: 390, h: 822 },
  ];
  let i = 0;

  const fit = () => screens.forEach((s) => s.frame && s.frame.style.setProperty("--s", s.box.clientWidth / s.w));
  addEventListener("resize", fit, { passive: true });

  // Das Bild des nächsten Beispiels wischt herein, dann startet darüber die Live-Seite
  const show = (n, first) =>
    screens.forEach((s) => {
      s.imgs.forEach((img, k) => {
        img.classList.toggle("prev", img.classList.contains("on") && k !== n);
        img.classList.toggle("on", k === n);
        img.classList.toggle("wipe", k === n && !first);
      });
      if (!s.frame) {
        s.frame = document.createElement("iframe");
        s.frame.className = "live";
        s.frame.width = s.w;
        s.frame.height = s.h;
        s.frame.tabIndex = -1;
        s.frame.title = "Vorschau";
        s.frame.setAttribute("aria-hidden", "true");
        s.box.appendChild(s.frame);
        fit();
      }
      const frame = s.frame;
      frame.classList.remove("ready");
      frame.onload = () => setTimeout(() => frame.classList.add("ready"), first ? 0 : 900);
      frame.src = `konzepte/${pages[n]}.html?embed`;
    });

  addEventListener(
    "load",
    () => {
      document.querySelectorAll(".devices img[data-src]").forEach((img) => {
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.src = img.dataset.src;
      });
      // Erst wenn die Seite in Ruhe steht, die Live-Vorschau starten
      setTimeout(() => {
        show(0, true);
        setInterval(() => {
          if (document.hidden) return;
          i = (i + 1) % pages.length;
          show(i);
        }, 7000);
      }, 2500);
    },
    { once: true }
  );
}

// Ring „100 Punkte“ füllt sich
const ring = document.querySelector(".ring");
if (ring) {
  const target = Number(getComputedStyle(ring).getPropertyValue("--v")) || 100;
  if (reduceMotion) ring.style.setProperty("--p", target);
  else {
    const t0 = performance.now() + 900;
    const tick = (now) => {
      const t = Math.max(0, Math.min((now - t0) / 1400, 1));
      ring.style.setProperty("--p", (target * (1 - Math.pow(1 - t, 3))).toFixed(1));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

// Geräte bewegen sich beim Scrollen leicht nach oben
const devices = document.querySelector(".devices");
if (devices && !reduceMotion) {
  let ticking = false;
  addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = Math.min(scrollY, innerHeight);
        devices.style.setProperty("--par", `${(-y * 0.12).toFixed(1)}px`);
      });
    },
    { passive: true }
  );
}

// ===== Abschnitte fahren gestaffelt herein =====
const groups = [
  ".perks li",
  ".split, .about-photo, .note-card",
  ".page-head > *",
  ".concept-pic, .concept-text",
  ".concepts-cta",
  ".services .h2, .service",
  ".how-head > *, .step",
  ".faq-head > *, .q",
  ".contact-copy > *, .form-card, .checks",
];
groups.forEach((sel) => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add("rise");
    el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
  });
});
onVisible([...document.querySelectorAll(".rise")], (el) => el.classList.add("in"));

// Ablauf: die Zeichnungen zeichnen sich nacheinander
document.querySelectorAll(".step").forEach((el, i) => el.style.setProperty("--sd", `${i * 0.35}s`));
onVisible([...document.querySelectorAll(".step")], (el) => el.classList.add("in"), { threshold: 0.35 });

// Schritt 4: wenn die Weltkugel fertig gezeichnet ist, gibt es Konfetti
const lastStep = document.querySelector(".step:last-child");
if (lastStep) {
  const confetti = lastStep.querySelector(".confetti");
  const colors = ["#ff4f8b", "#ffd400", "#22c55e", "#3b82f6", "#ffffff", "#ff9f1c"];
  const party = () => {
    // Konfetti startet am Häkchen der Zeichnung
    const svg = lastStep.querySelector(".draw").getBoundingClientRect();
    const box = lastStep.getBoundingClientRect();
    confetti.style.setProperty("--cx", `${svg.left - box.left + (158 / 240) * svg.width}px`);
    confetti.style.setProperty("--cy", `${svg.top - box.top + (34 / 140) * svg.height}px`);
    if (reduceMotion) return;
    confetti.innerHTML = "";
    for (let k = 0; k < 36; k++) {
      const piece = document.createElement("i");
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 110;
      piece.style.setProperty("--c", colors[k % colors.length]);
      piece.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
      piece.style.setProperty("--y", `${Math.sin(angle) * dist * 0.8 + 70}px`);
      piece.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
      piece.style.setProperty("--w", `${Math.random() * 0.15}s`);
      confetti.appendChild(piece);
    }
  };
  // Zeitpunkt: Verzögerung von Schritt 4 plus Dauer der Zeichnung
  onVisible([lastStep], () => setTimeout(party, reduceMotion ? 0 : 2900), { threshold: 0.35 });
  lastStep.addEventListener("click", party);
}

// ===== Menü auf Handy und Tablet =====
const bar = document.querySelector(".bar");
const menuBtn = document.querySelector(".menu-toggle");
if (bar && menuBtn) {
  const setMenu = (open) => {
    bar.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  };
  menuBtn.addEventListener("click", () => setMenu(!bar.classList.contains("open")));
  bar.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  document.addEventListener("click", (e) => !bar.contains(e.target) && setMenu(false));
}

// ===== Porträt: auf dem Handy (ohne Maus) per Antippen, einmal auch von selbst =====
const portrait = document.querySelector(".about-photo");
if (portrait && matchMedia("(hover: none)").matches) {
  portrait.addEventListener("click", () => portrait.classList.toggle("hi"));
  onVisible([portrait], (el) => {
    setTimeout(() => el.classList.add("hi"), 600);
    setTimeout(() => el.classList.remove("hi"), 3200);
  }, { threshold: 0.6 });
}

// ===== Nach oben =====
document.querySelectorAll('a[href="#top"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  })
);

// ===== Kontakt: das Formular bereitet die E-Mail fertig vor =====
const composer = document.getElementById("composer");
if (composer) {
  const { name, tel, site, msg } = composer.elements;
  const note = composer.querySelector(".form-note");
  const need = () => composer.querySelector('input[name="need"]:checked').value;
  const isCheck = () => need() === "Kostenloser Website-Check";

  // „Anfragen“ bei den Leistungen wählt das passende Thema vor
  document.querySelectorAll("[data-need]").forEach((link) =>
    link.addEventListener("click", () => {
      const radio = composer.querySelector(`input[name="need"][value="${link.dataset.need}"]`);
      if (radio) radio.checked = true;
    })
  );

  const buildMail = () => {
    const lines = ["Hallo Edgar,", ""];
    if (isCheck()) lines.push("ich hätte gerne den kostenlosen Website-Check für meine Seite.");
    else lines.push(`ich interessiere mich für: ${need()}.`);
    if (site.value.trim()) lines.push(`Meine Website: ${site.value.trim().replace(/\/$/, "")}`);
    if (msg.value.trim()) lines.push("", msg.value.trim());
    lines.push("");
    if (tel.value.trim()) lines.push(`Du erreichst mich unter: ${tel.value.trim()}`);
    lines.push("Viele Grüße", name.value.trim());
    const subject = `Anfrage: ${need()}${name.value.trim() ? ` – ${name.value.trim()}` : ""}`;
    return `mailto:brandnerstudios@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const problems = () => {
    const out = [];
    if (name.value.trim().length < 2) out.push([name, "Bitte gib deinen Vornamen an."]);
    const v = site.value.trim();
    if (!v && isCheck()) out.push([site, "Für den Website-Check brauche ich deine Website-Adresse."]);
    else if (v && !/^(https?:\/\/)?[^\s/]+\.[a-z]{2,}(\/\S*)?$/i.test(v)) out.push([site, "Bitte eine Adresse wie meinbetrieb.de eingeben."]);
    if (tel.value.trim() && !/^[+()\d\s/-]{6,}$/.test(tel.value.trim())) out.push([tel, "Bitte eine gültige Telefonnummer eingeben."]);
    return out;
  };

  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    [name, site, tel].forEach((f) => {
      f.classList.remove("invalid");
      f.removeAttribute("aria-invalid");
    });
    const found = problems();
    if (found.length) {
      found.forEach(([f]) => {
        f.classList.add("invalid");
        f.setAttribute("aria-invalid", "true");
      });
      showToast(found[0][1]);
      found[0][0].focus();
      return;
    }
    location.href = buildMail();
    note.textContent = "Dein E-Mail-Programm öffnet sich …";
  });
  [name, site, tel].forEach((f) =>
    f.addEventListener("input", () => {
      f.classList.remove("invalid");
      f.removeAttribute("aria-invalid");
    })
  );
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
