document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Überschriften in Wörter zerlegen, damit sie einzeln aus einer Maske fahren
function splitWords(el) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
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
document.querySelectorAll(".section-head h2, .about-copy h2, .contact h2, .statement-text p").forEach(splitWords);
document.querySelectorAll(".hero-title .w > span").forEach((el, i) => el.style.setProperty("--i", i));
document.querySelectorAll(".chips li").forEach((el, i) => el.style.setProperty("--i", i));

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
          ctx.strokeStyle = `rgba(243,242,237,${0.12 * (1 - d / 130)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 180) {
        ctx.strokeStyle = `rgba(200,255,61,${0.4 * (1 - dm / 180)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(243,242,237,0.45)";
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
    window.location.href = `mailto:edgarbrandner937@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast("Dein E-Mail-Programm öffnet sich …");
  });

  form.querySelectorAll("input").forEach((field) =>
    field.addEventListener("input", () => field.classList.remove("invalid"))
  );
}

// ===== Animationen =====

// Intro beim ersten Besuch pro Sitzung, danach Hero-Überschrift einfahren
function startPage() {
  requestAnimationFrame(() => document.body.classList.add("ready"));
}

let seenIntro = false;
try {
  seenIntro = sessionStorage.getItem("eb-intro") === "1";
  sessionStorage.setItem("eb-intro", "1");
} catch {}

if (!reduceMotion && !seenIntro) {
  const intro = document.createElement("div");
  intro.className = "intro";
  intro.setAttribute("aria-hidden", "true");
  intro.innerHTML =
    '<div class="intro-inner"><svg class="intro-mark" viewBox="0 0 100 100" aria-hidden="true">' +
    '<rect class="stem" x="6" y="4" width="22" height="92" rx="6" fill="#fff"/>' +
    '<path class="bowl" d="M32 4h30a22 22 0 0 1 0 44H32z" fill="#fff"/>' +
    '<path class="bowl b2" d="M32 52h36a22 22 0 0 1 0 44H32z" fill="#fff"/>' +
    '<circle class="dot" cx="92" cy="11" r="7" fill="#d8ff3e"/></svg><div class="intro-bar"><i></i></div></div>';
  document.body.appendChild(intro);
  document.documentElement.style.overflow = "hidden";
  setTimeout(() => {
    intro.classList.add("out");
    document.documentElement.style.overflow = "";
    setTimeout(startPage, 250);
    setTimeout(() => intro.remove(), 1000);
  }, 850);
} else {
  startPage();
}

// Wechselndes Wort in der Hero-Überschrift
const rotator = document.querySelector(".rotator");
if (rotator) {
  const words = [...rotator.querySelectorAll("em")];
  let current = 0;
  const fit = () => (rotator.style.width = `${words[current].offsetWidth}px`);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  fit();
  window.addEventListener("resize", fit);
  if (!reduceMotion) {
    setInterval(() => {
      const leaving = words[current];
      leaving.classList.remove("is-active");
      leaving.classList.add("is-leaving");
      setTimeout(() => leaving.classList.remove("is-leaving"), 800);
      current = (current + 1) % words.length;
      words[current].classList.add("is-active");
      fit();
    }, 2800);
  }
}

// Überschriften der Abschnitte: kurzer "Entschlüsseln"-Effekt
const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/#*+=";
function scramble(el) {
  const final = el.dataset.text || el.textContent;
  el.dataset.text = final;
  let frame = 0;
  const total = 22;
  const tick = () => {
    const progress = frame / total;
    el.textContent = [...final]
      .map((ch, i) => (ch === " " || i / final.length < progress ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]))
      .join("");
    if (frame++ < total) requestAnimationFrame(tick);
    else el.textContent = final;
  };
  tick();
}
if (!reduceMotion && "IntersectionObserver" in window) {
  const eyebrowObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        scramble(entry.target);
        eyebrowObserver.unobserve(entry.target);
      });
    },
    { threshold: 1 }
  );
  document.querySelectorAll(".eyebrow").forEach((el) => eyebrowObserver.observe(el));
}

// Eigener Mauszeiger mit nachziehendem Ring
if (finePointer && !reduceMotion) {
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor";
  ring.className = "cursor-ring";
  ring.innerHTML = "<span>Anfragen</span>";
  document.body.append(dot, ring);
  document.documentElement.classList.add("has-cursor");

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };
  window.addEventListener("pointermove", (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  });
  const follow = () => {
    ringPos.x += (pos.x - ringPos.x) * 0.18;
    ringPos.y += (pos.y - ringPos.y) * 0.18;
    ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`;
    requestAnimationFrame(follow);
  };
  follow();

  document.addEventListener("pointerover", (e) => {
    const example = e.target.closest(".example");
    const ref = e.target.closest(".ref-media, .concept");
    const interactive = e.target.closest("a, button, summary, .card, .chips li");
    ring.querySelector("span").textContent = ref ? "Ansehen" : "Anfragen";
    ring.classList.toggle("label", !!(example || ref));
    ring.classList.toggle("hover", !!interactive && !example && !ref);
    ring.classList.toggle("on-light", !!e.target.closest(".contact"));
  });
  document.addEventListener("pointerleave", () => {
    dot.style.opacity = ring.style.opacity = "0";
  });
  document.addEventListener("pointerenter", () => {
    dot.style.opacity = ring.style.opacity = "";
  });
}

