document.documentElement.classList.add("js");

// Menü auf Handy und Tablet
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");

if (menuToggle && menu) {
  const close = () => {
    menu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };
  menuToggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

// Schriftgröße umschalten und merken (Speicher kann im privaten Modus fehlen)
const sizeButtons = document.querySelectorAll(".text-size button");

function applySize(size) {
  if (size === "large") document.documentElement.dataset.size = "large";
  else delete document.documentElement.dataset.size;
  sizeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.size === size)));
}

try {
  applySize(localStorage.getItem("ebracher-schrift") || "normal");
} catch {
  applySize("normal");
}

sizeButtons.forEach((button) =>
  button.addEventListener("click", () => {
    applySize(button.dataset.size);
    try {
      localStorage.setItem("ebracher-schrift", button.dataset.size);
    } catch {
      /* nicht speicherbar – gilt nur für diesen Besuch */
    }
  })
);

// Rundgang: Station wählen, Zeichnung, Farbe und Text wechseln
const stage = document.querySelector(".tour-stage");
const stationButtons = document.querySelectorAll(".tour-list button");

if (stage) {
  const pic = stage.querySelector(".tour-pic");
  const use = pic.querySelector("use");
  const title = pic.querySelector("title");
  const fact = stage.querySelector(".tour-fact");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  stationButtons.forEach((button) =>
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;
      stationButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      stage.dataset.field = button.dataset.field;
      const swap = () => {
        use.setAttribute("href", "#" + button.dataset.pic);
        title.textContent = button.dataset.title;
        fact.textContent = button.dataset.fact;
        pic.classList.remove("is-swapping");
      };
      if (reduce) return swap();
      pic.classList.add("is-swapping");
      setTimeout(swap, 300);
    })
  );
}

// Aufnahme: ein Schritt ist offen
const steps = document.querySelectorAll(".accordion li");

steps.forEach((step) =>
  step.querySelector("button").addEventListener("click", () => {
    steps.forEach((s) => {
      const open = s === step;
      s.classList.toggle("is-open", open);
      s.querySelector("button").setAttribute("aria-expanded", String(open));
    });
  })
);

// Jahreszahl in der Fußzeile
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Rückruf-Formular: öffnet eine vorbereitete E-Mail, es geht nichts an einen Server
const form = document.getElementById("contact-form");

if (form) {
  const status = form.querySelector(".form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const telefon = String(data.get("telefon") || "").trim();

    if (!name || !telefon) {
      status.textContent = "Bitte geben Sie Ihren Namen und Ihre Telefonnummer an.";
      return;
    }
    if (!data.get("einwilligung")) {
      status.textContent = "Bitte bestätigen Sie, dass wir Ihre Angaben verwenden dürfen.";
      return;
    }

    const body = [
      `Name: ${name}`,
      `Telefon: ${telefon}`,
      `Anliegen: ${data.get("anliegen")}`,
      "",
      String(data.get("nachricht") || "").trim(),
    ].join("\n");

    window.location.href =
      "mailto:info@seniorenheim-ebracher-hof.de" +
      `?subject=${encodeURIComponent(`Rückrufbitte: ${data.get("anliegen")}`)}` +
      `&body=${encodeURIComponent(body)}`;

    status.textContent =
      "Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht. Oder rufen Sie einfach an: 09321 7613.";
  });
}

// Abschnitte gestaffelt einblenden: Überschrift, dann Text, dann Bild
const revealed = document.querySelectorAll(".reveal");

document.querySelectorAll("section").forEach((section) =>
  section.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--d", i))
);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.15 }
  );
  revealed.forEach((el) => observer.observe(el));
} else {
  revealed.forEach((el) => el.classList.add("visible"));
}
