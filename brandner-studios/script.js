document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

// Header, Fortschrittsbalken und "Nach oben"-Knopf beim Scrollen
const header = document.querySelector(".site-header");
const progress = document.querySelector(".progress");
const toTop = document.querySelector(".to-top");

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (header) header.classList.toggle("scrolled", y > 20);
  if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (toTop) toTop.classList.toggle("show", y > 600);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Aktiven Menüpunkt markieren
const navLinks = [...document.querySelectorAll(".nav-links a")];
if (navLinks.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navLinks.forEach((a) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) spy.observe(target);
  });
}

// Elemente beim Scrollen einblenden (mit leichter Staffelung)
const reveals = document.querySelectorAll(".reveal, .step");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty("--d", `${Math.min(index, 5) * 0.08}s`);
    io.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// Performance-Ring im Hero hochzählen
const lighthouse = document.querySelector(".lighthouse");
if (lighthouse) {
  const counter = lighthouse.querySelector("[data-count]");
  setTimeout(() => {
    lighthouse.classList.add("on");
    const target = Number(counter.dataset.count);
    if (reduceMotion) {
      counter.textContent = target;
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1600, 1);
      counter.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, 700);
}

// Raster ein- und ausblenden
const gridToggle = document.querySelector(".grid-toggle");
if (gridToggle) {
  gridToggle.addEventListener("click", () => {
    const on = document.body.classList.toggle("show-grid");
    gridToggle.setAttribute("aria-pressed", String(on));
    gridToggle.textContent = on ? "Raster ausblenden" : "Raster einblenden";
  });
}

// Lichtkegel auf den Karten folgt der Maus
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// Browserfenster im Hero kippt leicht mit der Maus
const tilt = document.querySelector("[data-tilt]");
if (tilt && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.setProperty("--ry", `${x * 14 - 4}deg`);
    tilt.style.setProperty("--rx", `${-y * 10 + 3}deg`);
  });
  hero.addEventListener("pointerleave", () => {
    tilt.style.removeProperty("--ry");
    tilt.style.removeProperty("--rx");
  });
}

// Sternbild-Hintergrund im Hero
const canvas = document.querySelector(".constellation");
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;
  let w, h, points, raf;
  const mouse = { x: -999, y: -999 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(70, (w * h) / 16000));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(142,162,255,${0.18 * (1 - d / 130)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 180) {
        ctx.strokeStyle = `rgba(255,216,77,${0.35 * (1 - dm / 180)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(142,162,255,0.55)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => {
    mouse.x = mouse.y = -999;
  });

  // Nur animieren, solange der Hero sichtbar ist
  new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf);
    if (entry.isIntersecting) raf = requestAnimationFrame(draw);
  }).observe(hero);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  resize();
}

// Kopieren-Knöpfe
document.querySelectorAll(".copy").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = text;
      tmp.setAttribute("readonly", "");
      tmp.style.position = "absolute";
      tmp.style.left = "-9999px";
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    btn.classList.add("done");
    btn.textContent = "Kopiert ✓";
    showToast(`${text} kopiert`);
    setTimeout(() => {
      btn.classList.remove("done");
      btn.textContent = "Kopieren";
    }, 2000);
  });
});

// Klick auf ein Beispiel wählt die passende Anfrage im Formular vor
const form = document.getElementById("contact-form");
document.querySelectorAll(".example[data-need]").forEach((card) => {
  card.addEventListener("click", () => {
    if (form) form.elements.need.value = card.dataset.need;
  });
});

// Kontaktformular: öffnet das E-Mail-Programm mit fertiger Nachricht
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { name, email, need, message } = form.elements;
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
      "",
      message.value.trim() || "(keine Nachricht)",
    ].join("\n");
    window.location.href = `mailto:edgarbrandner937@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast("Dein E-Mail-Programm öffnet sich …");
  });

  form.querySelectorAll("input").forEach((field) =>
    field.addEventListener("input", () => field.classList.remove("invalid"))
  );
}