// Magnetische Knöpfe
if (finePointer && !reduceMotion) {
  document.querySelectorAll(".btn, .to-top").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });
}

// Karten kippen in 3D mit Lichtreflex
if (finePointer && !reduceMotion) {
  document.querySelectorAll(".service, .example").forEach((card) => {
    const glare = document.createElement("span");
    glare.className = "glare";
    card.appendChild(glare);
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const lift = card.classList.contains("example") ? -6 : 0;
      card.style.transition = "border-color .3s, transform .15s linear";
      card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(${lift}px)`;
      glare.style.setProperty("--ga", `${Math.atan2(y, x) * (180 / Math.PI) + 90}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.transition = "";
      card.style.transform = "";
    });
  });
}

// Laufband: läuft schneller und neigt sich, wenn gescrollt wird
const marquee = document.querySelector(".marquee");
if (marquee && !reduceMotion) {
  marquee.classList.add("js-driven");
  const rows = [...marquee.querySelectorAll(".marquee-row")].map((row) => ({
    row,
    track: row.querySelector(".marquee-track"),
    dir: row.classList.contains("reverse") ? 1 : -1,
    x: 0,
  }));
  let lastY = scrollY;
  let velocity = 0;
  let paused = false;
  marquee.addEventListener("pointerenter", () => (paused = true));
  marquee.addEventListener("pointerleave", () => (paused = false));
  const run = () => {
    const dy = scrollY - lastY;
    lastY = scrollY;
    velocity += (dy - velocity) * 0.1;
    const speed = paused ? 0.15 : 0.6 + Math.min(Math.abs(velocity) * 0.25, 10);
    rows.forEach((r) => {
      const half = r.track.scrollWidth / 2;
      r.x += speed * r.dir;
      if (r.x <= -half) r.x += half;
      if (r.x > 0) r.x -= half;
      r.track.style.transform = `translate3d(${r.x}px,0,0)`;
      r.row.style.transform = `skewX(${Math.max(-8, Math.min(8, velocity * -0.3))}deg)`;
    });
    requestAnimationFrame(run);
  };
  rows.forEach((r) => {
    if (r.dir === 1) r.x = -r.track.scrollWidth / 2;
  });
  run();
}

// Skyline: Ebenen verschieben sich beim Scrollen (Parallax) + Kontaktfläche wächst
const statement = document.querySelector(".statement");
const layers = [...document.querySelectorAll(".skyline .layer")];
const contact = document.querySelector(".contact");
if (!reduceMotion) {
  let ticking = false;
  const update = () => {
    ticking = false;
    if (statement) {
      const r = statement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const p = (innerHeight - r.top) / (innerHeight + r.height) - 0.5;
        layers.forEach((layer) => {
          layer.style.transform = `translateY(${p * Number(layer.dataset.depth) * 260}px)`;
        });
      }
    }
    if (contact) {
      const r = contact.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight - r.top) / (innerHeight * 0.8), 0), 1);
      contact.style.setProperty("--cx", `${(1 - p) * Math.min(innerWidth * 0.06, 60)}px`);
      contact.style.setProperty("--cr", `${(1 - p) * 48}px`);
    }
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) requestAnimationFrame(update);
      ticking = true;
    },
    { passive: true }
  );
  update();
}

// Feste Kontaktleiste auf dem Handy: erscheint nach dem Hero, verschwindet beim Kontakt
const mobileCta = document.querySelector(".mobile-cta");
const heroSection = document.querySelector(".hero");
if (mobileCta && heroSection && contact) {
  const toggleCta = () => {
    const pastHero = heroSection.getBoundingClientRect().bottom < 80;
    const contactRect = contact.getBoundingClientRect();
    const atContact = contactRect.top < innerHeight * 0.85 && contactRect.bottom > 0;
    mobileCta.classList.toggle("show", pastHero && !atContact);
  };
  window.addEventListener("scroll", toggleCta, { passive: true });
  toggleCta();
}

