#!/bin/bash
# Startprogramm der Mac-App „Website-Akquise“.
# Fragt per Dialog nach Ort/Branche, ruft agent.mjs auf und öffnet den Bericht.

APP_RES="$(cd "$(dirname "$0")/../Resources" && pwd)"
AGENT="$APP_RES/agent/agent.mjs"
SUPPORT="$HOME/Library/Application Support/Website-Akquise"
OUT="$HOME/Documents/Akquise-Berichte"
KEYCHAIN_SERVICE="website-akquise-agent"
mkdir -p "$SUPPORT" "$OUT"
LOG="$SUPPORT/letzter-lauf.log"

dialog() { osascript -e "$1" 2>/dev/null; }
fail() { dialog "display alert \"Website-Akquise\" message \"$1\" as critical"; exit 1; }
notify() { dialog "display notification \"$1\" with title \"Website-Akquise\""; }
asq() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; } # für AppleScript-Strings

# --- Node.js finden (Apps aus dem Dock haben einen sehr kurzen PATH) ---
NODE=""
for c in /opt/homebrew/bin/node /usr/local/bin/node "$HOME"/.volta/bin/node "$HOME"/.nvm/versions/node/*/bin/node "$HOME"/.asdf/shims/node; do
  [ -x "$c" ] && NODE="$c"
done
[ -z "$NODE" ] && NODE="$(/bin/bash -lc 'command -v node' 2>/dev/null)"
if [ -z "$NODE" ]; then
  r=$(dialog 'display dialog "Für diese App wird Node.js benötigt (kostenlos). Jetzt die Download-Seite öffnen?" buttons {"Abbrechen", "Node.js laden"} default button 2 with title "Website-Akquise"')
  [[ "$r" == *"Node.js laden"* ]] && open "https://nodejs.org/de/download"
  exit 1
fi

# --- API-Schlüssel aus dem Schlüsselbund ---
KEY="$(security find-generic-password -s "$KEYCHAIN_SERVICE" -w 2>/dev/null)"
NOAI=""
if [ -z "$KEY" ]; then
  r=$(dialog 'display dialog "Für Verkaufsargumente braucht die App einen Claude-API-Schlüssel (console.anthropic.com).\n\nEr wird sicher im Mac-Schlüsselbund gespeichert." default answer "" with hidden answer buttons {"Ohne KI", "Speichern"} default button 2 with title "Website-Akquise"
  if button returned of result is "Speichern" then return text returned of result
  return "__OHNE__"')
  [ -z "$r" ] && exit 0
  if [ "$r" = "__OHNE__" ]; then NOAI="--no-ai"; else
    KEY="$r"
    security add-generic-password -U -s "$KEYCHAIN_SERVICE" -a "$USER" -w "$KEY" >/dev/null 2>&1
  fi
fi

# --- Letzte Eingaben merken ---
CFG="$SUPPORT/einstellungen"
[ -f "$CFG" ] && . "$CFG"
REGION="${REGION:-}"; BRANCHE="${BRANCHE:-alle}"; RADIUS="${RADIUS:-5}"; ABSENDER="${ABSENDER:-}"

REGION=$(dialog "text returned of (display dialog \"In welchem Ort oder Stadtteil soll gesucht werden?\" default answer \"$(asq "$REGION")\" buttons {\"Abbrechen\", \"Weiter\"} default button 2 cancel button 1 with title \"Website-Akquise\")")
[ -z "$REGION" ] && exit 0

LISTE='{"alle","friseur","kosmetik","restaurant","cafe","imbiss","baecker","metzger","hotel","arzt","zahnarzt","physio","tierarzt","autowerkstatt","autohaus","fahrschule","fitness","blumen","schneider","optiker","handwerk","elektriker","maler","schreiner","dachdecker","sanitaer","steuerberater","anwalt","immobilien","versicherung","einzelhandel"}'
B=$(dialog "choose from list $LISTE with prompt \"Welche Branche?\" default items {\"$BRANCHE\"} with title \"Website-Akquise\"")
[ -z "$B" ] || [ "$B" = "false" ] && exit 0
BRANCHE="$B"

RADIUS=$(dialog "text returned of (display dialog \"Umkreis in Kilometern:\" default answer \"$RADIUS\" buttons {\"Abbrechen\", \"Weiter\"} default button 2 cancel button 1 with title \"Website-Akquise\")")
[ -z "$RADIUS" ] && exit 0
RADIUS="${RADIUS//,/.}"

if [ -z "$NOAI" ] && [ -z "$ABSENDER" ]; then
  ABSENDER=$(dialog 'text returned of (display dialog "Dein Name und deine Agentur (für die E-Mail-Entwürfe):" default answer "" buttons {"Weiter"} default button 1 with title "Website-Akquise")')
fi

printf 'REGION=%q\nBRANCHE=%q\nRADIUS=%q\nABSENDER=%q\n' "$REGION" "$BRANCHE" "$RADIUS" "$ABSENDER" > "$CFG"

notify "Suche $BRANCHE in $REGION … das dauert 1–3 Minuten."

REPORT=$(ANTHROPIC_API_KEY="$KEY" "$NODE" "$AGENT" --region "$REGION" --branche "$BRANCHE" --radius "$RADIUS" \
  --absender "$ABSENDER" --out "$OUT" $NOAI 2>"$LOG" | tail -1)

if [ -n "$REPORT" ] && [ -f "$REPORT" ]; then
  notify "Fertig! Bericht wird geöffnet."
  open "$REPORT"
  [ -z "$NOAI" ] && grep -qE "authentication_error|invalid x-api-key" "$LOG" && {
    security delete-generic-password -s "$KEYCHAIN_SERVICE" >/dev/null 2>&1
    dialog 'display alert "Website-Akquise" message "Der API-Schlüssel wurde abgelehnt und gelöscht. Beim nächsten Start kannst du einen neuen eingeben."'
  }
else
  MSG=$(grep -v '^ *\[' "$LOG" | grep -iE "fehl|error|nicht|unbekannt" | tail -3 | tr '"' "'" )
  [ -z "$MSG" ] && MSG="Keine Unternehmen gefunden. Versuche einen größeren Umkreis oder eine andere Branche."
  r=$(dialog "display alert \"Website-Akquise\" message \"$(asq "$MSG")\" buttons {\"Protokoll zeigen\", \"OK\"} default button 2")
  [[ "$r" == *"Protokoll"* ]] && open -e "$LOG"
fi
exit 0
