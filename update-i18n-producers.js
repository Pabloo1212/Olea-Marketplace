const fs = require('fs');
const path = require('path');

const locales = ['es', 'en', 'it', 'de'];
const producerTranslations = {
  es: {
    backToList: "Volver a productores",
    atelierLabel: "Atelier Oficial",
    foundedIn: "Fundado en",
    region: "Región",
    aboutProducer: "La historia detrás del aceite",
    contactB2B: "Contactar para distribución B2B",
    ourOils: "Nuestra Colección de Aceites",
    verifiedProducer: "Productor Verificado",
    followProducer: "Seguir Productor",
    statsTrees: "Olivos centenarios",
    statsAwards: "Premios internacionales",
    statsExperience: "Años de tradición"
  },
  en: {
    backToList: "Back to producers",
    atelierLabel: "Official Atelier",
    foundedIn: "Founded in",
    region: "Region",
    aboutProducer: "The story behind the oil",
    contactB2B: "Contact for B2B distribution",
    ourOils: "Our Oil Collection",
    verifiedProducer: "Verified Producer",
    followProducer: "Follow Producer",
    statsTrees: "Centenary olive trees",
    statsAwards: "International awards",
    statsExperience: "Years of tradition"
  },
  it: {
    backToList: "Torna ai produttori",
    atelierLabel: "Atelier Ufficiale",
    foundedIn: "Fondato nel",
    region: "Regione",
    aboutProducer: "La storia dietro l'olio",
    contactB2B: "Contatta per distribuzione B2B",
    ourOils: "La Nostra Collezione di Oli",
    verifiedProducer: "Produttore Verificato",
    followProducer: "Segui Produttore",
    statsTrees: "Ulivi secolari",
    statsAwards: "Premi internazionali",
    statsExperience: "Anni di tradizione"
  },
  de: {
    backToList: "Zurück zu Produzenten",
    atelierLabel: "Offizielles Atelier",
    foundedIn: "Gegründet in",
    region: "Region",
    aboutProducer: "Die Geschichte hinter dem Öl",
    contactB2B: "Kontakt für B2B-Vertrieb",
    ourOils: "Unsere Ölkollektion",
    verifiedProducer: "Verifizierter Produzent",
    followProducer: "Produzenten folgen",
    statsTrees: "Hundertjährige Olivenbäume",
    statsAwards: "Internationale Auszeichnungen",
    statsExperience: "Jahre Tradition"
  }
};

locales.forEach(loc => {
  const filePath = path.join(__dirname, `src/messages/${loc}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.producerProfile = producerTranslations[loc];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${loc}.json with producer profile strings`);
  }
});
