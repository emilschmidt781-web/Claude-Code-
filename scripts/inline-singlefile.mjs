// Baut aus dem IIFE-Build (dist-single/app.js) eine einzige, vollständig
// eigenständige HTML-Datei nach dist-pages/index.html – plus die für die
// Installation als App (PWA) nötigen Dateien (Manifest, Icons).
//
// Vorteil: das JS/CSS steckt komplett in der index.html (keine Pfadprobleme),
// die Seite funktioniert unter jedem Basispfad (z.B. GitHub Pages Projektseite)
// und lässt sich auf Handy/Tablet als App auf den Startbildschirm legen.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs'

const jsPath = 'dist-single/app.js'
let js = readFileSync(jsPath, 'utf8')

// Eventuelle </script>-Sequenzen im Bundle neutralisieren.
js = js.replace(/<\/script/gi, '<\\/script')

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="#0c8497" />
<meta name="description" content="Angel-App mit KI-Fischerkennung und Beißprognose – erkenne Fische per Foto und finde heraus, wann und wo du am besten angelst." />
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎣</text></svg>" />

<!-- Als App installierbar (PWA) -->
<link rel="manifest" href="manifest.webmanifest" />
<meta name="mobile-web-app-capable" content="yes" />

<!-- iPhone / iPad: „Zum Home-Bildschirm" -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Angel-App" />
<link rel="apple-touch-icon" href="icon-180.png" />

<title>🎣 Angel-App – Fischerkennung & Beißprognose</title>
</head>
<body>
<div id="root"></div>
<script>
${js}
</script>
</body>
</html>
`

mkdirSync('dist-pages', { recursive: true })
writeFileSync('dist-pages/index.html', html)
console.log(`dist-pages/index.html geschrieben (${html.length} Bytes)`)

// PWA-Dateien (von Vite aus public/ nach dist-single/ kopiert) mitnehmen.
const assets = ['manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png']
for (const name of assets) {
  const src = `dist-single/${name}`
  if (existsSync(src)) {
    copyFileSync(src, `dist-pages/${name}`)
    console.log(`  + ${name}`)
  } else {
    console.warn(`  ! ${name} fehlt in dist-single`)
  }
}