// FAQ: Antworten klappen weich auf und zu
document.querySelectorAll(".faq-item").forEach((item) => {
  const summary = item.querySelector("summary");
  const answer = item.querySelector(".faq-a");
  summary.addEventListener("click", (e) => {
    if (reduceMotion || !answer.animate) return;
    e.preventDefault();
    if (item.open) {
      const anim = answer.animate([{ height: `${answer.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }], {
        duration: 350,
        easing: "cubic-bezier(.22,1,.36,1)",
      });
      anim.onfinish = () => (item.open = false);
    } else {
      item.open = true;
      answer.animate([{ height: "0px", opacity: 0 }, { height: `${answer.offsetHeight}px`, opacity: 1 }], {
        duration: 450,
        easing: "cubic-bezier(.22,1,.36,1)",
      });
    }
  });
});

// Menü (auf dem Handy)
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");
if (menuToggle && menu) {
  let closeTimer;
  const setMenu = (open) => {
    clearTimeout(closeTimer);
    if (open) menu.hidden = false;
    requestAnimationFrame(() => {
      document.documentElement.classList.toggle("menu-open", open);
    });
    document.documentElement.style.overflow = open ? "hidden" : "";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    if (!open) closeTimer = setTimeout(() => (menu.hidden = true), 700);
  };
  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (innerWidth >= 900 && menuToggle.getAttribute("aria-expanded") === "true") setMenu(false);
  });
}

// Punkte unter den Wisch-Karussells
document.querySelectorAll(".services, .examples, .concepts").forEach((track) => {
  const hint = document.createElement("div");
  hint.className = "swipe-hint";
  hint.setAttribute("aria-hidden", "true");
  const cards = [...track.children];
  cards.forEach(() => hint.appendChild(document.createElement("i")));
  track.after(hint);
  const dots = [...hint.children];
  const mark = () => {
    const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
    const index = Math.min(cards.length - 1, Math.round(track.scrollLeft / step));
    dots.forEach((d, i) => d.classList.toggle("on", i === index));
  };
  track.addEventListener("scroll", mark, { passive: true });
  mark();
});

// Pfeile für das Leistungs-Karussell
const servicesTrack = document.querySelector(".services");
const carButtons = document.querySelectorAll(".car-btn");
if (servicesTrack && carButtons.length) {
  const update = () => {
    const max = servicesTrack.scrollWidth - servicesTrack.clientWidth - 4;
    carButtons[0].disabled = servicesTrack.scrollLeft <= 4;
    carButtons[1].disabled = servicesTrack.scrollLeft >= max;
  };
  carButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const card = servicesTrack.querySelector(".service");
      const step = card ? card.offsetWidth + 24 : servicesTrack.clientWidth;
      servicesTrack.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduceMotion ? "auto" : "smooth" });
    })
  );
  servicesTrack.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// Hero-Karten: fahren beim Scrollen hoch, fächern weiter auf, kippen mit der Maus
const stage = document.querySelector(".stage");
if (stage && !reduceMotion) {
  const cards = [...stage.querySelectorAll(".stage-card")];
  const heroEl = document.querySelector(".hero");
  let live = false;
  const goLive = () => {
    if (live) return;
    live = true;
    document.body.classList.add("stage-live");
  };
  // Erst nach dem Einfahren auf Scrollen und Maus reagieren
  setTimeout(goLive, 2600);

  const onScroll = () => {
    const r = heroEl.getBoundingClientRect();
    const p = Math.min(Math.max(-r.top / (r.height * 0.7), 0), 1);
    if (p > 0) goLive();
    cards.forEach((c) => {
      c.style.setProperty("--l", `${p * (innerWidth < 760 ? 24 : 130)}px`);
      c.style.setProperty("--s", String(1 + p * 0.35));
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (finePointer) {
    heroEl.addEventListener("pointermove", (e) => {
      const r = heroEl.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cards.forEach((c, i) => {
        const depth = 1 - Math.abs(Number(getComputedStyle(c).getPropertyValue("--k"))) * 0.2;
        c.style.setProperty("--px", String(x * 10 * depth));
        c.style.setProperty("--py", `${y * -14 * depth}px`);
      });
    });
    heroEl.addEventListener("pointerleave", () =>
      cards.forEach((c) => {
        c.style.setProperty("--px", "0");
        c.style.setProperty("--py", "0px");
      })
    );
  }
}
