import { Currency, DeliveryOrder, ParcelSize } from '@/types';

// Feature Flag for Moto Express Delivery
export const FEATURE_FLAGS = {
  ENABLE_MOTO_EXPRESS_DELIVERY: true,
  ENABLE_FLIGHTS_MVP: true,
  ENABLE_HOTELS_MVP: true,
  ENABLE_TRAIN_MVP: true,
};

// --- MOTO EXPRESS DELIVERY ENGINE ---
class MotoExpressDeliveryService {
  private orders = new Map<string, DeliveryOrder>();

  calculateDeliveryFare(parcelSize: ParcelSize, distanceKm: number, currency: Currency): number {
    let baseCdfMinor = 300000; // 3,000 CDF for ENVELOPE
    if (parcelSize === 'SMALL') baseCdfMinor = 450000; // 4,500 CDF
    if (parcelSize === 'MEDIUM') baseCdfMinor = 700000; // 7,000 CDF

    const distanceCdfMinor = Math.round(distanceKm * 80000); // 800 CDF/km
    const totalCdfMinor = baseCdfMinor + distanceCdfMinor;

    if (currency === 'USD') {
      return Math.round(totalCdfMinor / 2800);
    }
    return totalCdfMinor;
  }

  createDeliveryOrder(data: {
    senderId: string;
    senderName: string;
    senderPhone: string;
    recipientName: string;
    recipientPhone: string;
    pickupLandmark: string;
    dropoffLandmark: string;
    parcelSize: ParcelSize;
    currency: Currency;
    distanceKm: number;
  }): DeliveryOrder {
    const id = `DELIV-${Date.now()}`;
    const deliveryPin = `${Math.floor(Math.random() * 9000 + 1000)}`;
    const fareMinor = this.calculateDeliveryFare(data.parcelSize, data.distanceKm, data.currency);

    const order: DeliveryOrder = {
      id,
      senderId: data.senderId,
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      pickupLandmark: data.pickupLandmark,
      dropoffLandmark: data.dropoffLandmark,
      parcelSize: data.parcelSize,
      fareMinor,
      currency: data.currency,
      deliveryPin,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
    };

    this.orders.set(id, order);
    return order;
  }

  getOrder(id: string): DeliveryOrder | undefined {
    return this.orders.get(id);
  }

  confirmDeliveryWithPin(orderId: string, pin: string, proofPhotoUrl?: string): { success: boolean; message: string } {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, message: 'Colis introuvable' };

    if (order.deliveryPin !== pin.trim()) {
      return { success: false, message: 'Code PIN de livraison incorrect.' };
    }

    order.status = 'DELIVERED';
    order.proofPhotoUrl = proofPhotoUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300';
    this.orders.set(orderId, order);

    return { success: true, message: 'Colis livré avec succès et accusé de réception signé.' };
  }
}

export const motoExpressService = new MotoExpressDeliveryService();

// --- FLIGHTS MVP PROVIDER ---
export interface FlightOffer {
  id: string;
  airline: string;
  flightNumber: string;
  fromAirport: string;
  toAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  priceUSDMinor: number;
  aircraft: string;
}

export const MOCK_FLIGHTS: FlightOffer[] = [
  {
    id: 'fl-1',
    airline: 'Congo Airways',
    flightNumber: '8Z 210',
    fromAirport: 'Kinshasa (FIH - N\'djili)',
    toAirport: 'Lubumbashi (FBM - Luano)',
    departureTime: '08:30',
    arrivalTime: '11:45',
    duration: '2h 15m',
    priceUSDMinor: 24500, // $245.00
    aircraft: 'Airbus A320',
  },
  {
    id: 'fl-2',
    airline: 'CAA (Compagnie Africaine d\'Aviation)',
    flightNumber: 'BU 412',
    fromAirport: 'Kinshasa (FIH - N\'djili)',
    toAirport: 'Goma (GOM)',
    departureTime: '10:00',
    arrivalTime: '13:30',
    duration: '2h 30m',
    priceUSDMinor: 27500, // $275.00
    aircraft: 'Airbus A320',
  },
];

// --- HOTELS MVP PROVIDER ---
export interface HotelOffer {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  pricePerNightUSDMinor: number;
  imageUrl: string;
  amenities: string[];
}

export const MOCK_HOTELS: HotelOffer[] = [
  {
    id: 'ht-1',
    name: 'Fleuve Congo Hotel by Blazon Hotels',
    city: 'Kinshasa',
    address: '119 Boulevard Colonel Tshatshi, Gombe',
    rating: 4.8,
    reviewCount: 310,
    pricePerNightUSDMinor: 18500, // $185
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
    amenities: ['Vue Fleuve', 'Piscine', 'Wi-Fi Haut Débit', 'Navette Aéroport'],
  },
  {
    id: 'ht-2',
    name: 'Pullman Kinshasa Grand Hôtel',
    city: 'Kinshasa',
    address: '4 Avenue des Batetela, Gombe',
    rating: 4.7,
    reviewCount: 420,
    pricePerNightUSDMinor: 21000, // $210
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
    amenities: ['Spa & Gym', 'Piscine Extérieure', 'Restaurants gastronomiques'],
  },
  {
    id: 'ht-3',
    name: 'Grand Karavia Hotel',
    city: 'Lubumbashi',
    address: 'Route du Golf, Lubumbashi',
    rating: 4.8,
    reviewCount: 260,
    pricePerNightUSDMinor: 17500, // $175
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500',
    amenities: ['Au bord du Lac Tshombe', 'Court de tennis', 'Wi-Fi'],
  },
];

// --- TRAIN MVP PROVIDER (SNCC / ONATRA) ---
export interface TrainTrip {
  id: string;
  operator: string;
  trainName: string;
  fromStation: string;
  toStation: string;
  departureDays: string;
  duration: string;
  priceMinorCDF: number;
  classes: string[];
}

export const MOCK_TRAINS: TrainTrip[] = [
  {
    id: 'tr-1',
    operator: 'ONATRA',
    trainName: 'Express Kinshasa - Matadi',
    fromStation: 'Gare Centrale de Kinshasa (Gombe)',
    toStation: 'Gare Maritime de Matadi',
    departureDays: 'Mercredis et Samedis',
    duration: '7h 30m',
    priceMinorCDF: 2000000, // 20,000 CDF
    classes: ['1ère Classe Climatisée', '2ème Classe Confort'],
  },
  {
    id: 'tr-2',
    operator: 'SNCC',
    trainName: 'Le New Express Colombe (Lubumbashi - Kindu)',
    fromStation: 'Gare SNCC Lubumbashi',
    toStation: 'Gare de Kolwezi',
    departureDays: 'Lundis et Jeudis',
    duration: '6h 15m',
    priceMinorCDF: 3000000, // 30,000 CDF
    classes: ['Voiture Couchette', 'Voiture Siège VIP'],
  },
];
