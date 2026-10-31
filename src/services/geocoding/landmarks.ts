import { Landmark } from '@/types';

export const DRC_LANDMARKS: Landmark[] = [
  // --- KINSHASA ---
  {
    id: 'kin-victoire',
    name: 'Rond-point Victoire',
    cityName: 'Kinshasa',
    commune: 'Kalamu',
    popularReference: 'Près du monument des artistes & arrêt bus Matonge',
    latitude: -4.3364,
    longitude: 15.3175,
    category: 'ROUNDABOUT',
  },
  {
    id: 'kin-gare-centrale',
    name: 'Gare Centrale',
    cityName: 'Kinshasa',
    commune: 'Gombe',
    popularReference: 'Boulevard du 30 Juin, en face de l\'immeuble CTC',
    latitude: -4.3032,
    longitude: 15.3129,
    category: 'TRANSPORT',
  },
  {
    id: 'kin-huileries',
    name: 'Arrêt Huileries',
    cityName: 'Kinshasa',
    commune: 'Lingwala',
    popularReference: 'Intersection Huileries & Triomphal, face Palais du Peuple',
    latitude: -4.3218,
    longitude: 15.3056,
    category: 'TRANSPORT',
  },
  {
    id: 'kin-upn',
    name: 'Rond-point UPN',
    cityName: 'Kinshasa',
    commune: 'Ngaliema',
    popularReference: 'Entrée Université Pédagogique Nationale, arrêt Pompage',
    latitude: -4.3948,
    longitude: 15.2341,
    category: 'ROUNDABOUT',
  },
  {
    id: 'kin-marche-central',
    name: 'Grand Marché (Zando)',
    cityName: 'Kinshasa',
    commune: 'Kinshasa',
    popularReference: 'Avenue Kasa-Vubu & Rwakadingi, près station Total',
    latitude: -4.3149,
    longitude: 15.3114,
    category: 'COMMERCIAL',
  },
  {
    id: 'kin-kintambo-magasin',
    name: 'Kintambo Magasin',
    cityName: 'Kinshasa',
    commune: 'Kintambo',
    popularReference: 'Grand carrefour vers Ngaliema et Bandalungwa',
    latitude: -4.3312,
    longitude: 15.2691,
    category: 'ROUNDABOUT',
  },
  {
    id: 'kin-ndjili-aeroport',
    name: 'Aéroport International de N\'djili',
    cityName: 'Kinshasa',
    commune: 'Nsele',
    popularReference: 'Terminal Passagers & Parking VIP',
    latitude: -4.3858,
    longitude: 15.4446,
    category: 'TRANSPORT',
  },
  {
    id: 'kin-palais-du-peuple',
    name: 'Palais du Peuple',
    cityName: 'Kinshasa',
    commune: 'Lingwala',
    popularReference: 'Boulevard Triomphal, Stade des Martyrs',
    latitude: -4.3298,
    longitude: 15.3025,
    category: 'GOVERNMENT',
  },
  {
    id: 'kin-limete-1ere-rue',
    name: 'Limete 1ère Rue (Échangeur)',
    cityName: 'Kinshasa',
    commune: 'Limete',
    popularReference: 'Sous l\'Échangeur de Limete, Boulevard Lumumba',
    latitude: -4.3541,
    longitude: 15.3524,
    category: 'TRANSPORT',
  },

  // --- MATADI (KONGO CENTRAL) ---
  {
    id: 'mat-port',
    name: 'Port de Matadi',
    cityName: 'Matadi',
    popularReference: 'Gare maritime ONATRA & centre-ville',
    latitude: -5.8197,
    longitude: 13.4502,
    category: 'TRANSPORT',
  },
  {
    id: 'mat-rond-point-belvedere',
    name: 'Rond-point Belvédère',
    cityName: 'Matadi',
    popularReference: 'Entrée de la ville, vue sur le fleuve Congo',
    latitude: -5.8271,
    longitude: 13.4619,
    category: 'ROUNDABOUT',
  },

  // --- LUBUMBASHI (HAUT-KATANGA) ---
  {
    id: 'lshi-gare',
    name: 'Gare SNCC Lubumbashi',
    cityName: 'Lubumbashi',
    popularReference: 'Avenue Lumumba, centre d\'affaires',
    latitude: -11.6609,
    longitude: 27.4854,
    category: 'TRANSPORT',
  },
  {
    id: 'lshi-carrefour',
    name: 'Carrefour Kamalondo',
    cityName: 'Lubumbashi',
    commune: 'Kamalondo',
    popularReference: 'Près du Stade TP Mazembe',
    latitude: -11.6748,
    longitude: 27.4721,
    category: 'ROUNDABOUT',
  },

  // --- KOLWEZI (LUALABA) ---
  {
    id: 'kol-mwangeji',
    name: 'Rond-point Mwangeji',
    cityName: 'Kolwezi',
    popularReference: 'Sortie vers Likasi / Lubumbashi',
    latitude: -10.7183,
    longitude: 25.4729,
    category: 'ROUNDABOUT',
  },

  // --- GOMA (NORD-KIVU) ---
  {
    id: 'goma-rond-point-bdgl',
    name: 'Rond-point BDGL',
    cityName: 'Goma',
    popularReference: 'Proche du Lac Kivu et du port public',
    latitude: -1.6792,
    longitude: 29.2285,
    category: 'ROUNDABOUT',
  },
  {
    id: 'goma-aeroport',
    name: 'Aéroport International de Goma',
    cityName: 'Goma',
    popularReference: 'Boulevard Kanyamuhanga',
    latitude: -1.6706,
    longitude: 29.2384,
    category: 'TRANSPORT',
  },
];

/**
 * Search landmarks by query (name, reference, or commune)
 */
export function searchLandmarks(query: string, cityFilter?: string): Landmark[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    if (cityFilter) {
      return DRC_LANDMARKS.filter(
        (l) => l.cityName.toLowerCase() === cityFilter.toLowerCase()
      ).slice(0, 8);
    }
    return DRC_LANDMARKS.slice(0, 8);
  }

  return DRC_LANDMARKS.filter((l) => {
    const matchesCity = !cityFilter || l.cityName.toLowerCase() === cityFilter.toLowerCase();
    const matchesText =
      l.name.toLowerCase().includes(q) ||
      l.cityName.toLowerCase().includes(q) ||
      (l.commune && l.commune.toLowerCase().includes(q)) ||
      (l.popularReference && l.popularReference.toLowerCase().includes(q));
    return matchesCity && matchesText;
  });
}

/**
 * Calculate approximate distance in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.max(0.8, Math.round(d * 10) / 10);
}
