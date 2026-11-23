#!/bin/bash
# Baut dist/Website-Akquise.app (+ ZIP zum Herunterladen).
#   bash mac/build-app.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
APP="$DIST/Website-Akquise.app"

rm -rf "$APP" "$DIST/Website-Akquise-Mac.zip"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/agent"

cp "$ROOT/mac/Info.plist" "$APP/Contents/Info.plist"
cp "$ROOT/mac/AppIcon.icns" "$APP/Contents/Resources/AppIcon.icns"
cp "$ROOT/mac/launcher.sh" "$APP/Contents/MacOS/Website-Akquise"
chmod +x "$APP/Contents/MacOS/Website-Akquise"

cp -R "$ROOT/agent.mjs" "$ROOT/lib" "$ROOT/package.json" "$ROOT/package-lock.json" "$APP/Contents/Resources/agent/"
(cd "$APP/Contents/Resources/agent" && npm ci --omit=dev --silent --no-audit --no-fund)

(cd "$DIST" && zip -qry "Website-Akquise-Mac.zip" "Website-Akquise.app")
echo "Fertig: $APP"
echo "ZIP:    $DIST/Website-Akquise-Mac.zip ($(du -h "$DIST/Website-Akquise-Mac.zip" | cut -f1))"
