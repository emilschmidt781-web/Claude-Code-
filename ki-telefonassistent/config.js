// Hier passt du Restaurant, Speisekarte und Regeln an.

export const RESTAURANT = {
  name: "Pizzeria Bella Napoli",
  adresse: "Hauptstraße 12, 96047 Bamberg",
  oeffnungszeiten: "Di–So 11:30–22:00 Uhr, Montag Ruhetag",
  lieferung: {
    gebiet: "Bamberg Stadt (PLZ 96047, 96049, 96050, 96052)",
    mindestbestellwert: 15.0,
    liefergebuehr: 2.5,
    dauer: "ca. 40–50 Minuten",
  },
  abholung: { dauer: "ca. 20 Minuten" },
  zahlung: "Bar oder Karte an der Tür bzw. bei Abholung",
};

// Preise in Euro
export const SPEISEKARTE = [
  { nr: 1, kategorie: "Pizza", name: "Margherita", preis: 8.5, info: "Tomate, Mozzarella, Basilikum (vegetarisch)" },
  { nr: 2, kategorie: "Pizza", name: "Salami", preis: 9.9, info: "Tomate, Mozzarella, Salami" },
  { nr: 3, kategorie: "Pizza", name: "Funghi", preis: 9.5, info: "Tomate, Mozzarella, Champignons (vegetarisch)" },
  { nr: 4, kategorie: "Pizza", name: "Tonno", preis: 10.9, info: "Tomate, Mozzarella, Thunfisch, Zwiebeln" },
  { nr: 5, kategorie: "Pizza", name: "Diavola", preis: 10.9, info: "Tomate, Mozzarella, scharfe Salami, Peperoni (scharf)" },
  { nr: 6, kategorie: "Pizza", name: "Quattro Formaggi", preis: 11.5, info: "Vier Käsesorten (vegetarisch)" },
  { nr: 10, kategorie: "Pasta", name: "Spaghetti Bolognese", preis: 9.9, info: "Hackfleischsauce" },
  { nr: 11, kategorie: "Pasta", name: "Penne Arrabbiata", preis: 9.5, info: "Scharfe Tomatensauce (vegan)" },
  { nr: 12, kategorie: "Pasta", name: "Tagliatelle Carbonara", preis: 10.9, info: "Speck, Ei, Parmesan" },
  { nr: 20, kategorie: "Salat", name: "Insalata Mista", preis: 6.9, info: "Gemischter Salat (vegan)" },
  { nr: 21, kategorie: "Salat", name: "Caprese", preis: 8.5, info: "Tomate, Mozzarella, Basilikum" },
  { nr: 30, kategorie: "Getränk", name: "Cola 0,33 l", preis: 2.9, info: "" },
  { nr: 31, kategorie: "Getränk", name: "Wasser 0,5 l", preis: 2.5, info: "" },
  { nr: 32, kategorie: "Getränk", name: "Apfelschorle 0,5 l", preis: 3.2, info: "" },
  { nr: 40, kategorie: "Dessert", name: "Tiramisu", preis: 5.5, info: "" },
];

export const EXTRAS = [
  { name: "Extra Käse", preis: 1.5 },
  { name: "Extra Belag (je Zutat)", preis: 1.5 },
  { name: "Großes Format (40 cm) statt 30 cm", preis: 4.0 },
];
