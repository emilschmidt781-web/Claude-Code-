// Baut index.html (eigenständige Web-App fürs Handy) aus app.html.
// app.html ist zugleich die Vorlage für die Claude-Artifact-Version.
import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL(".", import.meta.url);
const app = readFileSync(new URL("app.html", dir), "utf8");
const head = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Hantelbuch">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;
writeFileSync(new URL("index.html", dir), `<!-- Automatisch erzeugt aus app.html: node gym-tracker/build.mjs -->\n${head}${app}\n</body>\n</html>\n`);
console.log("index.html geschrieben");
