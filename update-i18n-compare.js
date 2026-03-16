const fs = require('fs');
const path = require('path');

const locales = ['es', 'en', 'it', 'de'];
const compareTranslations = {
  es: {
    title: "Tasting Room",
    subtitle: "Compara hasta 3 aceites de oliva lado a lado para encontrar tu perfil de sabor perfecto.",
    selectPlaceholder: "Añadir un aceite para comparar...",
    fruitiness: "Frutado",
    bitterness: "Amargo",
    pungency: "Picante",
    complexity: "Complejidad",
    sweetness: "Suavidad",
    addBtn: "Comparar aceite",
    removeBtn: "Quitar",
    buyBtn: "Añadir al carrito",
    sensoryProfile: "Perfil Sensorial",
    details: "Detalles",
    price: "Precio",
    emptySlot: "Espacio disponible"
  },
  en: {
    title: "Tasting Room",
    subtitle: "Compare up to 3 olive oils side-by-side to find your perfect flavor profile.",
    selectPlaceholder: "Add an oil to compare...",
    fruitiness: "Fruitiness",
    bitterness: "Bitterness",
    pungency: "Pungency",
    complexity: "Complexity",
    sweetness: "Smoothness",
    addBtn: "Compare oil",
    removeBtn: "Remove",
    buyBtn: "Add to cart",
    sensoryProfile: "Sensory Profile",
    details: "Details",
    price: "Price",
    emptySlot: "Available slot"
  },
  it: {
    title: "Tasting Room",
    subtitle: "Confronta fino a 3 oli d'oliva fianco a fianco per trovare il tuo profilo di sapore perfetto.",
    selectPlaceholder: "Aggiungi un olio per confrontare...",
    fruitiness: "Fruttato",
    bitterness: "Amaro",
    pungency: "Piccante",
    complexity: "Complessità",
    sweetness: "Morbidezza",
    addBtn: "Confronta olio",
    removeBtn: "Rimuovi",
    buyBtn: "Aggiungi al carrello",
    sensoryProfile: "Profilo Sensoriale",
    details: "Dettagli",
    price: "Prezzo",
    emptySlot: "Spazio disponibile"
  },
  de: {
    title: "Tasting Room",
    subtitle: "Vergleichen Sie bis zu 3 Olivenöle nebeneinander, um Ihr perfektes Geschmacksprofil zu finden.",
    selectPlaceholder: "Fügen Sie ein Öl zum Vergleichen hinzu...",
    fruitiness: "Fruchtigkeit",
    bitterness: "Bitterkeit",
    pungency: "Schärfe",
    complexity: "Komplexität",
    sweetness: "Milde",
    addBtn: "Öl vergleichen",
    removeBtn: "Entfernen",
    buyBtn: "In den Warenkorb",
    sensoryProfile: "Sensorisches Profil",
    details: "Details",
    price: "Preis",
    emptySlot: "Freier Platz"
  }
};

locales.forEach(loc => {
  const filePath = path.join(__dirname, `src/messages/${loc}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.compare = compareTranslations[loc];
    
    // Also add "Compare" to the nav section
    const navText = { es: "Tasting Room", en: "Tasting Room", it: "Tasting Room", de: "Tasting Room" };
    data.nav.compare = navText[loc];
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${loc}.json with compare strings`);
  }
});
