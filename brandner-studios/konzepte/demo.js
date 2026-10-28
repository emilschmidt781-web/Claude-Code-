// Hinweisleiste „Design-Konzept von Brandner Studios“ für alle Beispielseiten
(function () {
  var bar = document.createElement("div");
  bar.className = "demo-bar";
  bar.setAttribute("role", "note");
  bar.innerHTML =
    '<span><i>Design-</i>Konzept von <b>Brandner Studios</b><i> – erfundener Betrieb</i></span>' +
    '<small><a href="../impressum.html">Impressum</a> · <a href="../datenschutz.html">Datenschutz</a></small>' +
    '<a class="demo-back" href="../index.html#arbeiten">Zurück</a>';
  document.body.appendChild(bar);
  document.body.style.paddingBottom = "72px";
  // Elemente mit data-reveal fahren beim Scrollen herein
  var els = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(function (el) { obs.observe(el); });
})();
