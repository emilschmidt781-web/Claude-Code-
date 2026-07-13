// Baut aus dem IIFE-Build (dist-single/app.js) eine einzige, vollständig
// eigenständige HTML-Datei nach dist-pages/index.html.
//
// Vorteil: kein separates JS/CSS, keine relativen/absoluten Pfade – die
// Seite funktioniert unter jedem Basispfad (z.B. GitHub Pages Projektseite)
// und sogar per Doppelklick über file://.

import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const jsPath = 'dist-single/app.js'
let js = readFileSync(jsPath, 'utf8')

// Eventuelle </script>-Sequenzen im Bundle neutralisieren.
js = js.replace(/<\/script/gi, '<\\/script')

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#0b7285" />
<meta name="description" content="Angel-App mit KI-Fischerkennung und Beißprognose – erkenne Fische per Foto und finde heraus, wann und wo du am besten angelst." />
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎣</text></svg>" />
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
