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

// Einblend-Animationen beim Scrollen
const revealItems = document.querySelectorAll(".reveal");
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
  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("visible"));
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
