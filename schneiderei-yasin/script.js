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

// Heutigen Tag hervorheben und "Jetzt geöffnet" anzeigen.
// Die Zeiten werden direkt aus der Tabelle gelesen, damit sie nur an einer Stelle gepflegt werden.
const hours = document.getElementById("hours");
const status = document.getElementById("open-status");

if (hours && status) {
  // Uhrzeit in Würzburg (Europe/Berlin), unabhängig von der Zeitzone des Besuchers
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));

  const row = hours.querySelector(`tr[data-day="${day}"]`);
  if (row) {
    row.classList.add("today");
    // Ein Tag kann mehrere Zeitfenster haben (z. B. mit Mittagspause)
    const ranges = row.querySelector("td").textContent.matchAll(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/g);
    const open = [...ranges].some(
      (m) => minutes >= Number(m[1]) * 60 + Number(m[2]) && minutes < Number(m[3]) * 60 + Number(m[4])
    );
    status.textContent = open ? "Jetzt geöffnet" : "Derzeit geschlossen";
    status.classList.add(open ? "is-open" : "is-closed");
  }
}

// Sanftes Einblenden beim Scrollen
const revealTargets = document.querySelectorAll(".card, .steps li, .split > *, .faq details, .section-head");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}
