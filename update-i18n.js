const fs = require('fs');
const path = require('path');

const locales = ['es', 'en', 'it', 'de'];
const rankingTranslations = {
  es: {
    title: "OliveMarket Index",
    subtitle: "Los 10 mejores aceites de oliva del mundo, clasificados por expertos y la comunidad.",
    position: "Puesto #{pos}",
    omiScore: "Puntuación OMI",
    scoreDetails: "{rating}/5 Estrellas · {reviews} Reseñas",
    buyNow: "Comprar",
    medalGold: "Oro",
    medalSilver: "Plata",
    medalBronze: "Bronce",
    viewProduct: "Ver aceite"
  },
  en: {
    title: "OliveMarket Index",
    subtitle: "The top 10 olive oils in the world, ranked by experts and the community.",
    position: "Rank #{pos}",
    omiScore: "OMI Score",
    scoreDetails: "{rating}/5 Stars · {reviews} Reviews",
    buyNow: "Buy now",
    medalGold: "Gold",
    medalSilver: "Silver",
    medalBronze: "Bronze",
    viewProduct: "View oil"
  },
  it: {
    title: "OliveMarket Index",
    subtitle: "I 10 migliori oli d'oliva al mondo, classificati da esperti e dalla comunità.",
    position: "Posizione #{pos}",
    omiScore: "Punteggio OMI",
    scoreDetails: "{rating}/5 Stelle · {reviews} Recensioni",
    buyNow: "Compra ora",
    medalGold: "Oro",
    medalSilver: "Argento",
    medalBronze: "Bronzo",
    viewProduct: "Vedi olio"
  },
  de: {
    title: "OliveMarket Index",
    subtitle: "Die 10 besten Olivenöle der Welt, bewertet von Experten und der Community.",
    position: "Platz #{pos}",
    omiScore: "OMI-Punkte",
    scoreDetails: "{rating}/5 Sterne · {reviews} Bewertungen",
    buyNow: "Jetzt kaufen",
    medalGold: "Gold",
    medalSilver: "Silber",
    medalBronze: "Bronze",
    viewProduct: "Öl ansehen"
  }
};

locales.forEach(loc => {
  const filePath = path.join(__dirname, `src/messages/${loc}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.ranking = rankingTranslations[loc];
    
    // Also add "Ranking" to the nav section
    const navText = { es: "Ranking", en: "Ranking", it: "Classifica", de: "Rangliste" };
    data.nav.ranking = navText[loc];
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${loc}.json`);
  }
});
