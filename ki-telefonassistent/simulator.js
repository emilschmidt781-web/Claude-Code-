// Testen ohne Telefon: Das Gespräch läuft im Terminal per Tastatur.
import readline from "node:readline/promises";
import { antworten, BEGRUESSUNG } from "./assistant.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const anrufId = "simulator-" + Date.now();

console.log("📞 Simulierter Anruf (Strg+C zum Beenden)\n");
console.log(`🤖 ${BEGRUESSUNG}\n`);

while (true) {
  const gesagt = (await rl.question("🙂 Sie: ")).trim();
  if (!gesagt) continue;
  const { text, beenden } = await antworten(anrufId, gesagt, "Simulator");
  console.log(`\n🤖 ${text}\n`);
  if (beenden) {
    console.log("📴 Aufgelegt. Bestellungen stehen in bestellungen.json.");
    break;
  }
}
rl.close();
