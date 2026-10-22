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
      toggle.setAttribute("aria-label", "Menü öffnen");
    })
  );
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
      /* nicht speicherbar – Einstellung gilt nur für diesen Besuch */
    }
  })
);

// Jahreszahl im Footer
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Rückruf-Formular: öffnet eine vorbereitete E-Mail, es wird nichts an einen Server gesendet
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
      status.textContent = "Bitte bestätigen Sie die Einwilligung zur Datenverarbeitung.";
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
      "Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Nachricht. Alternativ rufen Sie uns einfach an: 09321 7613.";
  });
}

// Inhalte beim Scrollen sanft einblenden
const revealed = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 }
  );
  revealed.forEach((el) => observer.observe(el));
} else {
  revealed.forEach((el) => el.classList.add("visible"));
}
