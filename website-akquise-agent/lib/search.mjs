// Firmensuche über OpenStreetMap (kostenlos, kein API-Schlüssel nötig).
// 1. Nominatim wandelt den Ortsnamen in Koordinaten um.
// 2. Overpass liefert alle Betriebe mit Namen im Umkreis.

const USER_AGENT = process.env.AKQUISE_USER_AGENT || "website-akquise-agent/1.0";
const NOMINATIM = process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org/search";
const OVERPASS = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";

// Deutsche Branchenbegriffe -> OSM-Tags
export const BRANCHEN = {
  friseur: ["shop=hairdresser"],
  kosmetik: ["shop=beauty", "shop=cosmetics"],
  nagelstudio: ["shop=beauty"],
  restaurant: ["amenity=restaurant"],
  cafe: ["amenity=cafe"],
  imbiss: ["amenity=fast_food"],
  bar: ["amenity=bar", "amenity=pub"],
  baecker: ["shop=bakery"],
  metzger: ["shop=butcher"],
  hotel: ["tourism=hotel", "tourism=guest_house"],
  arzt: ["amenity=doctors", "healthcare=doctor"],
  zahnarzt: ["amenity=dentist"],
  physio: ["healthcare=physiotherapist"],
  apotheke: ["amenity=pharmacy"],
  tierarzt: ["amenity=veterinary"],
  autowerkstatt: ["shop=car_repair"],
  autohaus: ["shop=car"],
  fahrschule: ["amenity=driving_school"],
  fitness: ["leisure=fitness_centre"],
  blumen: ["shop=florist"],
  schneider: ["craft=tailor", "shop=tailor"],
  optiker: ["shop=optician"],
  elektriker: ["craft=electrician"],
  maler: ["craft=painter"],
  schreiner: ["craft=carpenter", "craft=joiner"],
  dachdecker: ["craft=roofer"],
  sanitaer: ["craft=plumber", "craft=hvac"],
  handwerk: ["craft"],
  steuerberater: ["office=tax_advisor"],
  anwalt: ["office=lawyer"],
  immobilien: ["office=estate_agent"],
  versicherung: ["office=insurance"],
  einzelhandel: ["shop"],
};

const ALLE = ["shop", "craft", "office", "healthcare",
  "amenity=restaurant", "amenity=cafe", "amenity=doctors", "amenity=dentist",
  "amenity=veterinary", "amenity=driving_school", "tourism=hotel", "tourism=guest_house",
  "leisure=fitness_centre"];

function normalize(s) {
  return s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").trim();
}

export function resolveTags(branche, extraTag) {
  if (extraTag) return [extraTag];
  if (!branche || normalize(branche) === "alle") return ALLE;
  const key = normalize(branche);
  const hit = BRANCHEN[key] || Object.entries(BRANCHEN).find(([k]) => k.startsWith(key) || key.startsWith(k))?.[1];
  if (!hit) {
    throw new Error(`Unbekannte Branche "${branche}". Bekannt: ${Object.keys(BRANCHEN).join(", ")} – oder nutze --tag key=value`);
  }
  return hit;
}

export async function geocode(region) {
  const url = `${NOMINATIM}?format=json&limit=1&countrycodes=de,at,ch&q=${encodeURIComponent(region)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept-Language": "de" } });
  if (!res.ok) throw new Error(`Geocoding fehlgeschlagen (HTTP ${res.status})`);
  const data = await res.json();
  if (!data.length) throw new Error(`Region "${region}" nicht gefunden`);
  return { lat: Number(data[0].lat), lon: Number(data[0].lon), name: data[0].display_name };
}

function tagFilter(tag) {
  const [k, v] = tag.split("=");
  return v ? `["${k}"="${v}"]` : `["${k}"]`;
}

export function buildQuery(tags, lat, lon, radiusM) {
  const parts = tags.map((t) => `  nwr${tagFilter(t)}["name"](around:${radiusM},${lat},${lon});`).join("\n");
  return `[out:json][timeout:60];\n(\n${parts}\n);\nout center tags;`;
}

function cleanUrl(u) {
  if (!u) return null;
  u = u.trim().split(/[;\s]/)[0];
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = "http://" + u;
  return u;
}

export function toCompany(el) {
  const t = el.tags || {};
  const street = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" ");
  const city = [t["addr:postcode"], t["addr:city"]].filter(Boolean).join(" ");
  const kategorie = t.shop ? `shop=${t.shop}` : t.craft ? `craft=${t.craft}` : t.office ? `office=${t.office}`
    : t.amenity ? `amenity=${t.amenity}` : t.healthcare ? `healthcare=${t.healthcare}`
    : t.tourism ? `tourism=${t.tourism}` : t.leisure ? `leisure=${t.leisure}` : "";
  return {
    id: `${el.type}/${el.id}`,
    name: t.name,
    kategorie,
    adresse: [street, city].filter(Boolean).join(", "),
    telefon: t.phone || t["contact:phone"] || "",
    email: t.email || t["contact:email"] || "",
    website: cleanUrl(t.website || t["contact:website"] || t.url),
    facebook: t["contact:facebook"] || t.facebook || "",
    instagram: t["contact:instagram"] || "",
    oeffnungszeiten: t.opening_hours || "",
    osm: `https://www.openstreetmap.org/${el.type}/${el.id}`,
  };
}

export async function findCompanies({ region, branche, tag, radiusKm = 5, limit = 30 }) {
  const geo = await geocode(region);
  const tags = resolveTags(branche, tag);
  const query = buildQuery(tags, geo.lat, geo.lon, Math.round(radiusKm * 1000));
  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: { "User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass-Abfrage fehlgeschlagen (HTTP ${res.status}) – später erneut versuchen`);
  const data = await res.json();
  const seen = new Set();
  const companies = [];
  for (const el of data.elements || []) {
    const c = toCompany(el);
    const key = normalize(c.name);
    if (!c.name || seen.has(key)) continue;
    seen.add(key);
    companies.push(c);
  }
  // Firmen ohne Website zuerst, dann der Rest – bis zum Limit
  companies.sort((a, b) => (a.website ? 1 : 0) - (b.website ? 1 : 0));
  return { geo, companies: companies.slice(0, limit), total: companies.length };
}
