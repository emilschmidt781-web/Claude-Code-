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
const RECIPIENT = "kontakt@ricky-wagner.de";

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
