export interface PopularRouteData {
  slug: string;
  from: string;
  to: string;
  title: string;
  headline: string;
  metaTitle: string;
  metaDescription: string;
  distanceKm: number;
  roadName: string;
  averageDuration: string;
  priceFromCDF: string;
  priceFromUSD: string;
  priceMinorCDF: number;
  priceMinorUSD: number;
  featuredOperator: string;
  allOperators: {
    name: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    frequency: string;
  }[];
  departureStations: {
    name: string;
    city: string;
    area: string;
    address: string;
  }[];
  arrivalStations: {
    name: string;
    city: string;
    area: string;
    address: string;
  }[];
  dailySchedules: {
    departureTime: string;
    arrivalTime: string;
    operator: string;
    comfort: string;
    priceCDF: string;
    priceUSD: string;
  }[];
  amenities: string[];
  travelTips: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
  imageUrl: string;
}

export const POPULAR_BUS_ROUTES: PopularRouteData[] = [
  {
    slug: 'kinshasa-matadi',
    from: 'Kinshasa',
    to: 'Matadi',
    title: 'Bus Kinshasa — Matadi',
    headline: 'Voyagez de Kinshasa à Matadi en autocar VIP via la RN1 pavée',
    metaTitle: 'Bus Kinshasa — Matadi dès 35 000 CDF | Horaires, Tarifs & Réservation',
    metaDescription: 'Réservez votre billet de bus Kinshasa - Matadi en ligne dès 35 000 CDF (12.50 USD). 6 départs quotidiens climatisés, choix du siège et paiement Mobile Money sécurisé.',
    distanceKm: 352,
    roadName: 'Route Nationale 1 (RN1 bitumée)',
    averageDuration: '5h 30min',
    priceFromCDF: '35 000 CDF',
    priceFromUSD: '$12.50',
    priceMinorCDF: 3500000,
    priceMinorUSD: 1250,
    featuredOperator: 'Matadi Express VIP',
    allOperators: [
      { name: 'Matadi Express VIP', rating: 4.9, reviewCount: 2150, verified: true, frequency: '3 départs / jour' },
      { name: 'Classic Coach Congo', rating: 4.8, reviewCount: 1240, verified: true, frequency: '2 départs / jour' },
      { name: 'TRANSCO Interurbain', rating: 4.5, reviewCount: 3400, verified: true, frequency: '1 départ / jour' },
    ],
    departureStations: [
      { name: 'Gare Routière UPN / Pompage', city: 'Kinshasa', area: 'Ngaliema', address: 'Croisement Route de Matadi & Av. de l\'UPN' },
      { name: 'Gare Triomphale Palais du Peuple', city: 'Kinshasa', area: 'Lingwala', address: 'Boulevard Triomphal, face Stade des Martyrs' },
      { name: 'Gare Centrale de Gombe', city: 'Kinshasa', area: 'Gombe', address: 'Boulevard du 30 Juin' },
    ],
    arrivalStations: [
      { name: 'Gare Centrale de Matadi (Belvédère)', city: 'Matadi', area: 'Centre-ville', address: 'Avenue Kasa-Vubu, Belvédère' },
      { name: 'Terminus Port de Matadi', city: 'Matadi', area: 'Zone Portuaire', address: 'Face à la Direction Générale de l\'ONATRA' },
    ],
    dailySchedules: [
      { departureTime: '06:30', arrivalTime: '12:00', operator: 'Matadi Express VIP', comfort: 'VIP Climatisé', priceCDF: '35 000 CDF', priceUSD: '$12.50' },
      { departureTime: '08:00', arrivalTime: '14:00', operator: 'Classic Coach Congo', comfort: 'Express', priceCDF: '30 000 CDF', priceUSD: '$11.00' },
      { departureTime: '10:30', arrivalTime: '16:00', operator: 'Matadi Express VIP', comfort: 'VIP Climatisé', priceCDF: '35 000 CDF', priceUSD: '$12.50' },
      { departureTime: '13:30', arrivalTime: '19:30', operator: 'TRANSCO Interurbain', comfort: 'Standard', priceCDF: '25 000 CDF', priceUSD: '$9.00' },
      { departureTime: '15:30', arrivalTime: '21:00', operator: 'Classic Coach Congo', comfort: 'Express', priceCDF: '30 000 CDF', priceUSD: '$11.00' },
      { departureTime: '17:00', arrivalTime: '22:30', operator: 'Matadi Express VIP', comfort: 'VIP Soir', priceCDF: '35 000 CDF', priceUSD: '$12.50' },
    ],
    amenities: ['Climatisation intégrale', 'Wi-Fi 4G à bord', 'Prises USB pour recharger smartphones', 'Bagages 25 kg en soute inclus', 'Bouteille d\'eau minérale offerte', 'Sièges inclinables ergonomiques'],
    travelTips: [
      'Présentez-vous 30 minutes avant le départ pour l’enregistrement des bagages et la vérification du QR code.',
      'Téléchargez votre billet numérique ou conservez votre SMS de confirmation pour l’accès hors-ligne.',
      'Possibilité de payer par M-Pesa, Airtel Money, Orange Money ou en espèces au guichet.',
    ],
    faqs: [
      {
        question: 'Quelle est la durée moyenne du trajet en bus de Kinshasa à Matadi ?',
        answer: 'Le voyage dure en moyenne 5h30 à 6h00 grâce à la Route Nationale 1 (RN1) entièrement asphaltée. Des arrêts sanitaires sécurisés sont prévus à Kisantu ou Mbanza-Ngungu.',
      },
      {
        question: 'Quel est le prix du billet de bus Kinshasa - Matadi sur Transnumerica ?',
        answer: 'Les tarifs débutent à 25 000 CDF pour la classe Standard (TRANSCO) et s\'élèvent à 35 000 CDF (12.50 USD) pour les autocars VIP climatisés de Matadi Express avec Wi-Fi.',
      },
      {
        question: 'Comment payer mon billet de bus en Francs Congolais ?',
        answer: 'Vous pouvez régler instantanément par Mobile Money (Vodacom M-Pesa, Airtel Money, Orange Money, Africell Money) avec confirmation USSD sur votre téléphone, ou en espèces à la gare.',
      },
      {
        question: 'Mon billet avec QR code fonctionne-t-il sans connexion internet à la gare ?',
        answer: 'Oui ! Tous les billets Transnumerica sont sauvegardés localement dans votre navigateur et compatibles avec l\'application PWA hors-ligne. Le QR code peut être scanné même sans réseau 3G/4G.',
      },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'lubumbashi-kolwezi',
    from: 'Lubumbashi',
    to: 'Kolwezi',
    title: 'Bus Lubumbashi — Kolwezi',
    headline: 'Liaison directe dans le corridor minier Haut-Katanga & Lualaba',
    metaTitle: 'Bus Lubumbashi — Kolwezi dès 45 000 CDF | Horaires & Billets',
    metaDescription: 'Réservez votre place de bus Lubumbashi - Kolwezi dès 45 000 CDF (16.00 USD). Autocars VIP avec Katanga Horizon, climatisation renforcée et paiement Mobile Money.',
    distanceKm: 310,
    roadName: 'Route Nationale 39 (RN39 via Likasi)',
    averageDuration: '5h 30min',
    priceFromCDF: '45 000 CDF',
    priceFromUSD: '$16.00',
    priceMinorCDF: 4500000,
    priceMinorUSD: 1600,
    featuredOperator: 'Katanga Horizon',
    allOperators: [
      { name: 'Katanga Horizon', rating: 4.8, reviewCount: 1420, verified: true, frequency: '4 départs / jour' },
      { name: 'Lualaba Express', rating: 4.7, reviewCount: 960, verified: true, frequency: '2 départs / jour' },
      { name: 'Classic Coach Congo', rating: 4.6, reviewCount: 1100, verified: true, frequency: '2 départs / jour' },
    ],
    departureStations: [
      { name: 'Gare SNCC Lubumbashi', city: 'Lubumbashi', area: 'Centre', address: 'Avenue des Usines, Quartier Industriel' },
      { name: 'Terminal Likasi-Kolwezi Carrefour', city: 'Lubumbashi', area: 'Kamalondo', address: 'Avenue Laurent Désiré Kabila' },
    ],
    arrivalStations: [
      { name: 'Terminal Rond-point Mwangeji', city: 'Kolwezi', area: 'Mwangeji', address: 'Avenue du 30 Juin, Rond-point Mwangeji' },
      { name: 'Gare Routière Centrale de Kolwezi', city: 'Kolwezi', area: 'Dilala', address: 'Boulevard Lumumba, face Hôtel de Ville' },
    ],
    dailySchedules: [
      { departureTime: '06:00', arrivalTime: '11:30', operator: 'Katanga Horizon', comfort: 'VIP Grand Confort', priceCDF: '45 000 CDF', priceUSD: '$16.00' },
      { departureTime: '08:30', arrivalTime: '14:00', operator: 'Lualaba Express', comfort: 'Express Climatise', priceCDF: '42 000 CDF', priceUSD: '$15.00' },
      { departureTime: '11:00', arrivalTime: '16:30', operator: 'Katanga Horizon', comfort: 'VIP Grand Confort', priceCDF: '45 000 CDF', priceUSD: '$16.00' },
      { departureTime: '14:00', arrivalTime: '19:30', operator: 'Classic Coach Congo', comfort: 'Standard', priceCDF: '38 000 CDF', priceUSD: '$13.50' },
    ],
    amenities: ['Climatisation grand débit', 'Wi-Fi Starlink haut débit', 'Sièges en cuir inclinables', 'Prises de charge 220V/USB', 'Boisson et collation offertes'],
    travelTips: [
      'La RN39 dessert également la ville de Likasi à mi-parcours (environ 2h de trajet).',
      'Paiement sécurisé par M-Pesa, Airtel Money et cartes bancaires congolaises.',
      'Possibilité de réserver un siège côté fenêtre ou couloir selon votre préférence.',
    ],
    faqs: [
      {
        question: 'Combien de temps faut-il pour rejoindre Kolwezi depuis Lubumbashi en autocar ?',
        answer: 'Le trajet dure environ 5h30 à 6h00 via Likasi. La route est entièrement asphaltée avec des postes de contrôle fluidifiés pour les opérateurs agréés Transnumerica.',
      },
      {
        question: 'Quels sont les horaires de départ des bus Lubumbashi - Kolwezi ?',
        answer: 'Les départs s\'échelonnent du matin 06h00 jusqu\'en début d\'après-midi 14h00 pour garantir une arrivée de jour à Kolwezi en toute sécurité.',
      },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'kinshasa-kikwit',
    from: 'Kinshasa',
    to: 'Kikwit',
    title: 'Bus Kinshasa — Kikwit',
    headline: 'Liaison directe de la capitale vers le Grand Bandundu et le Kwilu',
    metaTitle: 'Bus Kinshasa — Kikwit dès 40 000 CDF | Horaires & Billets',
    metaDescription: 'Voyagez de Kinshasa à Kikwit en autocar longue distance dès 40 000 CDF (14.50 USD). Départs quotidiens de Masina avec Classic Coach Congo et paiement Mobile Money.',
    distanceKm: 525,
    roadName: 'Route Nationale 1 Est (RN1 Kwango - Kwilu)',
    averageDuration: '8h 00min',
    priceFromCDF: '40 000 CDF',
    priceFromUSD: '$14.50',
    priceMinorCDF: 4000000,
    priceMinorUSD: 1450,
    featuredOperator: 'Classic Coach Congo',
    allOperators: [
      { name: 'Classic Coach Congo', rating: 4.7, reviewCount: 890, verified: true, frequency: '2 départs / jour' },
      { name: 'Grand Bandundu Express', rating: 4.6, reviewCount: 650, verified: true, frequency: '1 départ / jour' },
    ],
    departureStations: [
      { name: 'Gare Masina Sans-Fil', city: 'Kinshasa', area: 'Masina', address: 'Boulevard Lumumba, Arrêt Sans-Fil' },
      { name: 'Gare Triomphale', city: 'Kinshasa', area: 'Lingwala', address: 'Face Stade des Martyrs' },
    ],
    arrivalStations: [
      { name: 'Gare Centrale de Kikwit', city: 'Kikwit', area: 'Kikwit 1', address: 'Avenue de la Paix, Grand Marché' },
    ],
    dailySchedules: [
      { departureTime: '06:00', arrivalTime: '14:00', operator: 'Classic Coach Congo', comfort: 'Longue Distance VIP', priceCDF: '40 000 CDF', priceUSD: '$14.50' },
      { departureTime: '07:30', arrivalTime: '15:30', operator: 'Grand Bandundu Express', comfort: 'Standard Climatisé', priceCDF: '38 000 CDF', priceUSD: '$13.50' },
    ],
    amenities: ['Climatisation renforcée', 'Pause déjeuner à Kenge', 'Bagage soute 30 kg inclus', 'Siège inclinable haute densité'],
    travelTips: [
      'Départ très tôt le matin conseillé pour profiter du voyage de jour.',
      'Arrêt restauration prévu à Kenge pour le déjeuner en toute convivialité.',
    ],
    faqs: [
      {
        question: 'Quel est l’état de la route entre Kinshasa et Kikwit ?',
        answer: 'La RN1 est asphaltée sur la totalité du tronçon traversant le Kwango et le Kwilu, permettant un trajet sécurisé en 8h.',
      },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'goma-bukavu',
    from: 'Goma',
    to: 'Bukavu',
    title: 'Navette & Bateau Goma — Bukavu',
    headline: 'Traversée rapide du Lac Kivu et navettes terrestres interurbaines',
    metaTitle: 'Goma — Bukavu dès 50 000 CDF | Bateaux Rapides & Navettes',
    metaDescription: 'Réservez votre trajet Goma - Bukavu en vedette rapide dès 50 000 CDF (18.00 USD). Traversée sécurisée en 3h sur le Lac Kivu avec Vedette Lac Kivu.',
    distanceKm: 105,
    roadName: 'Voie lacustre sécurisée Lac Kivu & RN2',
    averageDuration: '3h 00min',
    priceFromCDF: '50 000 CDF',
    priceFromUSD: '$18.00',
    priceMinorCDF: 5000000,
    priceMinorUSD: 1800,
    featuredOperator: 'Vedettes Lac Kivu Express',
    allOperators: [
      { name: 'Vedettes Lac Kivu Express', rating: 4.9, reviewCount: 1850, verified: true, frequency: '4 liaisons / jour' },
      { name: 'Kivu Shuttle VIP', rating: 4.8, reviewCount: 940, verified: true, frequency: '2 liaisons / jour' },
    ],
    departureStations: [
      { name: 'Port Public de Goma', city: 'Goma', area: 'Quartier Les Volcans', address: 'Avenue du Port, bord du Lac Kivu' },
    ],
    arrivalStations: [
      { name: 'Port de Bukavu (Ibanda)', city: 'Bukavu', area: 'Ibanda', address: 'Avenue Maniema, Port d\'Ibanda' },
    ],
    dailySchedules: [
      { departureTime: '07:30', arrivalTime: '10:30', operator: 'Vedettes Lac Kivu Express', comfort: 'Vedette Rapide VIP', priceCDF: '50 000 CDF', priceUSD: '$18.00' },
      { departureTime: '11:00', arrivalTime: '14:00', operator: 'Kivu Shuttle VIP', comfort: 'Bateau Express', priceCDF: '50 000 CDF', priceUSD: '$18.00' },
      { departureTime: '14:30', arrivalTime: '17:30', operator: 'Vedettes Lac Kivu Express', comfort: 'Vedette Rapide VIP', priceCDF: '50 000 CDF', priceUSD: '$18.00' },
    ],
    amenities: ['Gilets de sauvetage certifiés', 'Salon VIP climatisé', 'Wi-Fi à bord', 'Vue panoramique sur les îles du Lac Kivu'],
    travelTips: [
      'Munissez-vous de votre pièce d\'identité pour les formalités portuaires rapides.',
      'Possibilité de réserver des places en salon VIP supérieur avec service boisson.',
    ],
    faqs: [
      {
        question: 'Quelle est la durée de la traversée entre Goma et Bukavu ?',
        answer: 'En vedette rapide moderne, la traversée du Lac Kivu prend exactement 3 heures, évitant ainsi les contraintes routières.',
      },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  },
];

export function getRouteBySlug(slug: string): PopularRouteData | undefined {
  return POPULAR_BUS_ROUTES.find((r) => r.slug.toLowerCase() === slug.toLowerCase());
}
