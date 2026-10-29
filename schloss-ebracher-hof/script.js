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

// „Bewerben“ bei einer Stelle wählt diese Stelle im Formular vor
const jobSelect = document.getElementById("f-stelle");

document.querySelectorAll("[data-job]").forEach((link) =>
  link.addEventListener("click", () => {
    if (jobSelect) jobSelect.value = link.dataset.job;
  })
);

// Jahreszahl in der Fußzeile
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Kurzbewerbung: öffnet eine vorbereitete E-Mail, es geht nichts an einen Server
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
      `Stelle: ${data.get("anliegen")}`,
      `Gut erreichbar: ${String(data.get("nachricht") || "").trim() || "-"}`,
    ].join("\n");

    window.location.href =
      "mailto:info@seniorenheim-ebracher-hof.de" +
      `?subject=${encodeURIComponent(`Kurzbewerbung: ${data.get("anliegen")}`)}` +
      `&body=${encodeURIComponent(body)}`;

    status.textContent =
      "Ihr E-Mail-Programm öffnet sich mit der fertigen Bewerbung. Bitte noch auf Senden tippen. Oder rufen Sie einfach an: 09321 7613.";
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
